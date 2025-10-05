export interface Template {
  id: string;
  name: string;
  category: 'minimal' | 'professional' | 'creative';
  fonts: {
    heading: string;
    body: string;
  };
  layout: 'centered' | 'left-aligned' | 'right-aligned' | 'split';
  spacing: 'tight' | 'comfortable' | 'generous';
}

export const TEMPLATES: Template[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'minimal',
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    layout: 'centered',
    spacing: 'comfortable'
  },
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    category: 'creative',
    fonts: {
      heading: 'Poppins',
      body: 'Inter'
    },
    layout: 'left-aligned',
    spacing: 'tight'
  },
  {
    id: 'elegant-pro',
    name: 'Elegant Professional',
    category: 'professional',
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    },
    layout: 'centered',
    spacing: 'generous'
  },
  {
    id: 'vibrant-energy',
    name: 'Vibrant Energy',
    category: 'creative',
    fonts: {
      heading: 'Montserrat',
      body: 'Inter'
    },
    layout: 'split',
    spacing: 'comfortable'
  },
  {
    id: 'clean-corporate',
    name: 'Clean Corporate',
    category: 'professional',
    fonts: {
      heading: 'Roboto',
      body: 'Roboto'
    },
    layout: 'left-aligned',
    spacing: 'comfortable'
  }
];

export const COLOR_PRESETS = [
  {
    name: 'Classic',
    primary: '#000000',
    secondary: '#FFFFFF',
    accent: '#3B82F6'
  },
  {
    name: 'Sunset',
    primary: '#FF6B6B',
    secondary: '#FFF5E1',
    accent: '#FFB347'
  },
  {
    name: 'Ocean',
    primary: '#0EA5E9',
    secondary: '#F0F9FF',
    accent: '#06B6D4'
  },
  {
    name: 'Forest',
    primary: '#10B981',
    secondary: '#F0FDF4',
    accent: '#22C55E'
  },
  {
    name: 'Royal',
    primary: '#1E293B',
    secondary: '#F8FAFC',
    accent: '#6366F1'
  },
  {
    name: 'Coral',
    primary: '#F43F5E',
    secondary: '#FFF1F2',
    accent: '#FB7185'
  }
];
