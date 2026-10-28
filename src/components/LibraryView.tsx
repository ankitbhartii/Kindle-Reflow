import React, { useState, useRef, useEffect } from 'react';
import { BookMetadata, ReadingSettings } from '../types/reader';
import {
  Upload,
  ArrowRight,
  X,
  Bookmark,
  Trash2,
  BookOpen,
  ChevronRight,
  Shield,
  Smartphone,
  Type,
  Volume2,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  Menu,
  Zap,
  Download,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { ParseProgress } from '../services/pdfParser';
import { PhotoGalleryAccordion } from './PhotoGalleryAccordion';
import { PWAInstallBanner } from './PWAInstallBanner';

interface LibraryViewProps {
  books: BookMetadata[];
  settings: ReadingSettings;
  onOpenBook: (bookId: string) => void;
  onOpenSampleBook: () => void;
  onSelectPdfFile: (file: File) => void;
  onDeleteBook: (bookId: string) => void;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  isParsing: boolean;
  parseProgress: ParseProgress | null;
}

const TICKER_ITEMS = [
  '⚡ REFLOW ANY PDF',
  '✦ BOOKERLY TYPOGRAPHY',
  '✦ OFFLINE DICTIONARY',
  '✦ TWO-PAGE SPREAD',
  '⚡ 100% CLIENT-SIDE PRIVATE',
  '✦ OLED DARK MODE',
  '✦ INDEXEDDB PERSISTENCE',
  '⚡ ZERO CLOUD UPLOADS',
  '✦ INSTALL ON ANDROID',
];

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  settings,
  onOpenBook,
  onOpenSampleBook,
  onSelectPdfFile,
  onDeleteBook,
  onUpdateSettings,
  isParsing,
  parseProgress,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setCurrentTimeStr(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      onSelectPdfFile(file);
    } else if (file) {
      alert('Please drop a valid PDF file.');
    }
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelectPdfFile(file);
  };

  const tickerStr = TICKER_ITEMS.join('  ·  ');
  const tickerDouble = `${tickerStr}  ·  ${tickerStr}  ·  `;

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-[#F8F4E8] text-[#09090B] selection:bg-[#D2E823] selection:text-[#09090B]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,application/pdf"
        className="hidden"
      />

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* ════════════════════════════════════════════════════
          PARSING OVERLAY
          ════════════════════════════════════════════════════ */}
      {isParsing && parseProgress && (
        <div className="fixed inset-0 z-[9000] bg-[#09090B]/96 flex flex-col items-center justify-center gap-5 px-4">
          <div
            className="w-full max-w-xs bg-[#09090B] border-2 border-[#D2E823] rounded-2xl p-6 text-center space-y-4"
            style={{ boxShadow: '6px 6px 0px 0px #D2E823' }}
          >
            <Zap className="w-8 h-8 text-[#D2E823] mx-auto animate-pulse" />
            <p className="font-display text-[#D2E823] text-lg">REFLOWING PDF</p>
            <div className="w-full bg-[#F8F4E8]/10 rounded-sm h-2 border border-[#F8F4E8]/20 overflow-hidden">
              <div
                className="h-full bg-[#D2E823] transition-all duration-300"
                style={{ width: parseProgress.totalPages > 0 ? `${(parseProgress.currentPage / parseProgress.totalPages) * 100}%` : '25%' }}
              />
            </div>
            <p className="font-mono-label text-[#F8F4E8]/60 text-xs">
              {parseProgress.status}
              {parseProgress.totalPages > 0 && ` · Page ${parseProgress.currentPage}/${parseProgress.totalPages}`}
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STICKY NAV — mobile-first
          ════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 mx-3 mt-3 sm:mx-4 sm:mt-4 lg:mx-6 lg:mt-5">
        <div
          className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-[#09090B]"
          style={{
            background: 'rgba(248,244,232,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '3px 3px 0px 0px #09090B',
          }}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 bg-[#09090B] rounded-md flex items-center justify-center border-2 border-[#09090B]"
              style={{ boxShadow: '2px 2px 0px 0px #D2E823' }}
            >
              <span className="font-display text-[#D2E823] text-[10px] sm:text-xs leading-none">K</span>
            </div>
            <span className="font-display text-[#09090B] text-sm sm:text-base glitch-text hidden xs:block">
              KINDLE-REFLOW
            </span>
            <span className="font-display text-[#09090B] text-sm glitch-text xs:hidden">
              K-REFLOW
            </span>
          </a>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-acid btn-acid-sm px-3 py-1.5 text-xs rounded-lg"
            >
              <Upload className="w-3 h-3" />
              <span className="hidden sm:inline">Open PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={onOpenSampleBook}
              className="btn-paper btn-acid-sm px-3 py-1.5 text-xs rounded-lg hidden md:inline-flex"
            >
              <BookOpen className="w-3 h-3" />
              Sample
            </button>
            <a
              href="#library-archive"
              className="btn-paper btn-acid-sm px-3 py-1.5 text-xs rounded-lg hidden sm:inline-flex"
            >
              <Bookmark className="w-3 h-3" />
              <span className="hidden md:inline">Archive </span>({books.length})
            </a>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="btn-paper btn-acid-sm px-2.5 py-1.5 text-xs rounded-lg"
              aria-label="Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════
          MARQUEE TICKER
          ════════════════════════════════════════════════════ */}
      <div className="ticker-bar overflow-hidden mt-3 sm:mt-4">
        <div className="marquee-track">
          <span className="px-4 whitespace-nowrap text-sm">{tickerDouble}</span>
          <span className="px-4 whitespace-nowrap text-sm">{tickerDouble}</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          HERO SECTION — responsive 12-col grid
          ════════════════════════════════════════════════════ */}
      <section className="px-3 sm:px-4 lg:px-6 mt-6 sm:mt-10 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">

          {/* LEFT col — headline + CTAs */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Sticker */}
            <div>
              <span className="acid-sticker float-card text-xs">
                <Zap className="w-3 h-3" />
                Next-Gen PDF Reader · Install on Android
              </span>
            </div>

            {/* Huge display text */}
            <div className="leading-none">
              <h1 className="font-display glitch-text text-[#09090B]"
                style={{ fontSize: 'clamp(2.6rem, 9vw, 7.5rem)', lineHeight: 0.88 }}>
                WE
              </h1>
              <h1 className="font-display glitch-text text-[#09090B]"
                style={{ fontSize: 'clamp(2.6rem, 9vw, 7.5rem)', lineHeight: 0.88 }}>
                REFLOW
              </h1>
              <h1 className="font-display glitch-text text-[#09090B]"
                style={{ fontSize: 'clamp(2.6rem, 9vw, 7.5rem)', lineHeight: 0.88 }}>
                BOOKS.
              </h1>
            </div>

            {/* Sub-text */}
            <p className="font-body text-[#09090B]/70 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed font-medium">
              Transforms static, fixed-page PDFs into fluid, responsive Kindle-style books.
              Bookerly typography · two-page spread · offline dictionary.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-acid px-5 py-3 sm:px-7 sm:py-4 text-sm sm:text-base rounded-xl"
              >
                <Upload className="w-4 h-4" />
                UPLOAD PDF
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenSampleBook}
                className="btn-paper px-5 py-3 sm:px-7 sm:py-4 text-sm sm:text-base rounded-xl"
              >
                <BookOpen className="w-4 h-4" />
                TRY SAMPLE
              </button>
            </div>

            {/* Mobile drop zone shortcut */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`sm:hidden acid-card p-4 flex items-center gap-3 transition-all active:scale-[0.98] ${isDragOver ? 'bg-[#D2E823]' : ''}`}
            >
              <div
                className="w-10 h-10 rounded-xl bg-[#09090B] flex items-center justify-center shrink-0"
                style={{ boxShadow: '3px 3px 0px 0px #D2E823' }}
              >
                <Upload className="w-4 h-4 text-[#D2E823]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-xs">TAP TO UPLOAD PDF</p>
                <p className="font-mono-label text-[10px] text-[#09090B]/60 mt-0.5">Any PDF · 100% private · offline</p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </div>

            {/* Trust badges — wrap on small screens */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Shield, label: '100% Private' },
                { icon: Smartphone, label: 'Works Offline' },
                { icon: Download, label: 'Install on Android' },
                { icon: Layers, label: 'Two-Page Spread' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-[#09090B] rounded-lg bg-[#F8F4E8] font-body text-[11px] sm:text-xs font-semibold"
                  style={{ boxShadow: '2px 2px 0px 0px #09090B' }}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT col — hero image card */}
          <div className="lg:col-span-5 relative mt-2 lg:mt-0">
            {/* Floating accent chip */}
            <div
              className="acid-card-accent float-card-delay absolute -top-3 -right-1 z-20 px-3 py-2 flex items-center gap-1.5 text-xs font-body font-bold hidden sm:flex rounded-xl"
              style={{ boxShadow: '5px 5px 0px 0px #09090B' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#09090B] animate-pulse" />
              LIVE REFLOW
            </div>

            {/* Image card */}
            <div
              className="w-full rounded-2xl sm:rounded-[24px] border-2 border-[#09090B] overflow-hidden"
              style={{ boxShadow: '6px 6px 0px 0px #09090B' }}
            >
              <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
                <img
                  src="/assets/gallery/gallery-1.jpg"
                  alt="Kindle Reflow reading experience"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 space-y-1.5">
                  <span className="font-mono-label text-[#D2E823] text-[10px] uppercase tracking-widest">
                    Fluid Reflow Engine
                  </span>
                  <h3 className="font-display text-white text-lg sm:text-xl glitch-text">
                    TRANSFORM ANY PDF
                  </h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-acid px-3 py-2 text-xs rounded-lg"
                  >
                    <Upload className="w-3 h-3" />
                    OPEN PDF
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info strip below image */}
            <div className="acid-card mt-3 p-3 sm:p-4 flex items-center gap-3">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D2E823] border-2 border-[#09090B] flex items-center justify-center shrink-0"
              >
                <span className="font-display text-[#09090B] text-[10px]">{currentTimeStr}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs sm:text-sm truncate">REFLOW ENGINE READY</p>
                <p className="font-mono-label text-[10px] text-[#09090B]/60 mt-0.5">No signup · Zero tracking</p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          REVERSE MARQUEE
          ════════════════════════════════════════════════════ */}
      <div className="ticker-bar overflow-hidden mt-8 sm:mt-10">
        <div className="marquee-track" style={{ animationDirection: 'reverse' }}>
          <span className="px-4 whitespace-nowrap text-sm">{tickerDouble}</span>
          <span className="px-4 whitespace-nowrap text-sm">{tickerDouble}</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          JITTER PHOTO GALLERY
          ════════════════════════════════════════════════════ */}
      <section className="px-3 sm:px-4 lg:px-6 mt-8 sm:mt-12">
        <div className="mb-5 flex flex-col xs:flex-row xs:items-end justify-between gap-3 border-b-2 border-[#09090B] pb-4">
          <div>
            <span className="font-mono-label text-[10px] sm:text-xs text-[#09090B]/60 uppercase tracking-widest">Engine Architecture</span>
            <h2 className="font-display text-xl sm:text-3xl lg:text-4xl mt-1 glitch-text">
              5 CORE PILLARS
            </h2>
          </div>
          <span className="acid-sticker text-[10px] self-start xs:self-auto" style={{ transform: 'rotate(2deg)' }}>
            Hover / Tap ↓
          </span>
        </div>
        <PhotoGalleryAccordion
          onOpenPdf={() => fileInputRef.current?.click()}
          onOpenSampleBook={onOpenSampleBook}
        />
      </section>

      {/* ════════════════════════════════════════════════════
          BENTO GRID — fully responsive
          ════════════════════════════════════════════════════ */}
      <section className="px-3 sm:px-4 lg:px-6 mt-8 sm:mt-12">
        <div className="mb-5 flex items-end justify-between border-b-2 border-[#09090B] pb-4">
          <div>
            <span className="font-mono-label text-[10px] sm:text-xs text-[#09090B]/60 uppercase tracking-widest">Features</span>
            <h2 className="font-display text-xl sm:text-3xl lg:text-4xl mt-1 glitch-text">
              BUILT FOR READERS.
            </h2>
          </div>
        </div>

        {/* Grid: 1 col mobile → 2 col tablet → 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Big dark card — full width on mobile, 2 col on lg */}
          <div
            className="sm:col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl p-5 sm:p-7 min-h-[220px] sm:min-h-[260px] flex flex-col justify-between bg-[#09090B] border-2 border-[#09090B]"
            style={{ boxShadow: '6px 6px 0px 0px #D2E823' }}
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-30 rounded-2xl"
              style={{ backgroundImage: `url(/assets/gallery/gallery-1.jpg)`, mixBlendMode: 'overlay' }} />
            <div className="absolute inset-0 dot-texture-acid opacity-[0.04] rounded-2xl" />
            <div className="relative z-10">
              <span className="acid-sticker text-[10px]" style={{ transform: 'rotate(-1deg)' }}>
                <Sparkles className="w-3 h-3" /> Core Feature
              </span>
            </div>
            <div className="relative z-10 space-y-2 sm:space-y-3">
              <h3 className="font-display text-[#D2E823] text-2xl sm:text-3xl lg:text-4xl glitch-text leading-tight">
                FLUID REFLOW ENGINE
              </h3>
              <p className="font-body text-[#F8F4E8]/75 text-sm leading-relaxed max-w-md">
                Dynamically extracts & reflows fixed-page PDFs into continuous multi-column book pages tuned to your exact viewport. No zoom fatigue.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-acid px-4 py-2.5 text-xs rounded-xl inline-flex"
              >
                <Upload className="w-3.5 h-3.5" />
                TRY NOW
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Accent floating card */}
          <div
            className="relative overflow-hidden rounded-2xl p-5 min-h-[220px] flex flex-col justify-between bg-[#D2E823] border-2 border-[#09090B] float-card"
            style={{ boxShadow: '5px 5px 0px 0px #09090B' }}
          >
            <div className="absolute inset-0 dot-texture opacity-[0.08] rounded-2xl" />
            <div className="relative z-10"><BookOpen className="w-7 h-7 text-[#09090B]" /></div>
            <div className="relative z-10 space-y-1.5">
              <span className="font-mono-label text-[10px] text-[#09090B]/70 uppercase tracking-widest">02 / Spread</span>
              <h3 className="font-display text-[#09090B] text-xl leading-tight">TWO-PAGE HARDCOVER</h3>
              <p className="font-body text-[#09090B]/75 text-sm leading-relaxed">
                Authentic dual-page spread with book spine shadow.
              </p>
              <button onClick={onOpenSampleBook} className="btn-paper px-3 py-2 text-xs rounded-xl inline-flex mt-1">
                READ SAMPLE
              </button>
            </div>
          </div>

          {/* Dictionary card */}
          <div className="acid-card relative overflow-hidden rounded-2xl p-5 min-h-[180px] flex flex-col justify-between">
            <div><Volume2 className="w-6 h-6 text-[#09090B]" /></div>
            <div className="space-y-1.5">
              <span className="font-mono-label text-[10px] text-[#09090B]/60 uppercase tracking-widest">03 / Lexicon</span>
              <h3 className="font-display text-[#09090B] text-lg leading-tight">OFFLINE DICT</h3>
              <p className="font-body text-[#09090B]/65 text-xs leading-relaxed">
                Tap any word for instant definitions & phonetics — zero internet.
              </p>
            </div>
          </div>

          {/* Typography card */}
          <div
            className="relative overflow-hidden rounded-2xl p-5 min-h-[180px] flex flex-col justify-between bg-[#09090B] border-2 border-[#09090B]"
            style={{ boxShadow: '4px 4px 0px 0px #D2E823' }}
          >
            <div><Type className="w-6 h-6 text-[#D2E823]" /></div>
            <div className="space-y-2">
              <span className="font-mono-label text-[10px] text-[#F8F4E8]/50 uppercase tracking-widest">04 / Typography</span>
              <h3 className="font-display text-[#D2E823] text-lg leading-tight">BOOKERLY MODE</h3>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {(['light', 'sepia', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onUpdateSettings({ theme: t })}
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                      settings.theme === t
                        ? 'border-[#D2E823] scale-110'
                        : 'border-[#F8F4E8]/20 hover:border-[#F8F4E8]/50'
                    }`}
                    title={t}
                  >
                    {t === 'light' ? <Sun className="w-3.5 h-3.5 text-[#F8F4E8]" />
                      : t === 'sepia' ? <Coffee className="w-3.5 h-3.5 text-[#F8F4E8]" />
                      : <Moon className="w-3.5 h-3.5 text-[#F8F4E8]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Archive card */}
          <div className="acid-card relative overflow-hidden rounded-2xl p-5 min-h-[180px] flex flex-col justify-between">
            <div><Bookmark className="w-6 h-6 text-[#09090B]" /></div>
            <div className="space-y-1.5">
              <span className="font-mono-label text-[10px] text-[#09090B]/60 uppercase tracking-widest">05 / Memory</span>
              <h3 className="font-display text-[#09090B] text-lg leading-tight">LOCAL VAULT</h3>
              <p className="font-body text-[#09090B]/65 text-xs leading-relaxed">
                Bookmarks & progress in private IndexedDB. No cloud.
              </p>
              <a href="#library-archive" className="btn-paper px-3 py-2 text-xs rounded-xl inline-flex mt-1">
                ARCHIVE ({books.length})
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HORIZONTAL SCROLL — "NEW DROPS"
          ════════════════════════════════════════════════════ */}
      {books.length > 0 && (
        <section className="px-3 sm:px-4 lg:px-6 mt-8 sm:mt-12">
          <div className="mb-4 flex items-center justify-between border-b-2 border-[#09090B] pb-3">
            <div>
              <span className="font-mono-label text-[10px] text-[#09090B]/60 uppercase tracking-widest">Your Collection</span>
              <h2 className="font-display text-xl sm:text-2xl mt-0.5">NEW DROPS</h2>
            </div>
            <a href="#library-archive" className="btn-paper px-3 py-2 text-xs rounded-xl inline-flex">
              All <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="h-scroll-container gap-3 sm:gap-4 -mx-3 px-3 sm:-mx-4 sm:px-4">
            {books.slice(0, 6).map((book, i) => (
              <div
                key={book.id}
                onClick={() => onOpenBook(book.id)}
                className="shrink-0 w-44 sm:w-56"
              >
                <div
                  className="border-2 border-[#09090B] rounded-xl overflow-hidden transition-all duration-200 active:scale-[0.97]"
                  style={{ boxShadow: '4px 4px 0px 0px #09090B' }}
                >
                  <div
                    className="h-24 sm:h-32 flex items-center justify-center"
                    style={{ backgroundColor: book.coverColor || '#D2E823' }}
                  >
                    <span className="font-display text-[#09090B] text-xl">PDF</span>
                  </div>
                  <div className="bg-[#F8F4E8] p-3 border-t-2 border-[#09090B] space-y-1">
                    <span className="font-mono-label text-[9px] text-[#09090B]/50 uppercase">
                      {String(i + 1).padStart(2, '0')} · {book.pageCount}p
                    </span>
                    <h4 className="font-display text-xs truncate">{book.title}</h4>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#09090B] text-[#D2E823] rounded-md font-mono-label text-[9px] uppercase"
                      style={{ boxShadow: '1px 1px 0px 0px #D2E823' }}
                    >
                      Resume <ArrowRight className="w-2 h-2" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          DROPZONE CTA
          ════════════════════════════════════════════════════ */}
      <section className="px-3 sm:px-4 lg:px-6 mt-8 sm:mt-12">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl sm:rounded-[24px] border-2 border-[#09090B] p-6 sm:p-10 lg:p-14 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all duration-200 active:scale-[0.99] ${
            isDragOver ? 'bg-[#D2E823] -translate-x-1 -translate-y-1' : 'bg-[#09090B]'
          }`}
          style={{ boxShadow: '7px 7px 0px 0px #D2E823' }}
        >
          <div className="absolute inset-0 dot-texture-acid opacity-[0.06] rounded-2xl" />
          <div className="relative z-10 flex-1 space-y-3">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#D2E823] border-2 border-[#F8F4E8] flex items-center justify-center"
              style={{ boxShadow: '4px 4px 0px 0px #F8F4E8' }}
            >
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-[#09090B]" />
            </div>
            <h2 className="font-display text-[#F8F4E8] text-2xl sm:text-4xl lg:text-5xl glitch-text leading-tight">
              DROP ANY PDF.
            </h2>
            <p className="font-body text-[#F8F4E8]/65 text-sm leading-relaxed max-w-md">
              Drag & drop or tap to select. Instantly reflows into a responsive book — no upload, no server, 100% private.
            </p>
          </div>
          <div className="relative z-10 flex flex-row sm:flex-col items-center gap-3 shrink-0">
            <span className="acid-sticker text-xs float-card">
              <Zap className="w-3.5 h-3.5" /> Instant
            </span>
            <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 text-[#D2E823]" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          BOOK ARCHIVE
          ════════════════════════════════════════════════════ */}
      <section id="library-archive" className="px-3 sm:px-4 lg:px-6 mt-8 sm:mt-12">
        <div className="mb-5 flex flex-col xs:flex-row xs:items-end justify-between gap-2 border-b-2 border-[#09090B] pb-4">
          <div>
            <span className="font-mono-label text-[10px] text-[#09090B]/60 uppercase tracking-widest">Archive</span>
            <h2 className="font-display text-xl sm:text-3xl mt-0.5">MY BOOKS ({books.length})</h2>
          </div>
          <p className="font-body text-xs text-[#09090B]/60 hidden sm:block max-w-[180px] text-right">
            Cached locally. Tap to resume.
          </p>
        </div>

        {books.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-[#09090B] p-8 sm:p-12 text-center space-y-4"
            style={{ boxShadow: '4px 4px 0px 0px #09090B' }}
          >
            <BookOpen className="w-10 h-10 mx-auto text-[#09090B]/25" />
            <div className="space-y-1.5">
              <h3 className="font-display text-lg">NO BOOKS YET.</h3>
              <p className="font-body text-sm text-[#09090B]/55 max-w-xs mx-auto">
                Drop any PDF above — it'll be cached here for instant offline access.
              </p>
            </div>
            <button onClick={onOpenSampleBook} className="btn-acid px-5 py-3 rounded-xl inline-flex text-sm">
              <BookOpen className="w-4 h-4" />
              READ SAMPLE BOOK
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl border-2 border-[#09090B] overflow-hidden"
            style={{ boxShadow: '4px 4px 0px 0px #09090B' }}
          >
            {books.map((book, idx) => {
              const lastRead = new Date(book.lastReadTime).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric',
              });
              return (
                <div
                  key={book.id}
                  onClick={() => onOpenBook(book.id)}
                  className={`archival-row p-4 sm:p-5 flex items-center justify-between gap-3 group ${idx < books.length - 1 ? 'border-b-2 border-[#09090B]' : ''}`}
                >
                  {/* Left */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-mono-label text-[10px] text-[#09090B]/40 group-hover:text-[#09090B] transition-colors shrink-0">
                      [{String(idx + 1).padStart(2, '0')}]
                    </span>
                    <div
                      className="w-7 h-9 rounded-md border-2 border-[#09090B] shrink-0 flex items-center justify-center font-mono-label text-white text-[7px] font-bold"
                      style={{ backgroundColor: book.coverColor || '#D2E823', boxShadow: '2px 2px 0px 0px #09090B' }}
                    >
                      PDF
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm sm:text-base truncate">{book.title}</h3>
                      <p className="font-body text-[10px] sm:text-xs text-[#09090B]/55 mt-0.5 truncate">
                        {book.author || 'Local'} · {book.pageCount}p
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="archival-year font-mono-label text-[10px] text-[#09090B]/50 hidden sm:inline tabular-nums">
                      {lastRead}
                    </span>
                    <span
                      className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1.5 font-display text-[10px] border-2 border-[#09090B] rounded-lg bg-[#F8F4E8] group-hover:bg-[#D2E823] transition-colors"
                      style={{ boxShadow: '2px 2px 0px 0px #09090B' }}
                    >
                      Resume <ChevronRight className="w-3 h-3" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove "${book.title}" from local cache?`)) onDeleteBook(book.id);
                      }}
                      className="p-1.5 rounded-lg border-2 border-transparent hover:border-red-300 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#09090B]/40 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════ */}
      <footer className="mt-12 sm:mt-16 bg-[#09090B] text-[#F8F4E8] border-t-2 border-[#09090B]">
        <div className="ticker-bar overflow-hidden border-t-0">
          <div className="marquee-track">
            <span className="px-4 whitespace-nowrap text-sm">{tickerDouble}</span>
            <span className="px-4 whitespace-nowrap text-sm">{tickerDouble}</span>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#D2E823] rounded-md border-2 border-[#F8F4E8] flex items-center justify-center"
                  style={{ boxShadow: '2px 2px 0px 0px #D2E823' }}>
                  <span className="font-display text-[#09090B] text-sm">K</span>
                </div>
                <span className="font-display text-[#F8F4E8] text-base">KINDLE-REFLOW</span>
              </div>
              <p className="font-body text-[#F8F4E8]/55 text-xs leading-relaxed">
                The Neo-Brutalist PDF reader that actually reads like a book. Install on Android.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono-label text-[#F8F4E8]/40 text-[10px] uppercase tracking-widest">100% Client-Side</span>
              </div>
            </div>

            {/* Store */}
            <div className="space-y-3">
              <span className="font-mono-label text-[#F8F4E8]/35 text-[10px] uppercase tracking-widest">Store</span>
              <ul className="space-y-2">
                {[
                  { label: 'Open PDF', action: () => fileInputRef.current?.click() },
                  { label: 'Sample Book', action: onOpenSampleBook },
                  { label: 'My Archive', href: '#library-archive' },
                ].map(({ label, action, href }) => (
                  <li key={label}>
                    {href ? (
                      <a href={href} className="font-display text-xs text-[#F8F4E8] hover:text-[#D2E823] uppercase tracking-wide transition-colors">
                        {label}
                      </a>
                    ) : (
                      <button onClick={action} className="font-display text-xs text-[#F8F4E8] hover:text-[#D2E823] uppercase tracking-wide transition-colors">
                        {label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <span className="font-mono-label text-[#F8F4E8]/35 text-[10px] uppercase tracking-widest">Info</span>
              <ul className="space-y-2">
                {['Reflow Engine', 'Typography', 'Dictionary', 'Privacy', 'Open Source'].map((l) => (
                  <li key={l}>
                    <span className="font-display text-xs text-[#F8F4E8] hover:text-[#D2E823] uppercase tracking-wide transition-colors">
                      {l}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-span-2 sm:col-span-1 space-y-3">
              <span className="font-mono-label text-[#F8F4E8]/35 text-[10px] uppercase tracking-widest">Newsletter</span>
              <p className="font-body text-[#F8F4E8]/50 text-xs leading-relaxed">
                Get updates on new features.
              </p>
              <div className="flex flex-col gap-2">
                <input type="email" placeholder="your@email.com" className="acid-input text-sm" />
                <button
                  className="btn-acid btn-acid-sm w-full justify-center rounded-lg"
                  style={{ background: '#D2E823', color: '#09090B', border: '2px solid #F8F4E8' }}
                >
                  SUBSCRIBE <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-5 border-t-2 border-[#F8F4E8]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-mono-label text-[#F8F4E8]/35 text-[10px] text-center sm:text-left">
              © 2024 KINDLE-REFLOW · NEO-BRUTALIST ACID EDITION
            </span>
            <span className="font-mono-label text-[#F8F4E8]/25 text-[10px]">
              {currentTimeStr} · PWA v2.0.0
            </span>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════════
          FULL-SCREEN MENU OVERLAY
          ════════════════════════════════════════════════════ */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-[#09090B] flex flex-col p-5 sm:p-10 animate-in fade-in duration-200 overflow-y-auto">
          <div className="flex items-center justify-between border-b-2 border-[#F8F4E8]/10 pb-5 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="font-display text-[#D2E823] text-xl sm:text-2xl">KINDLE-REFLOW</span>
              <span className="acid-sticker text-[9px]">Menu</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="btn-acid btn-acid-sm rounded-xl"
              style={{ background: '#F8F4E8', color: '#09090B' }}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">CLOSE</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center py-6">
            <ul className="space-y-4 sm:space-y-7">
              {[
                { label: '01. UPLOAD LOCAL PDF', action: () => { setIsMenuOpen(false); fileInputRef.current?.click(); } },
                { label: '02. READ CLASSIC SAMPLE', action: () => { setIsMenuOpen(false); onOpenSampleBook(); } },
                { label: '03. MY BOOK ARCHIVE', href: '#library-archive' },
                { label: '04. THEME SETTINGS', action: () => setIsMenuOpen(false) },
              ].map(({ label, action, href }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className="font-display text-[#F8F4E8] hover:text-[#D2E823] transition-colors glitch-text block hover:translate-x-2 transition-transform duration-200"
                      style={{ fontSize: 'clamp(1.4rem, 5vw, 3.5rem)' }}
                    >
                      {label}
                    </a>
                  ) : (
                    <button
                      onClick={action}
                      className="font-display text-[#F8F4E8] hover:text-[#D2E823] transition-colors glitch-text block text-left hover:translate-x-2 transition-transform duration-200 w-full"
                      style={{ fontSize: 'clamp(1.4rem, 5vw, 3.5rem)' }}
                    >
                      {label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t-2 border-[#F8F4E8]/10 flex items-center justify-between shrink-0">
            <span className="font-mono-label text-[#F8F4E8]/35 text-[10px] uppercase tracking-widest">v2.0.0 · Acid Edition · PWA</span>
            <span className="font-mono-label text-[#F8F4E8]/25 text-[10px]">{currentTimeStr}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
