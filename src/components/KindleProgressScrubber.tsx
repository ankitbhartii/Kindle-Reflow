import React from 'react';
import { ChevronLeft, ChevronRight, Sliders } from 'lucide-react';

interface KindleProgressScrubberProps {
  isOpen: boolean;
  onToggle: () => void;
  currentSectionTitle: string;
  currentSectionIndex: number;
  totalSections: number;
  currentVirtualPage: string | number;
  totalVirtualPages: number;
  overallPercentage: number;
  estimatedMinutesLeftInChapter: number;
  onJumpPercentage: (pct: number) => void;
  onPrevSection: () => void;
  onNextSection: () => void;
}

export const KindleProgressScrubber: React.FC<KindleProgressScrubberProps> = ({
  isOpen,
  onToggle,
  currentSectionTitle,
  currentSectionIndex,
  totalSections,
  currentVirtualPage,
  totalVirtualPages,
  overallPercentage,
  estimatedMinutesLeftInChapter,
  onJumpPercentage,
  onPrevSection,
  onNextSection,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Expanded Slider Sheet */}
      {isOpen && (
        <div className="w-full max-w-xl mx-auto px-5 py-4 bg-(--bg-surface) border border-(--c-grey-line) rounded-[1.75rem] shadow-2xl mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between text-xs text-(--text-secondary) mb-2">
            <span className="font-display font-bold text-(--c-ink) truncate max-w-[200px] sm:max-w-[300px]">
              {currentSectionTitle}
            </span>
            <span className="font-mono font-bold text-[#ff003d] px-2 py-0.5 rounded-full bg-[#ff003d]/10">
              {Math.round(overallPercentage)}%
            </span>
          </div>

          {/* Interactive Scrub Slider */}
          <div className="relative flex items-center py-2">
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={overallPercentage}
              onChange={(e) => onJumpPercentage(parseFloat(e.target.value))}
              className="w-full h-2 bg-(--c-grey-line) rounded-full appearance-none cursor-pointer accent-[#ff003d] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-(--c-grey-line)">
            <button
              onClick={onPrevSection}
              disabled={currentSectionIndex <= 0}
              className="awake-pill flex items-center gap-1 text-xs px-3 py-1.5 border border-(--c-grey-line) bg-(--bg-subtle) hover:bg-(--c-grey-panel) disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev Section</span>
            </button>

            <span className="text-[11px] font-mono text-(--text-muted)">
              Section {currentSectionIndex + 1} / {totalSections}
            </span>

            <button
              onClick={onNextSection}
              disabled={currentSectionIndex >= totalSections - 1}
              className="awake-pill flex items-center gap-1 text-xs px-3 py-1.5 border border-(--c-grey-line) bg-(--bg-subtle) hover:bg-(--c-grey-panel) disabled:opacity-40 transition"
            >
              <span>Next Section</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Persistent Kindle Reading Footer Bar with Awake Pill Design */}
      <div
        onClick={onToggle}
        className="w-full max-w-2xl mx-auto py-1.5 sm:py-2.5 px-3 sm:px-6 flex items-center justify-between text-xs text-(--text-secondary) cursor-pointer select-none rounded-full hover:bg-(--bg-subtle)/60 transition border border-transparent hover:border-(--c-grey-line)"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <Sliders className="w-3.5 h-3.5 shrink-0 opacity-70 text-[#ff003d]" />
          <span className="truncate font-medium text-[11px] sm:text-xs">
            Page {currentVirtualPage} of {Math.max(1, totalVirtualPages)}
          </span>
          <span className="opacity-40">•</span>
          <span className="font-mono font-bold text-[#ff003d] text-[11px] sm:text-xs">{Math.round(overallPercentage)}%</span>
        </div>

        <div className="shrink-0 text-[10px] sm:text-[11px] text-(--text-muted) font-medium">
          {estimatedMinutesLeftInChapter > 0 ? (
            <span>{estimatedMinutesLeftInChapter} min left</span>
          ) : (
            <span>End of chapter</span>
          )}
        </div>
      </div>
    </div>
  );
};
