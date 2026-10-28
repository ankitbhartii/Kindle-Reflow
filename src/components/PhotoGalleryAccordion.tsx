import React, { useState } from 'react';
import { ArrowRight, BookOpen, Upload, Volume2, Bookmark, Type, Sparkles } from 'lucide-react';
import { SwapWord } from './SwapWord';

interface GalleryItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  category: string;
  accent: string;
  icon: React.ElementType;
  actionText: string;
  actionType: 'upload' | 'sample' | 'scroll-archive' | 'custom';
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'reflow',
    number: '01',
    category: 'REFLOW',
    title: 'Fluid Geometry',
    tagline: 'No more pinch & zoom fatigue',
    description:
      'Dynamically extracts and reflows fixed-page PDFs into discrete, continuous multi-column book pages tuned to your exact viewport.',
    image: '/assets/gallery/gallery-1.jpg',
    accent: '#ff003d',
    icon: Sparkles,
    actionText: 'Open PDF',
    actionType: 'upload',
  },
  {
    id: 'spread',
    number: '02',
    category: 'SPREAD',
    title: 'Two-Page Hardcover',
    tagline: 'Authentic facing pages',
    description:
      'Immersive dual-page spread on desktop and tablet displays, with realistic book spine shadow and balanced Bookerly margins.',
    image: '/assets/gallery/gallery-2.jpg',
    accent: '#d97706',
    icon: BookOpen,
    actionText: 'Read Classic',
    actionType: 'sample',
  },
  {
    id: 'lexicon',
    number: '03',
    category: 'LEXICON',
    title: 'Offline Dictionary',
    tagline: 'Instant definition & audio',
    description:
      'Tap or long-press any word for instant definitions, phonetic pronunciations, and stem lookups without sending a byte over the internet.',
    image: '/assets/gallery/gallery-3.jpg',
    accent: '#0284c7',
    icon: Volume2,
    actionText: 'Sample Lexicon',
    actionType: 'sample',
  },
  {
    id: 'typography',
    number: '04',
    category: 'TYPOGRAPHY',
    title: 'Bookerly Aesthetics',
    tagline: 'Engineered for eye comfort',
    description:
      'Signature Literata serif and Bookerly font pairings with warm sepia and deep OLED dark mode for effortless reading day and night.',
    image: '/assets/gallery/gallery-4.jpg',
    accent: '#7c3aed',
    icon: Type,
    actionText: 'Try Themes',
    actionType: 'sample',
  },
  {
    id: 'memory',
    number: '05',
    category: 'MEMORY',
    title: 'Local Archive',
    tagline: '100% private state retention',
    description:
      'Bookmarks, highlighted quotes, and exact reading progress percentages saved securely in your browser’s private IndexedDB.',
    image: '/assets/gallery/gallery-5.jpg',
    accent: '#059669',
    icon: Bookmark,
    actionText: 'My Archive',
    actionType: 'scroll-archive',
  },
];

interface PhotoGalleryAccordionProps {
  onOpenPdf?: () => void;
  onOpenSampleBook?: () => void;
}

export const PhotoGalleryAccordion: React.FC<PhotoGalleryAccordionProps> = ({
  onOpenPdf,
  onOpenSampleBook,
}) => {
  const [activeId, setActiveId] = useState<string>('reflow');

  const handleAction = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.actionType === 'upload' && onOpenPdf) {
      onOpenPdf();
    } else if (item.actionType === 'sample' && onOpenSampleBook) {
      onOpenSampleBook();
    } else if (item.actionType === 'scroll-archive') {
      const el = document.getElementById('library-archive');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* Container: Vertical strips with smooth expanding motion matching Jitter template */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full h-[620px] sm:h-[480px] lg:h-[540px] select-none">
        {GALLERY_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => setActiveId(item.id)}
              onMouseEnter={() => setActiveId(item.id)}
              className={`relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group border-2 border-[#09090B] ${
                isActive
                  ? 'flex-[4.2] shadow-[8px_8px_0px_0px_#09090B]'
                  : 'flex-[1] hover:flex-[1.3] shadow-[4px_4px_0px_0px_#09090B] opacity-90 hover:opacity-100'
              }`}
            >
              {/* Background Image with parallax zoom on active */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
                style={{
                  backgroundImage: `url(${item.image})`,
                  transform: isActive ? 'scale(1.05)' : 'scale(1.0)',
                }}
              />

              {/* Cinematic Vignette Overlays matching Jitter design */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/30 transition-opacity duration-500 ${
                  isActive ? 'opacity-90' : 'opacity-80 group-hover:opacity-75'
                }`}
              />

              {/* Tint Accent Bar on Left/Top */}
              <div
                className="absolute top-0 left-0 right-0 sm:right-auto sm:bottom-0 sm:w-1.5 h-1.5 sm:h-auto transition-all duration-500"
                style={{
                  backgroundColor: isActive ? item.accent : 'transparent',
                }}
              />

              {/* Card Content Overlay */}
              <div className="relative z-10 w-full h-full p-4 sm:p-6 lg:p-7 flex flex-col justify-between text-white pointer-events-auto">
                {/* Top Row: Index Badge & Category */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-xs sm:text-sm tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                      {item.number}
                    </span>
                    <span
                      className="text-[11px] font-bold tracking-widest uppercase transition-opacity duration-300"
                      style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Icon Indicator */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? 'bg-white text-[#18181b] scale-105 shadow-lg'
                        : 'bg-white/10 text-white/80 group-hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Vertical Text Preview for Inactive Strips on Desktop */}
                {!isActive && (
                  <div className="hidden sm:flex flex-1 items-center justify-center pointer-events-none py-6">
                    <span className="font-display font-bold text-base lg:text-lg tracking-wider uppercase text-white/80 rotate-180 [writing-mode:vertical-rl] whitespace-nowrap transition-transform duration-500 group-hover:text-white">
                      {item.title}
                    </span>
                  </div>
                )}

                {/* Bottom Details Section (Expanded on Active) */}
                <div
                  className={`transition-all duration-500 flex flex-col justify-end ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 sm:opacity-0 pointer-events-none'
                  }`}
                >
                  {isActive && (
                    <div className="space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase opacity-80 block text-[#D2E823]">
                          {item.tagline}
                        </span>
                        <h3 className="font-display font-black text-xl sm:text-2xl lg:text-3xl tracking-tight text-white mt-0.5">
                          <SwapWord word={item.title} autoRoll={false} groupHover />
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-white/85 line-clamp-3 sm:line-clamp-none max-w-lg leading-relaxed font-body-sans">
                        {item.description}
                      </p>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={(e) => handleAction(item, e)}
                          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#D2E823] text-[#09090B] border-2 border-[#09090B] rounded-lg font-display text-xs tracking-wider uppercase transition-all duration-200 shadow-[3px_3px_0px_0px_#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                        >
                          <span>{item.actionText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Fallback Label when not active */}
                {!isActive && (
                  <div className="sm:hidden flex items-center justify-between text-xs font-semibold tracking-wider text-white/80">
                    <span>{item.title}</span>
                    <span className="text-[10px] opacity-60">Tap to expand</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Hint Indicator */}
      <div className="pt-3 flex items-center justify-between text-[11px] text-(--text-muted)">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff003d] animate-pulse" />
          <span>Interactive Motion Gallery · Hover or tap panels to inspect reflow engine</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-70">
          <span>5 Core Capabilities</span>
        </div>
      </div>
    </div>
  );
};
