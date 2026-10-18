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
        <div className="w-full max-w-xl mx-auto px-4 py-3 bg-(--bg-surface) border border-(--border-color) rounded-2xl shadow-xl mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between text-xs text-(--text-secondary) mb-2">
            <span className="font-semibold truncate max-w-[200px] sm:max-w-[300px]">
              {currentSectionTitle}
            </span>
            <span>{Math.round(overallPercentage)}%</span>
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
              className="w-full h-2 bg-(--bg-subtle) rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onPrevSection}
              disabled={currentSectionIndex <= 0}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-(--border-color) hover:bg-(--bg-subtle) disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev Section</span>
            </button>

            <span className="text-[11px] text-(--text-muted)">
              Section {currentSectionIndex + 1} of {totalSections}
            </span>

            <button
              onClick={onNextSection}
              disabled={currentSectionIndex >= totalSections - 1}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-(--border-color) hover:bg-(--bg-subtle) disabled:opacity-40 transition"
            >
              <span>Next Section</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Persistent Kindle Reading Footer Bar */}
      <div
        onClick={onToggle}
        className="w-full max-w-2xl mx-auto py-2.5 px-4 flex items-center justify-between text-xs text-(--text-secondary) cursor-pointer select-none rounded-t-xl hover:bg-(--bg-subtle)/40 transition"
      >
        <div className="flex items-center gap-2 truncate">
          <Sliders className="w-3.5 h-3.5 shrink-0 opacity-70" />
          <span className="truncate">
            Page {currentVirtualPage} of {Math.max(1, totalVirtualPages)}
          </span>
          <span className="opacity-40">•</span>
          <span>{Math.round(overallPercentage)}%</span>
        </div>

        <div className="shrink-0 text-[11px] text-(--text-muted)">
          {estimatedMinutesLeftInChapter > 0 ? (
            <span>{estimatedMinutesLeftInChapter} min left in chapter</span>
          ) : (
            <span>End of chapter</span>
          )}
        </div>
      </div>
    </div>
  );
};
