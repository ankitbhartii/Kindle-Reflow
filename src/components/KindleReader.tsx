import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StoredBook,
  ReadingSettings,
  ReadingProgress,
  Bookmark,
  HighlightItem,
  HighlightColor,
  DictionaryEntry,
} from '../types/reader';
import { FontSettingsModal } from './FontSettingsModal';
import { ContentsDrawer } from './ContentsDrawer';
import { KindleProgressScrubber } from './KindleProgressScrubber';
import { TextSelectionToolbar } from './TextSelectionToolbar';
import { DictionarySheet } from './DictionarySheet';
import { AddNoteModal } from './AddNoteModal';
import {
  Bookmark as BookmarkIcon,
  Menu,
  Type,
  ArrowLeft,
  Columns,
  Square,
} from 'lucide-react';
import {
  saveReadingProgress,
  saveStoredSettings,
  addBookmarkToStorage,
  removeBookmarkFromStorage,
  getBookmarks,
  getHighlights,
  saveHighlightToStorage,
  deleteHighlightFromStorage,
} from '../services/storage';
import { lookupDefinition } from '../services/dictionary';

interface KindleReaderProps {
  book: StoredBook;
  initialProgress?: ReadingProgress | null;
  initialSettings: ReadingSettings;
  onBackToLibrary: () => void;
}

export const KindleReader: React.FC<KindleReaderProps> = ({
  book,
  initialProgress,
  initialSettings,
  onBackToLibrary,
}) => {
  // Reading Settings
  const [settings, setSettings] = useState<ReadingSettings>(initialSettings);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isScrubberOpen, setIsScrubberOpen] = useState(false);

  // Position within book
  const [sectionIndex, setSectionIndex] = useState(
    initialProgress?.sectionIndex ?? 0
  );
  const [pageIndex, setPageIndex] = useState(
    initialProgress?.pageIndex ?? 0
  );
  const [totalSectionPages, setTotalSectionPages] = useState(1);

  // Bookmarks & Highlights
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);

  // Selection & Dictionary State
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [dictEntry, setDictEntry] = useState<DictionaryEntry | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // DOM refs for pagination measurement
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Touch handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  // Load Bookmarks & Highlights for this book
  useEffect(() => {
    getBookmarks(book.metadata.id).then(setBookmarks);
    getHighlights(book.metadata.id).then(setHighlights);
  }, [book.metadata.id]);

  // Current active section data
  const currentSection = book.sections[sectionIndex] || book.sections[0];

  // Calculate overall reading percentage
  const calculateOverallPercentage = useCallback(() => {
    if (!book.sections.length) return 0;
    const priorWordCount = book.sections
      .slice(0, sectionIndex)
      .reduce((sum, s) => sum + s.wordCount, 0);
    const currentSectionWordFraction =
      currentSection && totalSectionPages > 0
        ? (pageIndex / Math.max(1, totalSectionPages)) * currentSection.wordCount
        : 0;
    const totalWords = Math.max(1, book.metadata.totalWords);
    return Math.min(100, Math.max(0, ((priorWordCount + currentSectionWordFraction) / totalWords) * 100));
  }, [book, sectionIndex, pageIndex, totalSectionPages, currentSection]);

  const overallPercentage = calculateOverallPercentage();

  // Check if current page is bookmarked
  useEffect(() => {
    const found = bookmarks.some(
      (b) => b.sectionIndex === sectionIndex && b.pageIndex === pageIndex
    );
    setIsBookmarked(found);
  }, [bookmarks, sectionIndex, pageIndex]);

  // Save progress periodically
  useEffect(() => {
    const progress: ReadingProgress = {
      bookId: book.metadata.id,
      sectionIndex,
      pageIndex,
      percentage: overallPercentage,
      lastReadTime: Date.now(),
    };
    const timer = setTimeout(() => {
      saveReadingProgress(progress);
    }, 400);
    return () => clearTimeout(timer);
  }, [book.metadata.id, sectionIndex, pageIndex, overallPercentage]);

  // Save Settings whenever changed
  const handleUpdateSettings = (newSettings: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveStoredSettings(updated);
      return updated;
    });
  };

  // Container dimensions state for accurate column styling & responsive spread
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  // Measure and calculate total virtual pages in the current section
  const measurePages = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    const container = containerRef.current;
    const content = contentRef.current;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0) return;
    setContainerWidth(width);
    if (height > 0) setContainerHeight(height);

    const isTwoCol = Boolean(settings.twoColumnDesktop) && width >= 640;
    const columnGap = isTwoCol ? 48 : 32;
    const singleColWidth = isTwoCol ? Math.floor((width - columnGap) / 2) : width;
    const scrollWidth = content.scrollWidth;

    // Total virtual pages (single pages or two-page spreads)
    const rawCols = Math.max(1, Math.round((scrollWidth + columnGap) / (singleColWidth + columnGap)));
    const computedPages = isTwoCol ? Math.ceil(rawCols / 2) : rawCols;

    setTotalSectionPages(computedPages);
    if (pageIndex >= computedPages) {
      setPageIndex(Math.max(0, computedPages - 1));
    }
  }, [pageIndex, settings.twoColumnDesktop]);

  // Observe container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      measurePages();
    });
    observer.observe(containerRef.current);
    measurePages();
    return () => observer.disconnect();
  }, [measurePages]);

  // Recalculate pages on font size, margin, section, or two-column change
  useEffect(() => {
    const timer = setTimeout(() => {
      measurePages();
    }, 50);
    return () => clearTimeout(timer);
  }, [measurePages, settings.fontSize, settings.fontFamily, settings.lineHeight, settings.margin, settings.textAlign, settings.twoColumnDesktop, sectionIndex]);

  // Page Turn Actions
  const goToNextPage = useCallback(() => {
    if (pageIndex < totalSectionPages - 1) {
      setPageIndex((p) => p + 1);
    } else if (sectionIndex < book.sections.length - 1) {
      setSectionIndex((s) => s + 1);
      setPageIndex(0);
    }
  }, [pageIndex, totalSectionPages, sectionIndex, book.sections.length]);

  const goToPrevPage = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex((p) => p - 1);
    } else if (sectionIndex > 0) {
      setSectionIndex((s) => s - 1);
      setPageIndex(9999);
    }
  }, [pageIndex, sectionIndex]);

  // Jump to specific percentage across entire book
  const handleJumpPercentage = (targetPct: number) => {
    if (!book.sections.length) return;
    const targetWordIndex = (targetPct / 100) * book.metadata.totalWords;
    let accumulatedWords = 0;
    let targetSectionIdx = 0;

    for (let i = 0; i < book.sections.length; i++) {
      accumulatedWords += book.sections[i].wordCount;
      if (accumulatedWords >= targetWordIndex || i === book.sections.length - 1) {
        targetSectionIdx = i;
        break;
      }
    }

    setSectionIndex(targetSectionIdx);
    setPageIndex(0);
  };

  // Toggle Bookmark for current page
  const handleToggleBookmark = async () => {
    if (isBookmarked) {
      const match = bookmarks.find(
        (b) => b.sectionIndex === sectionIndex && b.pageIndex === pageIndex
      );
      if (match) {
        const updated = await removeBookmarkFromStorage(book.metadata.id, match.id);
        setBookmarks(updated);
      }
    } else {
      const snippet = currentSection?.paragraphs[0]?.text?.slice(0, 100) || 'Bookmarked location';
      const newBookmark: Bookmark = {
        id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        bookId: book.metadata.id,
        sectionIndex,
        pageIndex,
        percentage: overallPercentage,
        textSnippet: snippet,
        chapterTitle: currentSection?.title || `Section ${sectionIndex + 1}`,
        createdAt: Date.now(),
      };
      const updated = await addBookmarkToStorage(newBookmark);
      setBookmarks(updated);
    }
  };

  // Handle Text Selection Detection (Mobile touch & mouse)
  const handleTextSelection = () => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        return;
      }
      const text = sel.toString().trim();
      if (text.length > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSelectedText(text);
          setSelectionCoords({
            x: rect.left + rect.width / 2,
            y: rect.top,
          });
          setIsToolbarOpen(true);

          // If 1-2 words, look up dictionary definition instantly
          const words = text.split(/\s+/).filter(Boolean);
          if (words.length <= 2) {
            lookupDefinition(words[0]).then((entry) => {
              if (entry) {
                setDictEntry(entry);
                setIsDictOpen(true);
              }
            });
          }
        }
      }
    }, 40);
  };

  // Add Highlight Action
  const handleAddHighlight = async (color: HighlightColor) => {
    if (!selectedText) return;
    const newHl: HighlightItem = {
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bookId: book.metadata.id,
      sectionIndex,
      text: selectedText,
      color,
      chapterTitle: currentSection?.title,
      createdAt: Date.now(),
    };
    const updated = await saveHighlightToStorage(newHl);
    setHighlights(updated);
    setIsToolbarOpen(false);
    window.getSelection()?.removeAllRanges();
  };

  // Save Note Action
  const handleSaveNote = async (note: string) => {
    if (!selectedText) return;
    const newHl: HighlightItem = {
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bookId: book.metadata.id,
      sectionIndex,
      text: selectedText,
      note,
      color: 'teal',
      chapterTitle: currentSection?.title,
      createdAt: Date.now(),
    };
    const updated = await saveHighlightToStorage(newHl);
    setHighlights(updated);
    setIsToolbarOpen(false);
    setIsNoteModalOpen(false);
    window.getSelection()?.removeAllRanges();
  };

  // Pin / Bookmark selected quote
  const handlePinSelection = async () => {
    if (!selectedText) return;
    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bookId: book.metadata.id,
      sectionIndex,
      pageIndex,
      percentage: overallPercentage,
      textSnippet: selectedText.slice(0, 120),
      chapterTitle: currentSection?.title || `Section ${sectionIndex + 1}`,
      createdAt: Date.now(),
    };
    const updated = await addBookmarkToStorage(newBookmark);
    setBookmarks(updated);
    setIsToolbarOpen(false);
    window.getSelection()?.removeAllRanges();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFontModalOpen || isDrawerOpen || isNoteModalOpen) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === 'Escape') {
        setIsControlsVisible((v) => !v);
        setIsToolbarOpen(false);
        setIsDictOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage, isFontModalOpen, isDrawerOpen, isNoteModalOpen]);

  // Touch Swipe & Tap Zone Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchStartTimeRef.current = Date.now();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handleTextSelection();

    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;
    const deltaTime = Date.now() - touchStartTimeRef.current;

    // Check if it's a horizontal swipe
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaTime < 400) {
      if (deltaX < 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      return;
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Tap Zone click handler (Left 22%, Center 56%, Right 22%)
  const handleSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If text was just selected, do not trigger edge tap
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      return;
    }

    // Dismiss any active toolbar or dictionary card on canvas tap
    if (isToolbarOpen || isDictOpen) {
      setIsToolbarOpen(false);
      setIsDictOpen(false);
      return;
    }

    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a') || target.closest('mark')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const leftZone = width * 0.22;
    const rightZone = width * 0.78;

    if (clickX < leftZone) {
      goToPrevPage();
    } else if (clickX > rightZone) {
      goToNextPage();
    } else {
      setIsControlsVisible((prev) => !prev);
    }
  };

  // Words remaining in chapter
  const wordsRemainingInChapter =
    currentSection && totalSectionPages > 0
      ? Math.max(0, Math.round(((totalSectionPages - pageIndex) / totalSectionPages) * currentSection.wordCount))
      : 0;
  const estimatedMinutesLeft = Math.max(1, Math.round(wordsRemainingInChapter / 200));

  // Determine font family css class
  const fontClass =
    settings.fontFamily === 'bookerly'
      ? 'font-kindle-bookerly'
      : settings.fontFamily === 'serif'
      ? 'font-kindle-serif'
      : settings.fontFamily === 'mono'
      ? 'font-kindle-mono'
      : 'font-kindle-sans';

  // Determine margin css class
  const marginClass =
    settings.margin === 'compact'
      ? 'px-4 sm:px-8'
      : settings.margin === 'wide'
      ? 'px-8 sm:px-24'
      : 'px-6 sm:px-16';

  // Determine line height multiplier
  const lineHeightVal =
    settings.lineHeight === 'tight'
      ? 1.45
      : settings.lineHeight === 'relaxed'
      ? 2.1
      : 1.75;

  const themeClass = `theme-${settings.theme}`;

  // Two-page desktop spread variables
  const isTwoCol = Boolean(settings.twoColumnDesktop) && containerWidth >= 640;
  const columnGap = isTwoCol ? 48 : 32;
  const singleColWidth = isTwoCol && containerWidth > 0 ? Math.floor((containerWidth - columnGap) / 2) : (containerWidth || 600);

  // Section highlights
  const sectionHighlights = highlights.filter((h) => h.sectionIndex === sectionIndex);

  // Helper to render text with colored highlights
  const renderHighlightedContent = (text: string) => {
    if (!sectionHighlights.length) return text;
    const activeHls = sectionHighlights.filter((h) => text.includes(h.text));
    if (!activeHls.length) return text;

    let segments: Array<{ text: string; color?: HighlightColor; note?: string }> = [{ text }];

    for (const hl of activeHls) {
      const nextSegments: typeof segments = [];
      for (const seg of segments) {
        if (seg.color) {
          nextSegments.push(seg);
          continue;
        }
        const parts = seg.text.split(hl.text);
        for (let i = 0; i < parts.length; i++) {
          if (parts[i].length > 0) {
            nextSegments.push({ text: parts[i] });
          }
          if (i < parts.length - 1) {
            nextSegments.push({ text: hl.text, color: hl.color, note: hl.note });
          }
        }
      }
      segments = nextSegments;
    }

    return segments.map((seg, idx) => {
      if (!seg.color) return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
      const colorBg =
        seg.color === 'teal'
          ? 'bg-teal-300/60 dark:bg-teal-900/60 text-teal-950 dark:text-teal-100'
          : seg.color === 'yellow'
          ? 'bg-amber-300/70 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100'
          : seg.color === 'pink'
          ? 'bg-pink-300/60 dark:bg-pink-900/60 text-pink-950 dark:text-pink-100'
          : 'bg-orange-300/60 dark:bg-orange-900/60 text-orange-950 dark:text-orange-100';

      return (
        <mark
          key={idx}
          className={`${colorBg} rounded-xs px-0.5 transition-colors cursor-pointer`}
          title={seg.note ? `Note: ${seg.note}` : 'Highlight'}
        >
          {seg.text}
        </mark>
      );
    });
  };

  return (
    <div
      className={`fixed inset-0 select-text overflow-hidden flex flex-col ${themeClass} transition-colors duration-200`}
    >
      {/* Top Header Bar with Awake Floating Pill Design */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 ${
          isControlsVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-5xl mx-auto rounded-full bg-(--bg-surface)/90 backdrop-blur-md border border-(--c-grey-line) shadow-xl px-3 sm:px-5 h-12 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToLibrary}
              className="awake-pill px-3 py-1.5 rounded-full text-xs font-semibold border border-(--c-grey-line) hover:border-(--c-ink) text-(--text-primary) transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Library</span>
            </button>
          </div>

          {/* Book Title & Chapter In Header */}
          <div className="text-center min-w-0 max-w-[160px] sm:max-w-md px-2">
            <h1 className="font-display font-bold text-xs sm:text-sm truncate text-(--text-primary)">
              {book.metadata.title}
            </h1>
            <p className="text-[10px] text-(--text-muted) truncate">{currentSection.title}</p>
          </div>

          {/* Action Icons with Awake Pill Styling */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Desktop Two-page spread quick toggle */}
            <button
              onClick={() => handleUpdateSettings({ twoColumnDesktop: !settings.twoColumnDesktop })}
              className={`awake-pill hidden md:inline-flex p-2 rounded-full border border-(--c-grey-line) transition ${
                settings.twoColumnDesktop
                  ? 'text-[#ff003d] border-[#ff003d] bg-[#ff003d]/10'
                  : 'text-(--text-secondary) hover:border-(--c-ink)'
              }`}
              title={settings.twoColumnDesktop ? 'Switch to single page' : 'Switch to two-page spread'}
            >
              {settings.twoColumnDesktop ? <Columns className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>

            <button
              onClick={handleToggleBookmark}
              className={`awake-pill p-2 rounded-full border border-(--c-grey-line) transition ${
                isBookmarked
                  ? 'text-[#ff003d] border-[#ff003d] bg-[#ff003d]/10'
                  : 'text-(--text-secondary) hover:border-(--c-ink)'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
            >
              <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-[#ff003d]' : ''}`} />
            </button>

            <button
              onClick={() => setIsFontModalOpen(true)}
              className="awake-pill p-2 rounded-full border border-(--c-grey-line) text-(--text-secondary) hover:border-(--c-ink) transition"
              title="Typography & Theme Settings"
            >
              <Type className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="awake-pill px-3 py-1.5 rounded-full border border-(--c-grey-line) text-(--text-primary) hover:border-(--c-ink) transition flex items-center gap-1.5 text-xs font-semibold"
              title="Table of Contents, Highlights & Bookmarks"
            >
              <Menu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Index</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bookmark Ribbon Flap (Top-right corner of page) */}
      <div
        onClick={handleToggleBookmark}
        className="absolute top-0 right-4 sm:right-8 z-30 cursor-pointer p-1 group"
        title={isBookmarked ? 'Page bookmarked' : 'Click to bookmark'}
      >
        <div
          className={`w-6 sm:w-7 h-10 transition-all duration-300 transform origin-top flex items-end justify-center pb-1 ${
            isBookmarked
              ? 'bg-amber-500 shadow-md translate-y-0 opacity-100'
              : 'bg-neutral-400/30 -translate-y-6 opacity-40 group-hover:-translate-y-2 group-hover:opacity-80'
          }`}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
          }}
        >
          {isBookmarked && <span className="text-[9px] text-white font-bold mb-1">★</span>}
        </div>
      </div>

      {/* Main Reflowable Reading Canvas */}
      <main
        className="flex-1 relative overflow-hidden flex flex-col cursor-default"
        onClick={handleSurfaceClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseUp={handleTextSelection}
      >
        {/* Subtle Running Header at top of page (Kindle aesthetic) */}
        <div className="h-8 sm:h-10 pt-2 px-6 flex items-center justify-between text-[11px] text-(--text-muted) opacity-60">
          <span className="truncate max-w-[200px] sm:max-w-xs">{book.metadata.title}</span>
          <span className="truncate max-w-[150px] sm:max-w-xs text-right">{currentSection.title}</span>
        </div>

        {/* Reflow Outer Margin Container */}
        <div className={`flex-1 overflow-hidden min-h-0 flex flex-col ${marginClass} py-3 sm:py-6`}>
          {/* Inner Zero-Padding Clipping Viewport */}
          <div
            ref={containerRef}
            className="w-full h-full overflow-hidden relative"
          >
            {/* Multi-column Reflow Canvas */}
            <div
              ref={contentRef}
              className={`w-full kindle-reflow-content ${fontClass} ${(settings.textAlign || 'left') === 'justify' ? 'align-justify' : 'align-left'} transition-transform duration-200 ease-out`}
              style={{
                fontSize: `${settings.fontSize}px`,
                lineHeight: lineHeightVal,
                width: containerWidth > 0 ? `${containerWidth}px` : '100%',
                height: containerHeight > 0 ? `${containerHeight}px` : '100%',
                maxHeight: containerHeight > 0 ? `${containerHeight}px` : undefined,
                columnCount: isTwoCol ? 2 : 1,
                columnWidth: `${singleColWidth}px`,
                columnGap: `${columnGap}px`,
                columnFill: 'auto',
                columnRule: isTwoCol ? '1px solid var(--border-color)' : 'none',
                transform: `translateX(-${pageIndex * ((containerWidth || 600) + columnGap)}px)`,
              }}
            >
              {/* Section Heading */}
              <div className="pb-4" style={{ breakInside: 'avoid', breakAfter: 'avoid' }}>
                <h1 className="text-xl sm:text-2xl font-bold text-center tracking-tight text-(--text-primary)">
                  {currentSection.title}
                </h1>
                <div className="w-12 h-0.5 bg-(--text-muted) opacity-40 mx-auto my-3" />
              </div>

              {/* Paragraphs, Code Blocks, and Reflowed Text */}
              {currentSection.paragraphs.map((p, idx) => {
                if (p.type === 'heading') {
                  return (
                    <h2
                      key={idx}
                      className="text-lg sm:text-xl font-bold text-center mt-6 mb-3 text-(--text-primary)"
                    >
                      {p.text}
                    </h2>
                  );
                }
                if (p.type === 'subheading') {
                  return (
                    <h3
                      key={idx}
                      className="text-base sm:text-lg font-semibold italic text-center mb-4 text-(--text-secondary)"
                    >
                      {p.text}
                    </h3>
                  );
                }
                if (p.type === 'quote') {
                  return (
                    <blockquote
                      key={idx}
                      className="my-4 pl-4 border-l-2 border-(--text-muted) italic text-(--text-secondary)"
                    >
                      {renderHighlightedContent(p.text)}
                    </blockquote>
                  );
                }
                if (p.type === 'code') {
                  return (
                    <pre
                      key={idx}
                      className="my-3 p-3.5 rounded-xl bg-(--bg-subtle) border border-(--border-color) font-kindle-mono text-xs sm:text-sm overflow-x-auto whitespace-pre leading-relaxed select-text shadow-inner"
                      style={{ breakInside: 'avoid' }}
                    >
                      <code>{p.text}</code>
                    </pre>
                  );
                }
                return (
                  <p key={idx} className="mb-3 text-(--text-primary)">
                    {renderHighlightedContent(p.text)}
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tap edge visual hints on desktop hover */}
        <div className="hidden sm:block absolute left-0 top-12 bottom-12 w-16 opacity-0 hover:opacity-10 pointer-events-none transition bg-gradient-to-r from-black to-transparent" />
        <div className="hidden sm:block absolute right-0 top-12 bottom-12 w-16 opacity-0 hover:opacity-10 pointer-events-none transition bg-gradient-to-l from-black to-transparent" />
      </main>

      {/* Bottom Bar: Kindle Progress Indicator & Scrubber */}
      <footer className="w-full relative z-30 pb-safe">
        <KindleProgressScrubber
          isOpen={isScrubberOpen || isControlsVisible}
          onToggle={() => setIsScrubberOpen((o) => !o)}
          currentSectionTitle={currentSection.title}
          currentSectionIndex={sectionIndex}
          totalSections={book.sections.length}
          currentVirtualPage={isTwoCol ? `${pageIndex * 2 + 1}–${pageIndex * 2 + 2}` : pageIndex + 1}
          totalVirtualPages={isTwoCol ? totalSectionPages * 2 : totalSectionPages}
          overallPercentage={overallPercentage}
          estimatedMinutesLeftInChapter={estimatedMinutesLeft}
          onJumpPercentage={handleJumpPercentage}
          onPrevSection={() => {
            if (sectionIndex > 0) {
              setSectionIndex((s) => s - 1);
              setPageIndex(0);
            }
          }}
          onNextSection={() => {
            if (sectionIndex < book.sections.length - 1) {
              setSectionIndex((s) => s + 1);
              setPageIndex(0);
            }
          }}
        />
      </footer>

      {/* Floating Text Selection Action Popup */}
      {isToolbarOpen && (
        <TextSelectionToolbar
          position={selectionCoords}
          selectedText={selectedText}
          onHighlight={handleAddHighlight}
          onAddNote={() => {
            setIsToolbarOpen(false);
            setIsNoteModalOpen(true);
          }}
          onPin={handlePinSelection}
          onClose={() => setIsToolbarOpen(false)}
        />
      )}

      {/* Bottom Dictionary Sheet matching user screenshot */}
      <DictionarySheet
        isOpen={isDictOpen}
        entry={dictEntry}
        onClose={() => setIsDictOpen(false)}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isNoteModalOpen}
        selectedText={selectedText}
        onSave={handleSaveNote}
        onClose={() => setIsNoteModalOpen(false)}
      />

      {/* Typography / Theme Modal */}
      <FontSettingsModal
        isOpen={isFontModalOpen}
        onClose={() => setIsFontModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Table of Contents & Bookmarks Drawer */}
      <ContentsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        book={book}
        currentSectionIndex={sectionIndex}
        currentOverallPercentage={overallPercentage}
        bookmarks={bookmarks}
        highlights={highlights}
        onSelectSection={(secIdx) => {
          setSectionIndex(secIdx);
          setPageIndex(0);
        }}
        onSelectBookmark={(bm) => {
          setSectionIndex(bm.sectionIndex);
          setPageIndex(bm.pageIndex);
        }}
        onDeleteBookmark={async (bmId) => {
          const updated = await removeBookmarkFromStorage(book.metadata.id, bmId);
          setBookmarks(updated);
        }}
        onSelectHighlight={(hl) => {
          setSectionIndex(hl.sectionIndex);
          setPageIndex(0);
        }}
        onDeleteHighlight={async (hlId) => {
          const updated = await deleteHighlightFromStorage(book.metadata.id, hlId);
          setHighlights(updated);
        }}
      />
    </div>
  );
};
