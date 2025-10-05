export interface EmojiSuggestion {
  emoji: string;
  reason: string;
}

const KEYWORD_EMOJI_MAP: Record<string, string[]> = {
  success: ['🎉', '✅', '🏆', '💪', '⭐'],
  growth: ['📈', '🚀', '🌱', '💹', '📊'],
  money: ['💰', '💵', '💸', '🤑', '💳'],
  time: ['⏰', '⏱️', '⌛', '🕐', '⏳'],
  idea: ['💡', '🧠', '💭', '✨', '🎯'],
  learning: ['📚', '🎓', '📖', '✏️', '🧑‍🎓'],
  speed: ['🚀', '⚡', '💨', '🏃', '⏩'],
  warning: ['⚠️', '🚨', '⛔', '❗', '🔴'],
  positive: ['👍', '✅', '😊', '💚', '🎊'],
  negative: ['❌', '👎', '😔', '⛔', '🔻'],
  technology: ['💻', '⚙️', '🔧', '🖥️', '📱'],
  communication: ['💬', '📢', '🗣️', '📞', '💌'],
  business: ['💼', '📊', '💰', '🏢', '📈'],
  target: ['🎯', '🔍', '👁️', '🎲', '📍'],
  fire: ['🔥', '💥', '⚡', '✨', '🌟'],
  heart: ['❤️', '💙', '💚', '💛', '💜'],
  check: ['✅', '✔️', '☑️', '👌', '💯'],
  question: ['❓', '🤔', '❔', '🧐', '💭'],
  star: ['⭐', '🌟', '✨', '💫', '⚡'],
  work: ['💼', '👔', '🏢', '📊', '⚙️'],
  creative: ['🎨', '✨', '🎭', '🖌️', '💫'],
  data: ['📊', '📈', '📉', '💹', '🔢'],
  security: ['🔒', '🛡️', '🔐', '🔑', '🚨'],
  world: ['🌍', '🌎', '🌏', '🗺️', '🌐'],
  people: ['👥', '👫', '👨‍👩‍👧‍👦', '🤝', '👪'],
  calendar: ['📅', '📆', '🗓️', '⏰', '📋'],
  email: ['📧', '✉️', '📨', '📬', '💌'],
  phone: ['📱', '📞', '☎️', '📲', '💬'],
  home: ['🏠', '🏡', '🏘️', '🏢', '🏰'],
  food: ['🍕', '🍔', '🍟', '🥗', '🍱'],
  health: ['💊', '🏥', '⚕️', '🩺', '💉'],
  fitness: ['💪', '🏋️', '🏃', '🤸', '🧘'],
  travel: ['✈️', '🚗', '🚢', '🗺️', '🧳'],
  music: ['🎵', '🎶', '🎸', '🎹', '🎤'],
  video: ['🎬', '📹', '🎥', '📽️', '🎞️'],
  image: ['📸', '📷', '🖼️', '🎨', '🌄'],
  document: ['📄', '📃', '📋', '📝', '📑'],
  folder: ['📁', '📂', '🗂️', '📚', '📦'],
  link: ['🔗', '⛓️', '📎', '🔐', '🌐'],
  search: ['🔍', '🔎', '🕵️', '🔬', '🔭'],
  tools: ['🔧', '🔨', '⚙️', '🛠️', '⚡'],
  chart: ['📊', '📈', '📉', '💹', '📋'],
  trophy: ['🏆', '🥇', '🥈', '🥉', '🎖️'],
  gift: ['🎁', '🎀', '🎊', '🎉', '🎈']
};

const CONTEXT_PATTERNS: Array<{
  pattern: RegExp;
  emojis: string[];
  category: string;
}> = [
  { pattern: /\b(fast|quick|speed|rapid|instant)\b/i, emojis: ['🚀', '⚡', '💨'], category: 'speed' },
  { pattern: /\b(grow|increase|improve|boost|enhance)\b/i, emojis: ['📈', '🚀', '💹'], category: 'growth' },
  { pattern: /\b(money|cash|profit|revenue|income)\b/i, emojis: ['💰', '💵', '💸'], category: 'money' },
  { pattern: /\b(time|schedule|deadline|clock)\b/i, emojis: ['⏰', '⏱️', '⌛'], category: 'time' },
  { pattern: /\b(idea|thought|brain|think|innovate)\b/i, emojis: ['💡', '🧠', '✨'], category: 'idea' },
  { pattern: /\b(learn|study|education|teach|course)\b/i, emojis: ['📚', '🎓', '✏️'], category: 'learning' },
  { pattern: /\b(warning|caution|alert|danger|risk)\b/i, emojis: ['⚠️', '🚨', '❗'], category: 'warning' },
  { pattern: /\b(success|win|achieve|accomplish|victory)\b/i, emojis: ['🎉', '🏆', '✅'], category: 'success' },
  { pattern: /\b(fail|error|mistake|wrong|problem)\b/i, emojis: ['❌', '⛔', '🔴'], category: 'negative' },
  { pattern: /\b(tech|code|software|program|app)\b/i, emojis: ['💻', '⚙️', '🔧'], category: 'technology' },
  { pattern: /\b(talk|speak|communicate|message|chat)\b/i, emojis: ['💬', '📢', '🗣️'], category: 'communication' },
  { pattern: /\b(business|company|corporate|enterprise)\b/i, emojis: ['💼', '🏢', '📊'], category: 'business' },
  { pattern: /\b(target|goal|aim|focus|objective)\b/i, emojis: ['🎯', '🔍', '📍'], category: 'target' },
  { pattern: /\b(fire|hot|trending|viral|popular)\b/i, emojis: ['🔥', '💥', '🌟'], category: 'fire' },
  { pattern: /\b(love|like|favorite|enjoy|passion)\b/i, emojis: ['❤️', '💙', '💚'], category: 'heart' },
  { pattern: /\b(check|verify|confirm|validate|approve)\b/i, emojis: ['✅', '✔️', '👌'], category: 'check' },
  { pattern: /\b(question|ask|wonder|curious|inquiry)\b/i, emojis: ['❓', '🤔', '❔'], category: 'question' },
  { pattern: /\b(star|excellent|outstanding|amazing)\b/i, emojis: ['⭐', '🌟', '✨'], category: 'star' },
  { pattern: /\b(work|job|career|professional|office)\b/i, emojis: ['💼', '👔', '🏢'], category: 'work' },
  { pattern: /\b(creative|design|art|artistic|imagine)\b/i, emojis: ['🎨', '✨', '🎭'], category: 'creative' },
  { pattern: /\b(data|analytics|stats|metrics|numbers)\b/i, emojis: ['📊', '📈', '🔢'], category: 'data' },
  { pattern: /\b(secure|safe|protect|security|privacy)\b/i, emojis: ['🔒', '🛡️', '🔐'], category: 'security' },
  { pattern: /\b(world|global|international|worldwide)\b/i, emojis: ['🌍', '🌎', '🗺️'], category: 'world' },
  { pattern: /\b(team|people|group|community|together)\b/i, emojis: ['👥', '🤝', '👨‍👩‍👧‍👦'], category: 'people' },
  { pattern: /\b(save|bookmark|remember|store)\b/i, emojis: ['💾', '🔖', '📌'], category: 'save' },
  { pattern: /\b(share|post|publish|distribute)\b/i, emojis: ['📤', '🔗', '📢'], category: 'share' },
  { pattern: /\b(follow|subscribe|join|connect)\b/i, emojis: ['➕', '👉', '🔔'], category: 'follow' },
  { pattern: /\b(tip|advice|hint|suggestion|guide)\b/i, emojis: ['💡', '📝', '👆'], category: 'tip' },
  { pattern: /\b(new|fresh|latest|recent|modern)\b/i, emojis: ['🆕', '✨', '🌟'], category: 'new' },
  { pattern: /\b(stop|quit|end|finish|complete)\b/i, emojis: ['🛑', '⏹️', '🏁'], category: 'stop' },
  { pattern: /\b(start|begin|launch|initiate)\b/i, emojis: ['▶️', '🚀', '🎬'], category: 'start' },
  { pattern: /\b(power|strong|strength|mighty)\b/i, emojis: ['💪', '⚡', '🔋'], category: 'power' },
  { pattern: /\b(key|important|essential|critical)\b/i, emojis: ['🔑', '⭐', '❗'], category: 'key' }
];

export function suggestEmojisForText(text: string): EmojiSuggestion[] {
  const textLower = text.toLowerCase();
  const suggestions: Array<{ emoji: string; reason: string; score: number }> = [];
  const usedEmojis = new Set<string>();

  CONTEXT_PATTERNS.forEach(({ pattern, emojis, category }) => {
    if (pattern.test(text)) {
      emojis.forEach((emoji, index) => {
        if (!usedEmojis.has(emoji)) {
          suggestions.push({
            emoji,
            reason: `Matches ${category} context`,
            score: 10 - index
          });
          usedEmojis.add(emoji);
        }
      });
    }
  });

  Object.entries(KEYWORD_EMOJI_MAP).forEach(([keyword, emojis]) => {
    if (textLower.includes(keyword)) {
      emojis.slice(0, 2).forEach((emoji, index) => {
        if (!usedEmojis.has(emoji)) {
          suggestions.push({
            emoji,
            reason: `Related to "${keyword}"`,
            score: 5 - index
          });
          usedEmojis.add(emoji);
        }
      });
    }
  });

  if (suggestions.length === 0) {
    const defaultEmojis = ['✨', '💡', '🎯'];
    defaultEmojis.forEach((emoji, index) => {
      suggestions.push({
        emoji,
        reason: 'General purpose',
        score: 3 - index
      });
    });
  }

  suggestions.sort((a, b) => b.score - a.score);

  return suggestions.slice(0, 3).map(({ emoji, reason }) => ({ emoji, reason }));
}

export function getEmojisByType(type: 'hook' | 'content' | 'cta'): string[] {
  const emojisByType = {
    hook: ['🎯', '💡', '⚡', '🚀', '✨', '👀', '🔥', '💥', '🎬', '🌟'],
    content: ['📌', '💭', '📝', '✏️', '📊', '🔍', '💬', '🎨', '⚙️', '🔧'],
    cta: ['👉', '💬', '❤️', '🔖', '💾', '✅', '📤', '🔔', '👆', '➡️']
  };

  return emojisByType[type] || [];
}

export function enhanceTextWithEmoji(text: string, emoji: string, position: 'start' | 'end' = 'start'): string {
  const lines = text.split('\n');

  if (position === 'start') {
    lines[0] = `${emoji} ${lines[0]}`;
  } else {
    lines[lines.length - 1] = `${lines[lines.length - 1]} ${emoji}`;
  }

  return lines.join('\n');
}
