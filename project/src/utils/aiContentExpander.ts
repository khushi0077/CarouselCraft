import { Tone } from './contentParser';

export async function expandContent(
  input: string,
  tone: Tone,
  platform: string
): Promise<string> {
  const lines = input.split('\n').filter(line => line.trim());

  if (lines.length === 0) return input;

  const expandedLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.length < 10) {
      expandedLines.push(expandSimpleIdea(trimmedLine, tone, platform));
    } else if (isIncomplete(trimmedLine)) {
      expandedLines.push(completeThought(trimmedLine, tone));
    } else {
      expandedLines.push(trimmedLine);
    }
  }

  return expandedLines.join('\n\n');
}

function isIncomplete(text: string): boolean {
  const incompletePhrases = [
    'i think',
    'maybe',
    'possibly',
    'could be',
    'might',
    'perhaps',
    'not sure',
    'kinda',
    'sorta',
    'basically'
  ];

  const textLower = text.toLowerCase();
  const hasIncompletePhrase = incompletePhrases.some(phrase => textLower.includes(phrase));
  const isShort = text.length < 50;
  const lacksDetail = !text.includes('because') && !text.includes('for example') && !text.includes('such as');

  return hasIncompletePhrase || (isShort && lacksDetail);
}

function expandSimpleIdea(idea: string, tone: Tone, platform: string): string {
  const contextMap: Record<Tone, Record<string, string[]>> = {
    professional: {
      instagram: [
        `${idea}: A critical factor for professional success in today's competitive landscape`,
        `Understanding ${idea} can transform your approach to business strategy and execution`,
        `${idea} represents a fundamental shift in how industry leaders approach modern challenges`
      ],
      linkedin: [
        `${idea}: Key insights for professional development and career advancement`,
        `The impact of ${idea} on organizational efficiency and strategic outcomes`,
        `${idea} - An essential consideration for business leaders and decision makers`
      ],
      tiktok: [
        `${idea}: What every professional needs to know right now`,
        `${idea} - The game-changer you've been missing in your career`,
        `Quick breakdown: ${idea} and why it matters for your professional growth`
      ]
    },
    casual: {
      instagram: [
        `Let's talk about ${idea} - it's actually way more important than you think!`,
        `${idea} is something everyone should know about (trust me on this one)`,
        `Here's why ${idea} matters more than ever in today's world`
      ],
      linkedin: [
        `${idea}: My take on why this matters for your career journey`,
        `Thoughts on ${idea} and its real-world impact on professionals`,
        `${idea} - Breaking down what this means for you`
      ],
      tiktok: [
        `${idea} - and why you need to pay attention to this!`,
        `Let me explain ${idea} in a way that actually makes sense`,
        `${idea}: The thing nobody talks about but everyone should know`
      ]
    },
    inspirational: {
      instagram: [
        `${idea}: Your pathway to unlocking unprecedented personal growth and success`,
        `Transform your life through understanding ${idea} - your journey starts here`,
        `${idea} holds the key to manifesting your greatest potential and dreams`
      ],
      linkedin: [
        `${idea}: Elevate your career by mastering this transformative concept`,
        `Unlock your professional potential through the power of ${idea}`,
        `${idea} - The catalyst for your next breakthrough in career excellence`
      ],
      tiktok: [
        `${idea} will change your life - here's how to harness its power`,
        `Your transformation starts with ${idea} - watch this to level up`,
        `${idea}: The secret to unlocking your best self and achieving greatness`
      ]
    }
  };

  const options = contextMap[tone][platform] || contextMap[tone].instagram;
  return options[Math.floor(Math.random() * options.length)];
}

function completeThought(text: string, tone: Tone): string {
  const completions: Record<Tone, string[]> = {
    professional: [
      ` This approach delivers measurable results through systematic implementation and strategic alignment.`,
      ` Research demonstrates significant improvements in efficiency and outcome quality.`,
      ` Industry leaders consistently achieve better results by applying these principles.`
    ],
    casual: [
      ` and honestly, once you try it, you'll wonder why you didn't start sooner!`,
      ` - it's one of those things that just makes everything so much easier.`,
      ` and the best part? It actually works in real life, not just in theory.`
    ],
    inspirational: [
      ` Embrace this mindset and watch as new opportunities unfold before you.`,
      ` Your commitment to this will transform not just your work, but your entire life.`,
      ` Believe in this process and you'll unlock potential you never knew existed.`
    ]
  };

  const cleanText = text.replace(/\s+(i think|maybe|possibly|could be|might|perhaps|not sure|kinda|sorta|basically)\.?$/gi, '');
  const endings = completions[tone];

  return cleanText + endings[Math.floor(Math.random() * endings.length)];
}

export function enhanceWithContext(
  bulletPoints: string[],
  tone: Tone
): string[] {
  return bulletPoints.map(point => {
    if (point.length < 30) {
      const enhanced = addContext(point, tone);
      return enhanced;
    }
    return point;
  });
}

function addContext(point: string, tone: Tone): string {
  const contextPatterns: Record<Tone, string[]> = {
    professional: [
      `${point} - proven to increase efficiency and deliver measurable outcomes`,
      `${point} - a data-driven approach that leading organizations implement`,
      `${point} - strategic implementation ensures consistent results`
    ],
    casual: [
      `${point} - seriously, this one's a game-changer`,
      `${point} - you'll love how easy this makes things`,
      `${point} - trust me, this actually works`
    ],
    inspirational: [
      `${point} - your breakthrough moment starts here`,
      `${point} - embrace this to unlock your true potential`,
      `${point} - transform your journey with this powerful insight`
    ]
  };

  const patterns = contextPatterns[tone];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

export function intelligentParse(rawText: string): {
  isComplete: boolean;
  needsExpansion: boolean;
  contentType: 'bullets' | 'paragraph' | 'topic' | 'thread';
  items: string[];
} {
  const lines = rawText.split('\n').filter(l => l.trim());

  if (lines.length === 0) {
    return { isComplete: false, needsExpansion: true, contentType: 'topic', items: [] };
  }

  const hasBullets = lines.some(l =>
    l.trim().startsWith('•') ||
    l.trim().startsWith('-') ||
    l.trim().startsWith('*') ||
    /^\d+\./.test(l.trim())
  );

  if (hasBullets) {
    const bullets = lines.filter(l => {
      const trimmed = l.trim();
      return trimmed.startsWith('•') ||
             trimmed.startsWith('-') ||
             trimmed.startsWith('*') ||
             /^\d+\./.test(trimmed);
    }).map(l => l.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, ''));

    const needsExpansion = bullets.some(b => b.length < 30);
    return {
      isComplete: !needsExpansion,
      needsExpansion,
      contentType: 'bullets',
      items: bullets
    };
  }

  if (lines.length === 1 && lines[0].length < 100) {
    return {
      isComplete: false,
      needsExpansion: true,
      contentType: 'topic',
      items: [lines[0]]
    };
  }

  if (lines.length > 3 && lines.every(l => l.length < 200)) {
    return {
      isComplete: lines.some(l => l.length > 100),
      needsExpansion: true,
      contentType: 'thread',
      items: lines
    };
  }

  return {
    isComplete: rawText.length > 200,
    needsExpansion: rawText.length < 200,
    contentType: 'paragraph',
    items: lines
  };
}
