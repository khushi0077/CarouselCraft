export interface Slide {
  id: string;
  content: string;
  type: 'hook' | 'content' | 'cta';
  order: number;
  suggestedEmojis?: Array<{ emoji: string; reason: string }>;
  selectedEmoji?: string;
}

export interface ParsedContent {
  slides: Slide[];
  suggestedTitle: string;
  hashtags: string[];
}

import { suggestEmojisForText } from './emojiSuggestions';
import { intelligentParse, enhanceWithContext, expandContent } from './aiContentExpander';

export type Tone = 'professional' | 'casual' | 'inspirational';

export async function parseContent(input: string, platform: string, tone: Tone = 'professional'): Promise<ParsedContent> {
  const analysis = intelligentParse(input);

  let processedInput = input;
  if (analysis.needsExpansion) {
    processedInput = await expandContent(input, tone, platform);
  }
  const lines = processedInput
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return {
      slides: [],
      suggestedTitle: 'Untitled Carousel',
      hashtags: []
    };
  }

  const bulletPoints = lines.filter(line =>
    line.startsWith('•') ||
    line.startsWith('-') ||
    line.startsWith('*') ||
    /^\d+\./.test(line)
  ).map(line => line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, ''));

  const paragraphs = lines.filter(line =>
    !line.startsWith('•') &&
    !line.startsWith('-') &&
    !line.startsWith('*') &&
    !/^\d+\./.test(line)
  );

  let contentItems: string[] = [];

  if (bulletPoints.length > 0) {
    contentItems = bulletPoints;
  } else if (paragraphs.length > 1) {
    contentItems = paragraphs;
  } else if (paragraphs.length === 1 && paragraphs[0].length > 200) {
    const sentences = paragraphs[0].match(/[^.!?]+[.!?]+/g) || [paragraphs[0]];
    contentItems = chunkSentences(sentences, 3);
  } else {
    contentItems = paragraphs;
  }

  const slideCount = Math.min(Math.max(contentItems.length + 2, 3), 10);
  const contentSlideCount = slideCount - 2;

  const slides: Slide[] = [];

  const title = contentItems[0]?.substring(0, 50) || 'Untitled';
  const hookContent = generateHook(contentItems[0] || input, platform, tone);
  const hookEmojis = suggestEmojisForText(hookContent);
  slides.push({
    id: '1',
    content: hookContent,
    type: 'hook',
    order: 1,
    suggestedEmojis: hookEmojis,
    selectedEmoji: hookEmojis[0]?.emoji
  });

  const chunkedContent = chunkContent(contentItems, contentSlideCount);
  chunkedContent.forEach((content, index) => {
    const contentEmojis = suggestEmojisForText(content);
    slides.push({
      id: String(index + 2),
      content: content,
      type: 'content',
      order: index + 2,
      suggestedEmojis: contentEmojis,
      selectedEmoji: contentEmojis[0]?.emoji
    });
  });

  const ctaContent = generateCTA(platform, tone);
  const ctaEmojis = suggestEmojisForText(ctaContent);
  slides.push({
    id: String(slideCount),
    content: ctaContent,
    type: 'cta',
    order: slideCount,
    suggestedEmojis: ctaEmojis,
    selectedEmoji: ctaEmojis[0]?.emoji
  });

  const hashtags = generateHashtags(input, platform);

  return {
    slides,
    suggestedTitle: title,
    hashtags
  };
}

function chunkSentences(sentences: string[], perChunk: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += perChunk) {
    chunks.push(sentences.slice(i, i + perChunk).join(' ').trim());
  }
  return chunks;
}

function chunkContent(items: string[], targetCount: number): string[] {
  if (items.length <= targetCount) {
    return items;
  }

  const chunks: string[] = [];
  const itemsPerChunk = Math.ceil(items.length / targetCount);

  for (let i = 0; i < items.length; i += itemsPerChunk) {
    const chunk = items.slice(i, i + itemsPerChunk);
    chunks.push(chunk.join('\n\n'));
  }

  return chunks;
}

function generateHook(firstContent: string, platform: string, tone: Tone): string {
  const extractedTitle = firstContent.match(/^\d+\s+(.+)/)?.[1] || firstContent.split('\n')[0];

  const hooks = {
    professional: {
      instagram: [
        `Key Insight:\n\n${extractedTitle}`,
        `Critical Analysis:\n\n${extractedTitle}`,
        `Industry Perspective:\n\n${extractedTitle}`,
        `Essential Knowledge:\n\n${extractedTitle}`
      ],
      linkedin: [
        `Professional Insight:\n\n${extractedTitle}`,
        `Industry Analysis:\n\n${extractedTitle}`,
        `Strategic Perspective:\n\n${extractedTitle}`,
        `Critical Takeaway:\n\n${extractedTitle}`
      ],
      tiktok: [
        `Professional Insight:\n\n${extractedTitle}`,
        `Industry Knowledge:\n\n${extractedTitle}`,
        `Expert Perspective:\n\n${extractedTitle}`,
        `Key Learning:\n\n${extractedTitle}`
      ]
    },
    casual: {
      instagram: [
        `🎯 Let's talk about:\n\n${extractedTitle}`,
        `💡 Here's the thing:\n\n${extractedTitle}`,
        `✨ Real talk:\n\n${extractedTitle}`,
        `🔥 Stop scrolling!\n\n${extractedTitle}`
      ],
      linkedin: [
        `Let's discuss:\n\n${extractedTitle}`,
        `My take on:\n\n${extractedTitle}`,
        `Here's what I think:\n\n${extractedTitle}`,
        `Quick thought:\n\n${extractedTitle}`
      ],
      tiktok: [
        `⚡ Wait, hear me out...\n\n${extractedTitle}`,
        `🎬 Quick one:\n\n${extractedTitle}`,
        `💥 You gotta see this:\n\n${extractedTitle}`,
        `🌟 Listen up:\n\n${extractedTitle}`
      ]
    },
    inspirational: {
      instagram: [
        `✨ Transform Your Mindset:\n\n${extractedTitle}`,
        `💪 Empower Yourself:\n\n${extractedTitle}`,
        `🌟 Discover Your Potential:\n\n${extractedTitle}`,
        `🚀 Unlock Your Future:\n\n${extractedTitle}`
      ],
      linkedin: [
        `Transform Your Career:\n\n${extractedTitle}`,
        `Unlock Your Potential:\n\n${extractedTitle}`,
        `Elevate Your Success:\n\n${extractedTitle}`,
        `Achieve Excellence:\n\n${extractedTitle}`
      ],
      tiktok: [
        `✨ Change Your Life:\n\n${extractedTitle}`,
        `💪 Level Up:\n\n${extractedTitle}`,
        `🌟 Manifest Success:\n\n${extractedTitle}`,
        `🚀 Dream Bigger:\n\n${extractedTitle}`
      ]
    }
  };

  const toneHooks = hooks[tone][platform as keyof typeof hooks.professional] || hooks[tone].instagram;
  return toneHooks[Math.floor(Math.random() * toneHooks.length)];
}

function generateCTA(platform: string, tone: Tone): string {
  const ctas = {
    professional: {
      instagram: [
        'Found this valuable?\n\nSave for reference\nShare with your network\nFollow for expert insights',
        'Key Takeaways:\n\nBookmark this content\nShare with colleagues\nConnect for more analysis',
        'Action Steps:\n\n✓ Save this post\n✓ Share with your team\n✓ Follow for industry insights',
        'Your Perspective:\n\nComment your thoughts below\nShare with your professional network\nFollow for more expertise'
      ],
      linkedin: [
        'Valuable insights?\n\n♻️ Repost to help your network\n💭 Share your professional perspective\n🔔 Follow for industry analysis',
        'What is your take?\n\nComment your experience\nConnect for networking\nShare with colleagues',
        'Found this useful?\n\n✓ Like to bookmark\n✓ Follow for expert content\n✓ Share your insights below',
        'Your turn:\n\nWhat would you add?\nComment your perspective\nRepost for your network'
      ],
      tiktok: [
        'Valuable content?\n\nLike to save\nFollow for expert tips\nShare your thoughts',
        'Learn something new?\n\nComment below\nFollow for more insights\nShare with others',
        'Found this useful?\n\nSave for reference\nFollow for expertise\nShare with your network',
        'Your perspective?\n\nLike & follow\nComment your thoughts\nShare this knowledge'
      ]
    },
    casual: {
      instagram: [
        '💬 Save this for later!\n\nFollow for more tips ✨',
        '❤️ Found this helpful?\n\nShare with someone who needs this!',
        '✅ Which tip resonated with you?\n\nComment below! 👇',
        '🔖 Bookmark this post!\n\nFollow for daily insights 🚀'
      ],
      linkedin: [
        'Found this valuable?\n\n♻️ Repost to help your network\n💭 Share your thoughts below',
        'What do you think?\n\nComment your experience 👇\nConnect for more insights',
        'Helpful?\n\n✅ Like to save\n🔔 Follow for more\n💬 Share your thoughts',
        'Your turn!\n\nWhat would you add to this list?\nComment below 👇'
      ],
      tiktok: [
        '❤️ Like if you learned something new!\n\n👉 Follow for more',
        '💬 Which one surprised you?\n\nComment below! ⬇️',
        '🔥 Save this for later!\n\nShare with a friend 💫',
        '✨ Follow for daily tips!\n\nLike & save this 🎯'
      ]
    },
    inspirational: {
      instagram: [
        '✨ Ready to transform?\n\nSave this for motivation\nShare to inspire others\nFollow for daily empowerment 💪',
        '🌟 Your journey starts now!\n\nBookmark this wisdom\nSpread the inspiration\nJoin our community ❤️',
        '💫 Believe in yourself!\n\nSave for tough days\nShare with someone who needs this\nFollow for uplifting content 🚀',
        '🔥 You have got this!\n\nSave this reminder\nInspire your friends\nFollow for motivation ✨'
      ],
      linkedin: [
        'Ready to elevate your career?\n\n♻️ Share this inspiration\n💭 Tag someone who needs this\n🔔 Follow for empowering content',
        'Transform your professional life:\n\nSave for motivation\nShare with your network\nConnect for growth',
        'Unlock your potential:\n\n✓ Bookmark this wisdom\n✓ Share to inspire others\n✓ Follow for success strategies',
        'Your success journey:\n\nComment your goals\nShare to motivate others\nFollow for empowerment'
      ],
      tiktok: [
        '✨ Believe in yourself!\n\nLike to remember\nFollow for daily motivation\nShare the inspiration 💪',
        '🌟 You can do this!\n\nSave for tough days\nFollow for empowerment\nSpread the positivity ❤️',
        '💫 Dream big!\n\nLike & save\nFollow for inspiration\nTag someone who needs this 🚀',
        '🔥 Keep going!\n\nSave this motivation\nFollow for daily fire\nShare with your tribe ✨'
      ]
    }
  };

  const toneCTAs = ctas[tone][platform as keyof typeof ctas.professional] || ctas[tone].instagram;
  return toneCTAs[Math.floor(Math.random() * toneCTAs.length)];
}

function generateHashtags(content: string, platform: string): string[] {
  const contentLower = content.toLowerCase();

  const topicKeywords: { [key: string]: string[] } = {
    business: ['business', 'entrepreneur', 'startup', 'marketing', 'sales'],
    tech: ['technology', 'ai', 'software', 'coding', 'developer', 'tech'],
    design: ['design', 'ui', 'ux', 'creative', 'branding'],
    lifestyle: ['lifestyle', 'wellness', 'health', 'fitness', 'motivation'],
    education: ['learning', 'education', 'tips', 'tutorial', 'guide']
  };

  let detectedTopics: string[] = [];
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      detectedTopics.push(topic);
    }
  }

  if (detectedTopics.length === 0) {
    detectedTopics = ['tips'];
  }

  const hashtagMap: { [key: string]: string[] } = {
    business: ['Business', 'Entrepreneur', 'Marketing', 'Growth', 'Success'],
    tech: ['Tech', 'Technology', 'Innovation', 'Digital', 'TechTips'],
    design: ['Design', 'Creative', 'UI', 'UX', 'Branding'],
    lifestyle: ['Lifestyle', 'Wellness', 'Motivation', 'SelfCare', 'Growth'],
    education: ['Education', 'Learning', 'Tips', 'Knowledge', 'Tutorial'],
    tips: ['Tips', 'Advice', 'Guide', 'HowTo', 'Learn']
  };

  const platformTags: { [key: string]: string[] } = {
    instagram: ['Instagram', 'InstaGood', 'Viral', 'Trending'],
    linkedin: ['LinkedIn', 'Professional', 'Career', 'Leadership'],
    tiktok: ['TikTok', 'FYP', 'Viral', 'Trending']
  };

  let hashtags: string[] = [];
  detectedTopics.forEach(topic => {
    hashtags.push(...(hashtagMap[topic] || []));
  });

  hashtags.push(...(platformTags[platform] || []));

  return [...new Set(hashtags)].slice(0, 8);
}

export const PLATFORM_SIZES = {
  instagram: { width: 1080, height: 1080 },
  linkedin: { width: 1200, height: 1200 },
  tiktok: { width: 1080, height: 1920 }
} as const;

export type Platform = keyof typeof PLATFORM_SIZES;
