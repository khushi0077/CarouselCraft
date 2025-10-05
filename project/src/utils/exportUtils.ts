import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Slide } from './contentParser';

export async function exportAsImages(
  slides: Slide[],
  containerId: string,
  template?: { fonts: { heading: string; body: string } },
  colors?: { primary: string; secondary: string; accent: string }
): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) return;

  const slideElements = container.querySelectorAll('[data-slide-id]');

  for (let i = 0; i < slideElements.length; i++) {
    const element = slideElements[i] as HTMLElement;

    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: colors?.secondary || '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    const link = document.createElement('a');
    link.download = `carousel-slide-${i + 1}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

export async function exportAsPDF(
  slides: Slide[],
  containerId: string,
  platform: string,
  colors?: { primary: string; secondary: string; accent: string }
): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) return;

  const slideElements = container.querySelectorAll('[data-slide-id]');

  const orientation = platform === 'tiktok' ? 'portrait' : 'portrait';
  const format = platform === 'tiktok' ? [1080, 1920] : [1080, 1080];

  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: format as [number, number]
  });

  let isFirstPage = true;

  for (let i = 0; i < slideElements.length; i++) {
    const element = slideElements[i] as HTMLElement;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: colors?.secondary || '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');

    if (!isFirstPage) {
      pdf.addPage(format as [number, number], orientation);
    }

    pdf.addImage(imgData, 'PNG', 0, 0, format[0], format[1]);
    isFirstPage = false;

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  pdf.save('carousel-slides.pdf');
}


export type Tone = 'professional' | 'casual' | 'inspirational';

export function generateCaption(
  title: string,
  hashtags: string[],
  platform: string,
  tone: Tone = 'professional'
): string {
  const captionIntros = {
    professional: {
      instagram: [
        `${title}\n\nKey insights in this carousel. Swipe to learn more →`,
        `Professional analysis: ${title}\n\nSave for reference 📊`,
        `${title}\n\nExpert breakdown inside. View all slides →`
      ],
      linkedin: [
        `${title}\n\nComprehensive analysis in this carousel →`,
        `Professional perspective on ${title}\n\nSwipe through for detailed insights.`,
        `${title}: Strategic Overview\n\nExplore the full breakdown below →`
      ],
      tiktok: [
        `${title}\n\nProfessional insights ahead →`,
        `Expert take: ${title}\n\nWatch for key points 📊`,
        `${title}\n\nIndustry analysis inside →`
      ]
    },
    casual: {
      instagram: [
        `✨ ${title}\n\nSwipe through to learn more! 👉`,
        `✨ Quick guide on ${title}\n\nSave this for later! 🔖`,
        `✨ Everything you need to know about ${title} 💡`
      ],
      linkedin: [
        `${title}\n\nKey insights in this carousel →`,
        `Sharing my thoughts on ${title}\n\nSwipe through for the full breakdown.`,
        `${title}: A comprehensive overview\n\nCheck out the slides below.`
      ],
      tiktok: [
        `✨ ${title}\n\nWatch till the end! 🎬`,
        `✨ Quick lesson: ${title}\n\nSave & share! 💫`,
        `✨ ${title} explained ⚡`
      ]
    },
    inspirational: {
      instagram: [
        `✨ ${title}\n\nTransform your mindset. Swipe for inspiration! 💪`,
        `🌟 ${title}\n\nYour journey to success starts here →`,
        `💫 ${title}\n\nUnlock your potential. Save this! 🚀`
      ],
      linkedin: [
        `${title}\n\nElevate your career with these insights →`,
        `Transform your professional life: ${title}\n\nSwipe for empowering strategies.`,
        `${title}: Your Path to Success\n\nDiscover game-changing wisdom below →`
      ],
      tiktok: [
        `✨ ${title}\n\nBelieve in yourself! Watch now 💪`,
        `🌟 ${title}\n\nYour transformation starts here →`,
        `💫 ${title}\n\nDream big! Save this 🚀`
      ]
    }
  };

  const toneIntros = captionIntros[tone][platform as keyof typeof captionIntros.professional] || captionIntros[tone].instagram;
  const intro = toneIntros[Math.floor(Math.random() * toneIntros.length)];

  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');

  return `${intro}\n\n${hashtagString}`;
}

export function generateVariations(
  slides: Slide[],
  count: number = 3,
  tone: Tone = 'professional'
): Array<{ slides: Slide[]; variant: string }> {
  const variations: Array<{ slides: Slide[]; variant: string }> = [];

  variations.push({
    slides: slides.map(s => ({ ...s })),
    variant: 'Original'
  });

  if (count > 1 && slides.length > 2) {
    const hookVariation = slides.map(s => ({ ...s }));
    const firstSlide = hookVariation[0];
    const lines = firstSlide.content.split('\n');
    const firstLine = lines[0];

    const hookPrefixes = {
      professional: 'Critical Alert:',
      casual: '🔥 Stop Scrolling!',
      inspirational: '✨ Transform Your Life:'
    };

    const newFirstLine = `${hookPrefixes[tone]}\n\n${lines.slice(lines[0] && lines[1] ? 2 : 1).join('\n')}`;
    hookVariation[0] = {
      ...firstSlide,
      content: firstSlide.content.replace(firstSlide.content, newFirstLine)
    };
    variations.push({
      slides: hookVariation,
      variant: 'Hook Variation'
    });
  }

  if (count > 2 && slides.length > 2) {
    const ctaVariation = slides.map(s => ({ ...s }));
    const lastIndex = ctaVariation.length - 1;

    const ctas = {
      professional: 'Action Steps:\n\n✓ Save for reference\n✓ Share with your network\n✓ Follow for expert insights\n✓ Comment your perspective',
      casual: '💾 Save this for later!\n\n👉 Share with someone who needs this\n\n✨ Follow for more content like this\n\n❤️ Drop a comment below!',
      inspirational: '✨ Ready to Transform?\n\n💪 Save this motivation\n🌟 Inspire others - share it!\n🚀 Follow for daily empowerment\n❤️ Tag someone who needs this'
    };

    ctaVariation[lastIndex] = {
      ...ctaVariation[lastIndex],
      content: ctas[tone]
    };
    variations.push({
      slides: ctaVariation,
      variant: 'CTA Variation'
    });
  }

  return variations.slice(0, count);
}
