import React, { useState, useRef, useEffect } from 'react';
import { BookMetadata, ReadingSettings } from '../types/reader';
import {
  Upload,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Coffee,
  X,
  BookText,
  Volume2,
  Bookmark,
  Layers,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Trash2,
  BookOpen,
  Check,
  Copy,
} from 'lucide-react';
import { ParseProgress } from '../services/pdfParser';
import { HeroCoins } from './HeroCoins';
import { SwapWord } from './SwapWord';

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
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('23:29');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live real-time clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onSelectPdfFile(file);
      } else {
        alert('Please select a valid PDF file.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectPdfFile(e.target.files[0]);
    }
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('contact@awakeagency.dev');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const themeClass = `theme-${settings.theme}`;

  return (
    <div className={`min-h-screen ${themeClass} font-body-sans p-2.5 sm:p-5 bg-white text-(--c-ink) transition-colors duration-200 selection:bg-white selection:text-[#ff003d]`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,application/pdf"
        className="hidden"
      />

      {/* =========================================================================
          HERO STAGE: Exact Replica of Awake Agency (Red Framed Card)
          ========================================================================= */}
      <div className="w-full rounded-[24px] sm:rounded-[32px] bg-[#ff003d] text-white min-h-[calc(100vh-2.5rem)] relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14 shadow-2xl">
        
        {/* Interactive Physics Coins with Moving 'k.' */}
        <HeroCoins onCoinClick={() => fileInputRef.current?.click()} />

        {/* Top Navbar inside Red Card */}
        <header className="relative z-20 flex items-center justify-between w-full pointer-events-auto">
          {/* Logo with Character Roll on Hover */}
          <div className="flex items-center">
            <a
              href="/"
              className="font-display font-medium text-[1.75rem] sm:text-[1.9rem] tracking-tight text-white select-none cursor-pointer leading-none"
            >
              <SwapWord word="Kindle-Reflow" className="font-medium" />
            </a>
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Open PDF Pill */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="awake-pill px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-white/30 hover:bg-white/40 text-white backdrop-blur-xs transition shadow-xs"
            >
              <span>open pdf.</span>
            </button>

            {/* Read Sample Pill */}
            <button
              onClick={onOpenSampleBook}
              className="awake-pill hidden sm:inline-flex px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition shadow-xs"
            >
              <span>sample book.</span>
            </button>

            {/* Awake Signature Menu Pill */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="awake-pill group px-4 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-white/95 text-[#ff003d] transition shadow-md flex items-center gap-3 font-medium text-xs sm:text-sm"
              aria-label="Open menu"
            >
              <span>menu.</span>
              <div className="flex flex-col gap-1 w-4 items-end overflow-hidden py-0.5">
                <span className="burger-line-1 block h-[1.5px] w-4 bg-[#ff003d] rounded-full" />
                <span className="burger-line-2 block h-[1.5px] w-2.5 group-hover:w-4 transition-all bg-[#ff003d] rounded-full" />
                <span className="burger-line-3 block h-[1.5px] w-3.5 group-hover:w-4 transition-all bg-[#ff003d] rounded-full" />
              </div>
            </button>
          </div>
        </header>

        {/* Big Split Headline Text: Tailored to Kindle Reflow Reader */}
        <div className="relative z-20 my-auto py-6 sm:py-10 pointer-events-none select-none w-full">
          <div className="space-y-1 sm:space-y-3 pointer-events-auto w-full">
            {/* Line 1: WE ............... REFLOW */}
            <div className="font-display font-medium uppercase text-[clamp(2.75rem,7.5vw,7.2rem)] leading-[0.98] tracking-[-0.015em] text-white flex justify-between items-baseline w-full" data-coins-above="">
              <span data-coin-step="1"><SwapWord word="WE" /></span>
              <SwapWord word="REFLOW" />
            </div>

            {/* Line 2: BOOKS ............... PEOPLE */}
            <div className="font-display font-medium uppercase text-[clamp(2.75rem,7.5vw,7.2rem)] leading-[0.98] tracking-[-0.015em] text-white flex justify-between items-baseline w-full" data-coins-above="">
              <span data-coin-step="2"><SwapWord word="BOOKS" /></span>
              <SwapWord word="PEOPLE" />
            </div>

            {/* Line 3: REMEMBER. ............... Kicker Paragraph */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full gap-4 sm:gap-6 pt-1">
              <div className="font-display font-medium uppercase text-[clamp(2.75rem,7.5vw,7.2rem)] leading-[0.98] tracking-[-0.015em] text-white" data-coins-above="">
                <span data-coin-step="3"><SwapWord word="REMEMBER." /></span>
              </div>

              {/* PDF Reader Kicker Paragraph (clean normal-case text) */}
              <div className="pointer-events-auto text-left max-w-[340px] sm:mb-2" data-coins-kicker="">
                <p className="font-body-sans normal-case text-xs sm:text-[13px] font-normal text-white/90 leading-[1.65] tracking-normal">
                  Kindle Reflow transforms static, fixed-page PDFs into fluid, responsive books. Enjoy Bookerly typography, two-page hardcover spreads, built-in offline dictionary, and zero zoom fatigue.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metadata Bar inside Red Card */}
        <div data-coins-floor="" className="relative z-20 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs uppercase tracking-wider text-white font-medium gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="opacity-75">ENGINE:</span>
            <span>PDF.JS REFLOW 2.0 · 100% PRIVATE CLIENT-SIDE</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="opacity-75">FEATURES:</span>
            <span>TWO-PAGE SPREAD · BUILT-IN OFFLINE LEXICON</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Awake Style Overlay Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#ff003d] text-white p-6 sm:p-12 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-white/20 pb-6">
            <div className="flex items-center gap-3">
              <span className="font-display font-black text-2xl tracking-tighter">KINDLE-REFLOW</span>
              <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full bg-white/20">
                Menu
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="awake-pill px-4 py-2 bg-white text-[#ff003d] font-bold text-sm hover:bg-white/90 shadow-lg"
            >
              <X className="w-4 h-4 mr-1.5" />
              <span>close.</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto max-w-5xl w-full mx-auto">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest opacity-70">Navigation</span>
              <ul className="space-y-4 font-display text-3xl sm:text-5xl font-extrabold uppercase">
                <li>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="hover:translate-x-3 transition-transform flex items-center gap-3 cursor-pointer text-left"
                  >
                    <span>01.</span>
                    <span className="hover:underline underline-offset-8">Upload Local PDF</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSampleBook();
                    }}
                    className="hover:translate-x-3 transition-transform flex items-center gap-3 cursor-pointer text-left"
                  >
                    <span>02.</span>
                    <span className="hover:underline underline-offset-8">Read Classic Sample</span>
                  </button>
                </li>
                <li>
                  <a
                    href="#library-archive"
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:translate-x-3 transition-transform flex items-center gap-3 cursor-pointer text-left"
                  >
                    <span>03.</span>
                    <span className="hover:underline underline-offset-8">My Book Archive</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#features-stack"
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:translate-x-3 transition-transform flex items-center gap-3 cursor-pointer text-left"
                  >
                    <span>04.</span>
                    <span className="hover:underline underline-offset-8">Architecture</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-6 md:border-l md:border-white/20 md:pl-8 flex flex-col justify-center">
              <div>
                <span className="text-xs uppercase tracking-widest opacity-70 block mb-2">Reading Palette</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`awake-pill px-4 py-2 text-xs font-semibold ${
                      settings.theme === 'light' ? 'bg-white text-[#ff003d]' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    Light Day
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ theme: 'sepia' })}
                    className={`awake-pill px-4 py-2 text-xs font-semibold ${
                      settings.theme === 'sepia' ? 'bg-white text-[#ff003d]' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    Warm Sepia
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`awake-pill px-4 py-2 text-xs font-semibold ${
                      settings.theme === 'dark' ? 'bg-white text-[#ff003d]' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    OLED Dark
                  </button>
                </div>
              </div>

              <div className="text-xs opacity-80 space-y-1">
                <p><strong>100% Client-Side Privacy:</strong> No document leaves your device.</p>
                <p><strong>Reflow Engine:</strong> Automatic font scaling, column balancing, edge gestures.</p>
                <p><strong>Offline Lexicon:</strong> Morphological dictionary & Web Speech synthesis.</p>
              </div>

              <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs tracking-wider uppercase opacity-75">
                <span>Warsaw Creative Studio Inspired</span>
                <span>v2.0.0 Reflow</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4 flex flex-wrap items-center justify-between text-xs opacity-70">
            <span>Kindle Reflow · Awake Studio UI Experience</span>
            <span>Inspired by awakeagency.dev</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          BELOW THE HERO: Studio Dropzone, Features Stack, and Archive
          ========================================================================= */}
      <main className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-12 sm:py-20 space-y-16 sm:space-y-24">
        {/* AWAKE STUDIO PANEL: Dropzone Container */}
        <section className="relative">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative rounded-[2rem] p-8 sm:p-14 transition-all duration-300 border-2 cursor-pointer overflow-hidden ${
              isDragOver
                ? 'border-[#ff003d] bg-[#ff003d]/5 scale-[0.99] shadow-2xl'
                : 'border-(--c-grey-line) bg-(--c-grey-panel)/80 hover:bg-(--c-grey-panel) hover:border-(--c-ink)/30 shadow-md'
            }`}
          >
            {/* Background Ribbon Vector */}
            <div className="absolute -bottom-10 -right-10 w-72 h-72 opacity-15 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <img src="/assets/awake/svg-19.svg" alt="" className="w-full h-full object-contain" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-(--c-ink) text-(--c-white) flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-7 h-7 text-[#ff003d]" />
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-(--c-ink) tracking-tight">
                  Drop any PDF document here.
                </h2>
                <p className="text-sm text-(--text-secondary) mt-1.5 leading-relaxed">
                  Drop your textbook, novel, research paper, or manual to reflow it into responsive Kindle pages instantly.
                </p>
              </div>

              <div className="pt-2">
                <span className="awake-pill px-6 py-3 text-sm font-bold bg-(--c-ink) text-white group-hover:bg-[#ff003d] transition-colors shadow-lg">
                  Browse local files
                </span>
              </div>

              {/* Security & Feature Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-(--text-muted)">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--bg-surface) border border-(--border-color) shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Private (No uploads)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--bg-surface) border border-(--border-color) shadow-xs">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Reflows on Mobile & Laptop</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--bg-surface) border border-(--border-color) shadow-xs">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Two-Page Spread Ready</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* AWAKE "SERVICES STACK": 4 Tilted Feature Cards */}
        <section id="features-stack" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-(--c-grey-line) pb-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#ff003d]">Engine Architecture</span>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-(--c-ink) tracking-tight">
                BUILT FOR PURE READING ERGONOMICS.
              </h2>
            </div>
            <p className="text-xs text-(--text-muted) max-w-xs">
              Every detail engineered to replicate the tactile comfort and typographic elegance of physical books.
            </p>
          </div>

          {/* 4 Cards Grid with Awake Rotations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {/* Card 1 */}
            <div className="tilt-card-1 rounded-[1.5rem] p-6 bg-white border border-(--c-grey-line) shadow-md flex flex-col justify-between min-h-[280px]">
              <div>
                <span className="font-display font-bold text-xs text-[#ff003d] tracking-wider uppercase">01 / REFLOW</span>
                <h3 className="font-display font-bold text-xl text-(--c-ink) mt-2 tracking-tight">
                  Reflowable Geometry
                </h3>
                <p className="text-xs text-(--text-secondary) mt-2 leading-relaxed">
                  Eliminate pinch-and-pan forever. Continuous text flow reflows multi-column PDFs into elegant book pages matching your exact viewport.
                </p>
              </div>
              <div className="pt-4 border-t border-(--c-grey-line) flex items-center justify-between text-xs text-(--text-muted)">
                <span>Continuous Layout</span>
                <BookText className="w-4 h-4 text-(--c-ink)" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="tilt-card-2 rounded-[1.5rem] p-6 bg-(--c-grey-panel) border border-(--c-grey-line) shadow-md flex flex-col justify-between min-h-[280px]">
              <div>
                <span className="font-display font-bold text-xs text-[#ff003d] tracking-wider uppercase">02 / SPREAD</span>
                <h3 className="font-display font-bold text-xl text-(--c-ink) mt-2 tracking-tight">
                  Two-Page Hardcover
                </h3>
                <p className="text-xs text-(--text-secondary) mt-2 leading-relaxed">
                  Desktop hardcover experience with authentic spine shadow and split column layout, giving you an immersive dual-page reading view.
                </p>
              </div>
              <div className="pt-4 border-t border-(--c-grey-line) flex items-center justify-between text-xs text-(--text-muted)">
                <span>Hardcover Mode</span>
                <Layers className="w-4 h-4 text-(--c-ink)" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="tilt-card-3 rounded-[1.5rem] p-6 bg-[#e8e9eb] border border-(--c-grey-line) shadow-md flex flex-col justify-between min-h-[280px]">
              <div>
                <span className="font-display font-bold text-xs text-[#ff003d] tracking-wider uppercase">03 / LEXICON</span>
                <h3 className="font-display font-bold text-xl text-(--c-ink) mt-2 tracking-tight">
                  Offline Dictionary
                </h3>
                <p className="text-xs text-(--text-secondary) mt-2 leading-relaxed">
                  Instant word definitions, morphological stemming, phonetic pronunciation, and Datamuse fallback without sending a single byte over the web.
                </p>
              </div>
              <div className="pt-4 border-t border-(--c-grey-line) flex items-center justify-between text-xs text-(--text-muted)">
                <span>100% Offline</span>
                <Volume2 className="w-4 h-4 text-(--c-ink)" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="tilt-card-4 rounded-[1.5rem] p-6 bg-[#dbdcde] border border-(--c-grey-line) shadow-md flex flex-col justify-between min-h-[280px]">
              <div>
                <span className="font-display font-bold text-xs text-[#ff003d] tracking-wider uppercase">04 / MEMORY</span>
                <h3 className="font-display font-bold text-xl text-(--c-ink) mt-2 tracking-tight">
                  Persistent State
                </h3>
                <p className="text-xs text-(--text-secondary) mt-2 leading-relaxed">
                  Your bookmarks, annotations, exact reading progress %, and custom font sizes stay synced in your browser's private IndexedDB.
                </p>
              </div>
              <div className="pt-4 border-t border-(--c-grey-line) flex items-center justify-between text-xs text-(--text-muted)">
                <span>Instant Resume</span>
                <Bookmark className="w-4 h-4 text-(--c-ink)" />
              </div>
            </div>
          </div>
        </section>

        {/* AWAKE "ARCHIVE" SECTION: Bookshelf Rows */}
        <section id="library-archive" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-(--c-grey-line) pb-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#ff003d]">Archive</span>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-(--c-ink) tracking-tight">
                MY BOOKS ({books.length})
              </h2>
            </div>
            <p className="text-xs text-(--text-muted)">
              Indexed locally on this device. Click any title to resume reading.
            </p>
          </div>

          {books.length === 0 ? (
            <div className="rounded-[2rem] p-12 text-center bg-(--c-grey-panel)/60 border border-(--c-grey-line) space-y-4">
              <BookOpen className="w-12 h-12 mx-auto text-(--text-muted) opacity-40" />
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-(--c-ink)">No custom PDFs cached yet.</h3>
                <p className="text-xs text-(--text-secondary) max-w-md mx-auto">
                  Drag and drop any PDF above to begin. It will be reflowed and cached here for instantaneous reading anytime.
                </p>
              </div>
              <button
                onClick={onOpenSampleBook}
                className="awake-pill px-5 py-2.5 text-xs font-semibold bg-(--c-ink) text-white hover:bg-[#ff003d] transition shadow-md"
              >
                Read Classic Sample Book Instead
              </button>
            </div>
          ) : (
            <div className="rounded-[2rem] bg-(--c-grey-panel)/70 border border-(--c-grey-line) overflow-hidden shadow-sm divide-y divide-(--c-grey-line)">
              {books.map((b, index) => {
                const bookIndexStr = String(index + 1).padStart(2, '0');
                const lastRead = new Date(b.lastReadTime).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={b.id}
                    onClick={() => onOpenBook(b.id)}
                    className="archival-row p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      {/* Index Tag */}
                      <span className="font-display font-semibold text-xs text-(--text-muted) group-hover:text-[#ff003d] transition-colors tabular-nums">
                        [{bookIndexStr}]
                      </span>

                      {/* Visual Color Pill Spine */}
                      <div
                        className="w-8 h-10 rounded-md shadow-sm shrink-0 flex items-center justify-center text-white text-[8px] font-bold uppercase"
                        style={{ backgroundColor: b.coverColor || '#1e3a8a' }}
                      >
                        PDF
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base sm:text-lg text-(--c-ink) group-hover:text-[#ff003d] transition-colors truncate">
                          {b.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-(--text-muted) mt-0.5">
                          <span>{b.author || 'Local Document'}</span>
                          <span>•</span>
                          <span>{b.pageCount} pages</span>
                          <span>•</span>
                          <span>{b.sectionCount} sections</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="archival-dot w-2 h-2 rounded-full bg-(--c-ink) opacity-40 transition-all duration-300" />
                        <span className="archival-year text-xs font-semibold text-(--text-secondary) tabular-nums">
                          {lastRead}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="awake-pill hidden sm:inline-flex px-3 py-1 text-xs font-semibold bg-white border border-(--c-grey-line) group-hover:bg-[#ff003d] group-hover:text-white group-hover:border-[#ff003d] transition-all shadow-xs">
                          <span>Resume</span>
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove "${b.title}" from local cache?`)) {
                              onDeleteBook(b.id);
                            }
                          }}
                          className="p-1.5 rounded-full text-(--text-muted) hover:text-[#ff003d] hover:bg-white/80 transition shadow-xs"
                          title="Delete cached book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* AWAKE CTA BAND: Red Banner with Ribbons & Sample Launcher */}
        <section className="relative rounded-[2rem] bg-[#ff003d] text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
          {/* Background Ribbon Vector */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none select-none">
            <img src="/assets/awake/svg-4.svg" alt="" className="w-full h-full object-cover" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs uppercase tracking-widest font-bold opacity-80">Instant Sample Experience</span>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                NO PDF ON HAND?<br />
                START READING NOW.
              </h2>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                Test the reflow engine immediately with H. G. Wells' <em>The Time Machine</em> bundled with complete Bookerly styling, dictionary lookup, and chapter navigation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={onOpenSampleBook}
                className="awake-pill px-8 py-4 bg-white text-[#ff003d] font-bold text-sm sm:text-base hover:bg-white/90 shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Read Sample Classic</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="awake-pill px-6 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm sm:text-base border border-white/30 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload PDF</span>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-10 border-t border-(--c-grey-line) flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-(--text-muted) pb-8">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-(--c-ink)">Kindle Reflow</span>
            <span>•</span>
            <span>Inspired by Awake Digital Studio (Warsaw)</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Client-Side PDF.js</span>
            <span>IndexedDB Memory</span>
            <span>Offline Dictionary</span>
          </div>
        </footer>
      </main>

      {/* Parsing Progress Modal with Awake Studio Panel */}
      {isParsing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-(--c-grey-line) rounded-[2rem] p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#ff003d]/10 text-[#ff003d] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-[#ff003d] animate-spin" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#ff003d]">Reflow Engine 2.0</span>
              <h3 className="font-display font-bold text-2xl text-(--c-ink) tracking-tight mt-1">
                Reflowing Document
              </h3>
              <p className="text-xs text-(--text-secondary) mt-1.5 leading-relaxed">
                {parseProgress?.status || 'Analyzing typography, flowing paragraphs, and detecting headings...'}
              </p>
            </div>

            {parseProgress && parseProgress.totalPages > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-(--text-muted) tabular-nums">
                  <span>Page {parseProgress.currentPage}</span>
                  <span>{parseProgress.totalPages} total pages</span>
                </div>
                <div className="w-full bg-(--c-grey-panel) h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-[#ff003d] h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${Math.round(
                        (parseProgress.currentPage / parseProgress.totalPages) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <p className="text-[11px] text-(--text-muted) leading-relaxed">
              This one-time parse is performed 100% locally on your device. The reflowed book will be stored in your browser's private IndexedDB for instant offline reading.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
