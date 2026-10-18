import React, { useState } from 'react';
import { StoredBook, Bookmark, HighlightItem } from '../types/reader';
import {
  X,
  Bookmark as BookmarkIcon,
  ListOrdered,
  BookOpen,
  Clock,
  Trash2,
  ArrowRight,
  Highlighter,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ContentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  book: StoredBook;
  currentSectionIndex: number;
  currentOverallPercentage: number;
  bookmarks: Bookmark[];
  highlights: HighlightItem[];
  onSelectSection: (sectionIndex: number) => void;
  onSelectBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onSelectHighlight: (highlight: HighlightItem) => void;
  onDeleteHighlight: (highlightId: string) => void;
}

export const ContentsDrawer: React.FC<ContentsDrawerProps> = ({
  isOpen,
  onClose,
  book,
  currentSectionIndex,
  currentOverallPercentage,
  bookmarks = [],
  highlights = [],
  onSelectSection,
  onSelectBookmark,
  onDeleteBookmark,
  onSelectHighlight,
  onDeleteHighlight,
}) => {
  const [activeTab, setActiveTab] = useState<'toc' | 'highlights' | 'bookmarks' | 'info'>('toc');

  if (!isOpen) return null;

  const estimatedTotalMinutes = Math.max(1, Math.round(book.metadata.totalWords / 200));

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs sm:max-w-md h-full bg-(--bg-surface) text-(--text-primary) border-r border-(--c-grey-line) shadow-2xl flex flex-col transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Awake Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-(--c-grey-line) flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#ff003d] block mb-0.5">Index & Drawer</span>
            <h2 className="font-display font-bold text-lg sm:text-xl truncate text-(--c-ink)">
              {book.metadata.title}
            </h2>
            <p className="text-xs text-(--text-secondary) truncate">{book.metadata.author}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-(--bg-subtle) text-(--text-secondary) transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Awake Pill Tab Switcher */}
        <div className="p-3 border-b border-(--c-grey-line) bg-(--bg-subtle)/40 flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('toc')}
            className={`awake-pill flex-1 py-2 text-xs font-semibold transition ${
              activeTab === 'toc'
                ? 'bg-[#ff003d] text-white shadow-xs'
                : 'text-(--text-secondary) hover:bg-(--bg-surface)'
            }`}
          >
            <span>TOC</span>
          </button>

          <button
            onClick={() => setActiveTab('highlights')}
            className={`awake-pill flex-1 py-2 text-xs font-semibold transition relative ${
              activeTab === 'highlights'
                ? 'bg-[#ff003d] text-white shadow-xs'
                : 'text-(--text-secondary) hover:bg-(--bg-surface)'
            }`}
          >
            <span>Notes</span>
            {highlights.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-white text-[#ff003d] text-[10px] rounded-full font-bold">
                {highlights.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`awake-pill flex-1 py-2 text-xs font-semibold transition relative ${
              activeTab === 'bookmarks'
                ? 'bg-[#ff003d] text-white shadow-xs'
                : 'text-(--text-secondary) hover:bg-(--bg-surface)'
            }`}
          >
            <span>Marks</span>
            {bookmarks.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-white text-[#ff003d] text-[10px] rounded-full font-bold">
                {bookmarks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`awake-pill flex-1 py-2 text-xs font-semibold transition ${
              activeTab === 'info'
                ? 'bg-[#ff003d] text-white shadow-xs'
                : 'text-(--text-secondary) hover:bg-(--bg-surface)'
            }`}
          >
            <span>Stats</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
          {/* TOC Tab */}
          {activeTab === 'toc' && (
            <div className="space-y-1.5">
              {book.toc.length > 0 ? (
                book.toc.map((item, idx) => {
                  const isCurrent = item.sectionIndex === currentSectionIndex;
                  const idxStr = String(idx + 1).padStart(2, '0');
                  return (
                    <button
                      key={item.id || idx}
                      onClick={() => {
                        onSelectSection(item.sectionIndex);
                        onClose();
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl transition flex items-center justify-between group ${
                        isCurrent
                          ? 'bg-[#ff003d]/10 border-2 border-[#ff003d] font-bold text-[#ff003d]'
                          : 'hover:bg-(--bg-subtle) border border-transparent text-(--text-primary)'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs opacity-60">[{idxStr}]</span>
                          <span className="text-sm font-display font-medium truncate">{item.title}</span>
                        </div>
                        <div className="text-[11px] text-(--text-muted) pl-7 mt-0.5">
                          Section {item.sectionIndex + 1}
                          {item.pageNumber ? ` • Page ${item.pageNumber}` : ''}
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isCurrent
                            ? 'text-[#ff003d]'
                            : 'text-(--text-muted) opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                        }`}
                      />
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-(--text-muted)">
                  No outline found in this document.
                </div>
              )}
            </div>
          )}

          {/* Highlights & Notes Tab */}
          {activeTab === 'highlights' && (
            <div className="space-y-3">
              {highlights.length === 0 ? (
                <div className="p-8 text-center text-sm text-(--text-muted) space-y-3">
                  <Highlighter className="w-8 h-8 mx-auto opacity-30 text-[#ff003d]" />
                  <p className="font-display font-bold">No highlights or notes yet.</p>
                  <p className="text-xs">
                    Select any word or passage in the book to highlight it or attach notes.
                  </p>
                </div>
              ) : (
                highlights.map((hl) => (
                  <div
                    key={hl.id}
                    className="p-3.5 rounded-2xl border border-(--c-grey-line) bg-(--bg-subtle)/40 hover:bg-(--bg-subtle) transition group"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        onSelectHighlight(hl);
                        onClose();
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-[#ff003d] truncate">
                          {hl.chapterTitle || `Section ${hl.sectionIndex + 1}`}
                        </span>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            hl.color === 'teal'
                              ? 'bg-teal-400'
                              : hl.color === 'yellow'
                              ? 'bg-amber-300'
                              : hl.color === 'pink'
                              ? 'bg-pink-400'
                              : 'bg-orange-400'
                          }`}
                        />
                      </div>
                      <blockquote className="text-xs italic line-clamp-3 text-(--text-primary) border-l-2 border-[#ff003d] pl-2 my-1">
                        "{hl.text}"
                      </blockquote>
                      {hl.note && (
                        <div className="text-xs text-(--text-secondary) mt-1.5 flex items-start gap-1 bg-(--bg-surface) p-2 rounded-xl border border-(--c-grey-line)">
                          <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-[#ff003d] shrink-0" />
                          <span>{hl.note}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-(--text-muted) mt-2 pt-2 border-t border-(--c-grey-line)">
                      <span>{new Date(hl.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => onDeleteHighlight(hl.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 transition"
                        title="Delete highlight"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
              {bookmarks.length === 0 ? (
                <div className="p-8 text-center text-sm text-(--text-muted) space-y-3">
                  <BookmarkIcon className="w-8 h-8 mx-auto opacity-30 text-[#ff003d]" />
                  <p className="font-display font-bold">No bookmarks saved.</p>
                  <p className="text-xs">
                    Tap the ribbon in the top right corner of any page to bookmark your exact spot.
                  </p>
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3.5 rounded-2xl border border-(--c-grey-line) bg-(--bg-subtle)/40 hover:bg-(--bg-subtle) transition group"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        onSelectBookmark(bm);
                        onClose();
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-bold text-xs text-(--c-ink)">
                          {bm.chapterTitle || `Section ${bm.sectionIndex + 1}`}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ff003d]/10 text-[#ff003d]">
                          {Math.round(bm.percentage)}%
                        </span>
                      </div>
                      <p className="text-xs text-(--text-secondary) line-clamp-2 mt-1">
                        "{bm.textSnippet}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-(--text-muted) mt-2 pt-2 border-t border-(--c-grey-line)">
                      <span>{new Date(bm.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => onDeleteBookmark(bm.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 transition"
                        title="Delete bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4 p-2 text-xs">
              <div className="p-4 rounded-2xl bg-(--bg-subtle)/70 border border-(--c-grey-line) space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-(--text-muted)">Overall Progress</span>
                  <span className="font-mono font-bold text-sm text-[#ff003d]">
                    {Math.round(currentOverallPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-(--c-grey-line) h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ff003d] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(currentOverallPercentage)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-(--bg-subtle)/40 border border-(--c-grey-line)">
                  <span className="text-(--text-muted) block mb-1">Total Words</span>
                  <span className="font-display font-bold text-lg text-(--c-ink)">
                    {book.metadata.totalWords.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-(--bg-subtle)/40 border border-(--c-grey-line)">
                  <span className="text-(--text-muted) block mb-1">Read Time</span>
                  <span className="font-display font-bold text-lg text-(--c-ink)">
                    ~{estimatedTotalMinutes} mins
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-(--bg-subtle)/40 border border-(--c-grey-line) space-y-2">
                <div className="flex justify-between">
                  <span className="text-(--text-muted)">Document Format</span>
                  <span className="font-semibold">PDF Reflow 2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--text-muted)">Sections</span>
                  <span className="font-semibold">{book.sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--text-muted)">Total Pages</span>
                  <span className="font-semibold">{book.metadata.pageCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
