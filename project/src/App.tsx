import { useState } from 'react';
import { Sparkles, Download, Copy, Palette, LayoutGrid as Layout, Instagram, Linkedin, Share2, ChevronLeft, ChevronRight, Save, Clock, Send } from 'lucide-react';
import SlideRenderer from './components/SlideRenderer';
import EmojiPicker from './components/EmojiPicker';
import {
  parseContent,
  type Slide,
  type Platform,
  PLATFORM_SIZES
} from './utils/contentParser';
import { TEMPLATES, COLOR_PRESETS } from './utils/templates';
import { exportAsImages, exportAsPDF, generateCaption, generateVariations } from './utils/exportUtils';
import { saveCarouselPost, scheduleCarouselPost, type CarouselPost } from './utils/publishUtils';

export type Tone = 'professional' | 'casual' | 'inspirational';

function App() {
  const [input, setInput] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [tone, setTone] = useState<Tone>('professional');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [colors, setColors] = useState(COLOR_PRESETS[0]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [caption, setCaption] = useState('');
  const [variations, setVariations] = useState<Array<{ slides: Slide[]; variant: string }>>([]);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [logo, setLogo] = useState<string>('CC');
  const [customFont, setCustomFont] = useState<string>('');
  const [showFontSelector, setShowFontSelector] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [saveStatus, setSaveStatus] = useState<string>('');

  const handleGenerate = async () => {
    if (!input.trim()) return;

    const parsed = await parseContent(input, platform, tone);
    setSlides(parsed.slides);
    setHashtags(parsed.hashtags);
    setCurrentSlide(0);

    const generatedCaption = generateCaption(
      parsed.suggestedTitle,
      parsed.hashtags,
      platform,
      tone
    );
    setCaption(generatedCaption);

    const vars = generateVariations(parsed.slides, 3, tone);
    setVariations(vars);
    setSelectedVariation(0);
  };

  const handleExport = async () => {
    if (slides.length === 0) return;
    await exportAsImages(slides, 'carousel-preview', selectedTemplate, colors);
  };

  const handleExportPDF = async () => {
    if (slides.length === 0) return;
    await exportAsPDF(slides, 'carousel-preview', platform, colors);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoText = (text: string) => {
    setLogo(text);
  };

  const handleEmojiSelect = (slideId: string, emoji: string) => {
    const updateSlides = (slidesArray: Slide[]) =>
      slidesArray.map((s) =>
        s.id === slideId ? { ...s, selectedEmoji: emoji } : s
      );

    setSlides(updateSlides);

    if (variations.length > 0) {
      setVariations(
        variations.map((variation) => ({
          ...variation,
          slides: updateSlides(variation.slides)
        }))
      );
    }
  };

  const handleEmojiClear = (slideId: string) => {
    const updateSlides = (slidesArray: Slide[]) =>
      slidesArray.map((s) =>
        s.id === slideId ? { ...s, selectedEmoji: undefined } : s
      );

    setSlides(updateSlides);

    if (variations.length > 0) {
      setVariations(
        variations.map((variation) => ({
          ...variation,
          slides: updateSlides(variation.slides)
        }))
      );
    }
  };

  const displaySlides = variations.length > 0 ? variations[selectedVariation].slides : slides;

  const handleSaveDraft = async () => {
    if (!postTitle.trim()) {
      setSaveStatus('Please enter a title');
      return;
    }

    const post: CarouselPost = {
      title: postTitle,
      platform,
      status: 'draft',
      slides_data: displaySlides,
      caption,
      hashtags,
      template_settings: {
        template: selectedTemplate,
        colors,
        logo
      }
    };

    const { data, error } = await saveCarouselPost(post);

    if (error) {
      setSaveStatus('Error saving draft: ' + error.message);
    } else {
      setSaveStatus('Draft saved successfully!');
      setTimeout(() => {
        setShowPublishModal(false);
        setSaveStatus('');
      }, 2000);
    }
  };

  const handleSchedulePost = async () => {
    if (!postTitle.trim()) {
      setSaveStatus('Please enter a title');
      return;
    }

    if (!scheduleDate) {
      setSaveStatus('Please select a date and time');
      return;
    }

    const post: CarouselPost = {
      title: postTitle,
      platform,
      status: 'scheduled',
      slides_data: displaySlides,
      caption,
      hashtags,
      template_settings: {
        template: selectedTemplate,
        colors,
        logo
      }
    };

    const { data, error } = await scheduleCarouselPost(post, new Date(scheduleDate));

    if (error) {
      setSaveStatus('Error scheduling post: ' + error.message);
    } else {
      setSaveStatus('Post scheduled successfully!');
      setTimeout(() => {
        setShowPublishModal(false);
        setSaveStatus('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12 text-center animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-10 h-10 text-blue-600 animate-float" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
              CarouselCraft
            </h1>
          </div>
          <p className="text-slate-600 text-lg animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            Transform your ideas into stunning social media carousels
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-in hover-lift">
              <div className="flex items-center gap-2 mb-4">
                <Layout className="w-5 h-5 text-blue-600 transition-transform duration-300 group-hover:rotate-12" />
                <h2 className="text-xl font-semibold text-slate-800">Input Content</h2>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPlatform('instagram')}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    platform === 'instagram'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg animate-pulse-glow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                  }`}
                >
                  <Instagram className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  Instagram
                </button>
                <button
                  onClick={() => setPlatform('linkedin')}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    platform === 'linkedin'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg animate-pulse-glow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                  }`}
                >
                  <Linkedin className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  LinkedIn
                </button>
                <button
                  onClick={() => setPlatform('tiktok')}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    platform === 'tiktok'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg animate-pulse-glow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                  }`}
                >
                  <Share2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  TikTok
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Content Tone
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTone('professional')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      tone === 'professional'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-gradient-to-r hover:from-slate-200 hover:to-slate-100 hover:shadow-md'
                    }`}
                  >
                    Professional
                  </button>
                  <button
                    onClick={() => setTone('casual')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      tone === 'casual'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-gradient-to-r hover:from-slate-200 hover:to-slate-100 hover:shadow-md'
                    }`}
                  >
                    Casual
                  </button>
                  <button
                    onClick={() => setTone('inspirational')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      tone === 'inspirational'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-gradient-to-r hover:from-slate-200 hover:to-slate-100 hover:shadow-md'
                    }`}
                  >
                    Inspirational
                  </button>
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your content here...&#10;&#10;You can use:&#10;• Bullet points&#10;• Numbered lists&#10;• Paragraphs&#10;• Blog posts&#10;• Simple topic ideas&#10;&#10;Example:&#10;5 Tips for Better Productivity&#10;• Start your day with a plan&#10;• Take regular breaks&#10;• Minimize distractions&#10;• Set clear goals&#10;• Review your progress"
                className="w-full h-80 p-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none text-slate-700 transition-all duration-300"
              />

              <button
                onClick={handleGenerate}
                disabled={!input.trim()}
                className="group w-full mt-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-[length:200%_100%] text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 hover:bg-right animate-gradient"
              >
                <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
                Generate Carousel
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-800">Customize</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                  >
                    <span className="font-medium text-slate-700">
                      Template: {selectedTemplate.name}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        showTemplates ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {showTemplates && (
                    <div className="mt-2 space-y-2 animate-fade-in">
                      {TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowTemplates(false);
                          }}
                          className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                            selectedTemplate.id === template.id
                              ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm opacity-75 capitalize">
                            {template.category}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setShowColors(!showColors)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                  >
                    <span className="font-medium text-slate-700">
                      Colors: {colors.name}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        showColors ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {showColors && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            setColors(preset);
                            setShowColors(false);
                          }}
                          className={`p-3 rounded-lg transition-all ${
                            colors.name === preset.name
                              ? 'ring-2 ring-blue-500'
                              : 'hover:ring-2 hover:ring-slate-300'
                          }`}
                        >
                          <div className="flex gap-2 mb-2">
                            <div
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: preset.accent }}
                            />
                          </div>
                          <div className="text-sm font-medium text-slate-700">
                            {preset.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Logo / Brand
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={typeof logo === 'string' && !logo.startsWith('data:') ? logo : ''}
                      onChange={(e) => handleLogoText(e.target.value)}
                      placeholder="Enter text (e.g., CC, YourBrand)"
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">or</span>
                      <label className="flex-1 cursor-pointer">
                        <div className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-center text-sm font-medium text-slate-700 transition-all">
                          Upload Logo Image
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {logo.startsWith('data:') && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <span className="text-sm text-green-700">✓ Image uploaded</span>
                        <button
                          onClick={() => setLogo('CC')}
                          className="ml-auto text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setShowFontSelector(!showFontSelector)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                  >
                    <span className="font-medium text-slate-700">
                      Font: {customFont || selectedTemplate.fonts.heading.split(',')[0]}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        showFontSelector ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {showFontSelector && (
                    <div className="mt-2 space-y-2">
                      {['Inter', 'Poppins', 'Roboto', 'Montserrat', 'Open Sans', 'Lato', 'Playfair Display', 'Raleway'].map((font) => (
                        <button
                          key={font}
                          onClick={() => {
                            setCustomFont(font);
                            setSelectedTemplate({
                              ...selectedTemplate,
                              fonts: {
                                heading: `${font}, sans-serif`,
                                body: `${font}, sans-serif`
                              }
                            });
                            setShowFontSelector(false);
                          }}
                          className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                            (customFont || selectedTemplate.fonts.heading.split(',')[0]) === font
                              ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {slides.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up hover-lift">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Generated Caption
                </h3>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 mb-3 border border-slate-200">
                  <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {caption}
                  </p>
                </div>
                <button
                  onClick={handleCopyCaption}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <Copy className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Copy Caption
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {displaySlides.length > 0 ? (
              <>
                <div className="bg-white rounded-2xl shadow-lg p-6 animate-scale-in hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                      Preview
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                      <span className="text-sm font-medium text-blue-600">
                        {PLATFORM_SIZES[platform].width} × {PLATFORM_SIZES[platform].height}
                      </span>
                    </div>
                  </div>

                  {variations.length > 1 && (
                    <div className="mb-4 animate-fade-in">
                      <p className="text-xs font-medium text-slate-500 mb-2">Compare different versions:</p>
                      <div className="flex gap-2">
                        {variations.map((variation, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedVariation(idx)}
                            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                              selectedVariation === idx
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-700 hover:bg-gradient-to-r hover:from-slate-200 hover:to-slate-100 hover:shadow-md'
                            }`}
                          >
                            {selectedVariation === idx && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
                            )}
                            <span className="relative">{variation.variant}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div id="carousel-preview" className="mb-4">
                    <div data-slide-id={displaySlides[currentSlide]?.id}>
                      <SlideRenderer
                        slide={displaySlides[currentSlide]}
                        template={selectedTemplate}
                        colors={colors}
                        platform={platform}
                        logo={logo}
                      />
                    </div>
                  </div>

                  {displaySlides[currentSlide]?.suggestedEmojis && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <div className="text-sm text-slate-600 mb-2 font-medium">
                        Suggested Emojis for This Slide
                      </div>
                      <EmojiPicker
                        suggestions={displaySlides[currentSlide].suggestedEmojis}
                        selectedEmoji={displaySlides[currentSlide].selectedEmoji}
                        onSelect={(emoji) =>
                          handleEmojiSelect(displaySlides[currentSlide].id, emoji)
                        }
                        onClear={() =>
                          handleEmojiClear(displaySlides[currentSlide].id)
                        }
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setCurrentSlide((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentSlide === 0}
                      className="group p-3 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                    >
                      <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    </button>

                    <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full">
                      <span className="text-blue-600 font-bold text-sm">
                        {currentSlide + 1} / {displaySlides.length}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setCurrentSlide((prev) =>
                          Math.min(displaySlides.length - 1, prev + 1)
                        )
                      }
                      disabled={currentSlide === displaySlides.length - 1}
                      className="group p-3 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                    >
                      <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover-lift">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-600" />
                    Export
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleExport}
                      className="group w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                      <Download className="w-5 h-5 transition-transform group-hover:translate-y-1" />
                      Download as Images
                    </button>
                    <p className="text-sm text-slate-500 text-center">
                      Downloads all {displaySlides.length} slides as individual PNG files
                    </p>
                    <button
                      onClick={handleExportPDF}
                      className="group w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                      <Download className="w-5 h-5 transition-transform group-hover:translate-y-1" />
                      Download as PDF
                    </button>
                    <p className="text-sm text-slate-500 text-center">
                      Downloads all slides as a single PDF document
                    </p>
                    <button
                      onClick={() => setShowPublishModal(true)}
                      className="group w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                      <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      Save / Schedule Post
                    </button>
                    <p className="text-sm text-slate-500 text-center">
                      Save as draft or schedule for later publishing
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover-lift">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-blue-600" />
                    All Slides
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {displaySlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        onClick={() => setCurrentSlide(idx)}
                        className={`rounded-lg border-2 transition-all duration-300 overflow-hidden transform hover:scale-105 ${
                          currentSlide === idx
                            ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                            : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                        style={{ aspectRatio: platform === 'tiktok' ? '9/16' : '1/1' }}
                      >
                        <div className="w-full h-full relative scale-[0.35] origin-top-left" style={{ width: '285%', height: '285%' }}>
                          <SlideRenderer
                            slide={slide}
                            template={selectedTemplate}
                            colors={colors}
                            platform={platform}
                            logo={logo}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-bounce-in">
                <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-float" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                  Ready to create magic?
                </h3>
                <p className="text-slate-500">
                  Enter your content and click Generate Carousel to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {showPublishModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Save / Schedule Post</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="My Awesome Carousel"
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Schedule Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                {saveStatus && (
                  <div className={`p-3 rounded-lg text-sm ${
                    saveStatus.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {saveStatus}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDraft}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-300 transform hover:scale-105"
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>

                  <button
                    onClick={handleSchedulePost}
                    disabled={!scheduleDate}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Clock className="w-4 h-4" />
                    Schedule
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowPublishModal(false);
                    setSaveStatus('');
                  }}
                  className="w-full px-4 py-2 text-slate-600 hover:text-slate-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;