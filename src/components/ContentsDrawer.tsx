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
        className="w-full max-w-xs sm:max-w-sm h-full bg-(--bg-surface) text-(--text-primary) border-r border-(--border-color) shadow-2xl flex flex-col transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-(--border-color) flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <h2 className="font-serif font-bold text-base truncate">{book.metadata.title}</h2>
            <p className="text-xs text-(--text-secondary) truncate">{book.metadata.author}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-(--bg-subtle) text-(--text-secondary) transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-(--border-color) bg-(--bg-subtle)/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('toc')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 border-b-2 transition ${
              activeTab === 'toc'
                ? 'border-blue-600 text-blue-600 font-semibold bg-(--bg-surface)'
                : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
            }`}
            title="Table of Contents"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Contents</span>
          </button>

          <button
            onClick={() => setActiveTab('highlights')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 border-b-2 transition relative ${
              activeTab === 'highlights'
                ? 'border-blue-600 text-blue-600 font-semibold bg-(--bg-surface)'
                : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
            }`}
            title="Highlights & Notes"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notes</span>
            {highlights.length > 0 && (
              <span className="px-1.5 py-0.2 bg-teal-500 text-white text-[10px] rounded-full font-bold">
                {highlights.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 border-b-2 transition relative ${
              activeTab === 'bookmarks'
                ? 'border-blue-600 text-blue-600 font-semibold bg-(--bg-surface)'
                : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
            }`}
            title="Bookmarks"
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Marks</span>
            {bookmarks.length > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[10px] rounded-full font-bold">
                {bookmarks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 border-b-2 transition ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600 font-semibold bg-(--bg-surface)'
                : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
            }`}
            title="Statistics"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stats</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
          {/* TOC Tab */}
          {activeTab === 'toc' && (
            <div className="space-y-1">
              {book.toc.length > 0 ? (
                book.toc.map((item, idx) => {
                  const isCurrent = item.sectionIndex === currentSectionIndex;
                  return (
                    <button
                      key={item.id || idx}
                      onClick={() => {
                        onSelectSection(item.sectionIndex);
                        onClose();
                      }}
                      className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between group ${
                        isCurrent
                          ? 'bg-blue-50/15 border border-blue-500/40 font-semibold text-blue-600'
                          : 'hover:bg-(--bg-subtle) text-(--text-primary)'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-sm truncate">{item.title}</div>
                        <div className="text-[11px] text-(--text-muted)">
                          Section {item.sectionIndex + 1}
                          {item.pageNumber ? ` • Page ${item.pageNumber}` : ''}
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isCurrent
                            ? 'text-blue-600'
                            : 'text-(--text-muted) opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                        }`}
                      />
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-sm text-(--text-muted)">
                  No outline found in this document.
                </div>
              )}
            </div>
          )}

          {/* Highlights & Notes Tab */}
          {activeTab === 'highlights' && (
            <div className="space-y-2">
              {highlights.length === 0 ? (
                <div className="p-8 text-center text-sm text-(--text-muted) space-y-3">
                  <Highlighter className="w-8 h-8 mx-auto opacity-30" />
                  <p>No highlights or notes yet.</p>
                  <p className="text-xs">
                    Select any word or passage in the book to highlight it or attach notes.
                  </p>
                </div>
              ) : (
                highlights.map((hl) => (
                  <div
                    key={hl.id}
                    className="p-3 rounded-xl border border-(--border-color) bg-(--bg-subtle)/40 hover:bg-(--bg-subtle) transition group"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        onSelectHighlight(hl);
                        onClose();
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-blue-600 truncate">
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

                      <p className="text-xs font-serif italic text-(--text-primary) line-clamp-3 mb-2">
                        "{hl.text}"
                      </p>

                      {hl.note && (
                        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-(--bg-surface) border border-(--border-color)/60 mb-2">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-xs text-(--text-secondary)">{hl.note}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-(--border-color)/50 text-[10px] text-(--text-muted)">
                      <span>{new Date(hl.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHighlight(hl.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50/20 rounded transition"
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
            <div className="space-y-2">
              {bookmarks.length === 0 ? (
                <div className="p-8 text-center text-sm text-(--text-muted) space-y-3">
                  <BookmarkIcon className="w-8 h-8 mx-auto opacity-30" />
                  <p>No bookmarks yet.</p>
                  <p className="text-xs">
                    Tap the ribbon icon in the top right while reading to bookmark any page.
                  </p>
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3 rounded-xl border border-(--border-color) bg-(--bg-subtle)/40 hover:bg-(--bg-subtle) transition group"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        onSelectBookmark(bm);
                        onClose();
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-600 truncate">
                          {bm.chapterTitle || `Section ${bm.sectionIndex + 1}`}
                        </span>
                        <span className="text-[10px] text-(--text-muted)">
                          {Math.round(bm.percentage)}%
                        </span>
                      </div>
                      <p className="text-xs font-serif italic text-(--text-secondary) line-clamp-2 mb-2">
                        "{bm.textSnippet || 'Bookmarked location'}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-(--border-color)/50 text-[10px] text-(--text-muted)">
                      <span>{new Date(bm.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBookmark(bm.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50/20 rounded transition"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Book Info & Stats */}
          {activeTab === 'info' && (
            <div className="p-3 space-y-4">
              <div className="p-4 rounded-xl border border-(--border-color) bg-(--bg-subtle)/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Reading Progress</span>
                </div>
                <div>
                  <div className="text-2xl font-bold font-serif">{Math.round(currentOverallPercentage)}%</div>
                  <div className="w-full bg-(--progress-track) h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, currentOverallPercentage))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg border border-(--border-color) bg-(--bg-subtle)/30">
                  <div className="text-(--text-muted)">Total Pages</div>
                  <div className="text-base font-semibold mt-0.5">{book.metadata.pageCount}</div>
                </div>
                <div className="p-3 rounded-lg border border-(--border-color) bg-(--bg-subtle)/30">
                  <div className="text-(--text-muted)">Word Count</div>
                  <div className="text-base font-semibold mt-0.5">
                    {book.metadata.totalWords.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-(--border-color) bg-(--bg-subtle)/30">
                  <div className="text-(--text-muted)">Sections</div>
                  <div className="text-base font-semibold mt-0.5">{book.metadata.sectionCount}</div>
                </div>
                <div className="p-3 rounded-lg border border-(--border-color) bg-(--bg-subtle)/30">
                  <div className="text-(--text-muted)">Est. Reading Time</div>
                  <div className="text-base font-semibold mt-0.5">{estimatedTotalMinutes} min</div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                <span className="font-semibold block mb-0.5">100% Client-Side Privacy</span>
                All highlights, notes, and parsed content remain strictly on your local device.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
