import { Slide } from '../utils/contentParser';
import { Template } from '../utils/templates';

interface SlideRendererProps {
  slide: Slide;
  template: Template;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  platform: string;
  logo?: string;
}

export default function SlideRenderer({
  slide,
  template,
  colors,
  platform,
  logo
}: SlideRendererProps) {
  const aspectRatio = platform === 'tiktok' ? '9/16' : '1/1';

  const paddingMap = {
    tight: 'p-8',
    comfortable: 'p-12',
    generous: 'p-16'
  };

  const alignmentMap = {
    centered: 'items-center justify-center text-center',
    'left-aligned': 'items-start justify-start text-left',
    'right-aligned': 'items-end justify-end text-right',
    split: 'items-start justify-between text-left'
  };

  const fontSizeMap = {
    hook: 'text-4xl md:text-5xl',
    content: 'text-2xl md:text-3xl',
    cta: 'text-3xl md:text-4xl'
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg shadow-xl ${paddingMap[template.spacing]}`}
      style={{
        aspectRatio,
        backgroundColor: colors.secondary,
        color: colors.primary,
        fontFamily: template.fonts.body
      }}
    >
      <div className={`flex flex-col h-full ${alignmentMap[template.layout]}`}>
        {logo && slide.type === 'hook' && (
          <div className="mb-6">
            {logo.startsWith('data:') ? (
              <img
                src={logo}
                alt="Logo"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: colors.accent, color: colors.secondary }}
              >
                {logo}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          {slide.selectedEmoji && (
            <div className="text-6xl mb-6">{slide.selectedEmoji}</div>
          )}
          <div
            className={`font-bold leading-tight ${fontSizeMap[slide.type]}`}
            style={{ fontFamily: template.fonts.heading }}
          >
            {slide.content.split('\n').map((line, idx) => (
              <div key={idx} className="mb-2">
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div
            className="text-sm font-medium"
            style={{ color: colors.accent }}
          >
            {slide.order}/{slide.type === 'cta' ? slide.order : '...'}
          </div>

          {slide.type === 'hook' && (
            <div className="text-sm opacity-60">
              Swipe →
            </div>
          )}
        </div>

        {template.layout === 'split' && slide.type !== 'hook' && (
          <div
            className="absolute top-0 right-0 w-1 h-full"
            style={{ backgroundColor: colors.accent }}
          />
        )}
      </div>
    </div>
  );
}
