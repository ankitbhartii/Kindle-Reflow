import React, { useState, useRef } from 'react';
import { BookMetadata, ReadingSettings } from '../types/reader';
import {
  BookOpen,
  Upload,
  Clock,
  Trash2,
  ShieldCheck,
  Smartphone,
  Sliders,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Coffee,
} from 'lucide-react';
import { ParseProgress } from '../services/pdfParser';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const themeClass = `theme-${settings.theme}`;

  return (
    <div className={`min-h-screen ${themeClass} transition-colors duration-200 flex flex-col`}>
      {/* Top Navbar */}
      <header className="border-b border-(--border-color) bg-(--bg-surface)/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-black text-lg tracking-tight">Kindle Reflow</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold uppercase tracking-wider">
                E-Reader
              </span>
            </div>
          </div>

          {/* Theme Quick Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-(--bg-subtle) border border-(--border-color)">
            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`p-1.5 rounded-lg transition ${
                settings.theme === 'light' ? 'bg-(--bg-surface) shadow-xs text-amber-600' : 'text-(--text-muted)'
              }`}
              title="Light theme"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateSettings({ theme: 'sepia' })}
              className={`p-1.5 rounded-lg transition ${
                settings.theme === 'sepia' ? 'bg-(--bg-surface) shadow-xs text-amber-800' : 'text-(--text-muted)'
              }`}
              title="Sepia theme"
            >
              <Coffee className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`p-1.5 rounded-lg transition ${
                settings.theme === 'dark' ? 'bg-(--bg-surface) shadow-xs text-blue-400' : 'text-(--text-muted)'
              }`}
              title="Dark theme"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Hero Banner / Open Local PDF */}
        <div className="space-y-4">
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-(--text-primary)">
              Reflowable PDF Reader
            </h1>
            <p className="text-sm text-(--text-secondary) max-w-2xl">
              Turn rigid, fixed-page PDFs into fluid Kindle books. Text wraps seamlessly to your screen
              with edge-tap page turns, customizable Bookerly typography, and zero pinch-and-pan.
            </p>
          </div>

          {/* Drag & Drop Card */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/20 scale-[0.99]'
                : 'border-(--border-color) bg-(--bg-surface) hover:border-blue-500/60 hover:bg-(--bg-subtle)/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".pdf,application/pdf"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-(--text-primary)">
              Open PDF from device
            </h3>
            <p className="text-xs text-(--text-secondary) mt-1 max-w-sm mx-auto">
              Drag and drop your PDF here, or tap to browse your local files.
            </p>

            <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-(--text-muted)">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Private (No uploads)
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                Reflows on Mobile & Laptop
              </span>
            </div>
          </div>
        </div>

        {/* Sample Book Feature Card */}
        <div className="p-5 sm:p-6 rounded-2xl border border-(--border-color) bg-(--bg-surface) shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-16 rounded-lg bg-amber-800 text-amber-100 flex flex-col justify-between p-2 shadow-md shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-[9px] font-bold tracking-tighter leading-none">CLASSIC</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-(--text-primary)">
                  The Time Machine
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700">
                  Bundled
                </span>
              </div>
              <p className="text-xs text-(--text-secondary) mt-0.5">by H. G. Wells • 4 Chapters</p>
              <p className="text-xs text-(--text-muted) mt-1 hidden sm:block">
                Experience reflowable typography, edge taps, and chapter progress instantly without uploading anything.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSampleBook}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition active:scale-98 cursor-pointer"
          >
            <span>Read Sample</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Books Shelf */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-(--text-primary)">My Books</h2>
            <span className="text-xs text-(--text-muted)">{books.length} cached locally</span>
          </div>

          {books.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-(--border-color) bg-(--bg-surface)/40 text-(--text-muted) space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm">No custom PDFs cached yet.</p>
              <p className="text-xs">
                Open any PDF to start reading. It will be parsed and cached locally for instant access anytime.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {books.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onOpenBook(b.id)}
                  className="p-4 rounded-2xl border border-(--border-color) bg-(--bg-surface) hover:border-blue-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3">
                    {/* Visual Book Cover Spine */}
                    <div
                      className="w-12 h-16 rounded-md shadow-md flex flex-col justify-end p-1.5 shrink-0 text-white"
                      style={{ backgroundColor: b.coverColor || '#1e3a8a' }}
                    >
                      <span className="text-[8px] font-bold uppercase tracking-wider opacity-80 truncate">
                        PDF
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif font-bold text-sm text-(--text-primary) line-clamp-2 group-hover:text-blue-600 transition">
                        {b.title}
                      </h4>
                      <p className="text-xs text-(--text-secondary) truncate mt-0.5">{b.author}</p>
                      <div className="text-[11px] text-(--text-muted) mt-1 flex items-center gap-2">
                        <span>{b.pageCount} pages</span>
                        <span>•</span>
                        <span>{b.sectionCount} sections</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-(--border-color)/60 flex items-center justify-between text-xs text-(--text-muted)">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(b.lastReadTime).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove "${b.title}" from local cache?`)) {
                            onDeleteBook(b.id);
                          }
                        }}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 transition"
                        title="Delete cached book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Highlights & Gestures Guide */}
        <div className="p-5 rounded-2xl border border-(--border-color) bg-(--bg-subtle)/30 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
            Kindle Controls & Gestures
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-(--text-secondary)">
            <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--border-color)">
              <span className="font-semibold block text-(--text-primary) mb-1">📱 Page Turning</span>
              Swipe left / right on touchscreen, tap right 25% for next, tap left 25% for previous, or use keyboard arrow keys.
            </div>
            <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--border-color)">
              <span className="font-semibold block text-(--text-primary) mb-1">⚙️ Menu & Scrubber</span>
              Tap the center 50% of the screen while reading to reveal the top toolbar, Aa typography controls, and chapter scrubber.
            </div>
            <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--border-color)">
              <span className="font-semibold block text-(--text-primary) mb-1">🔖 Bookmarks & Memory</span>
              Tap the ribbon bookmark in the top right. Reading progress, font size, and themes are automatically saved in local IndexedDB.
            </div>
          </div>
        </div>
      </main>

      {/* Parsing Progress Modal */}
      {isParsing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-(--bg-surface) border border-(--border-color) rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
              <Sliders className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-(--text-primary)">
                Reflowing PDF Document
              </h3>
              <p className="text-xs text-(--text-secondary) mt-1">
                {parseProgress?.status || 'Analyzing typography and extracting paragraphs...'}
              </p>
            </div>

            {parseProgress && parseProgress.totalPages > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-(--text-muted)">
                  <span>Page {parseProgress.currentPage}</span>
                  <span>{parseProgress.totalPages} total pages</span>
                </div>
                <div className="w-full bg-(--progress-track) h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${Math.round(
                        (parseProgress.currentPage / parseProgress.totalPages) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <p className="text-[11px] text-(--text-muted)">
              This happens once. The parsed book will be cached locally in your browser for instant opening later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
