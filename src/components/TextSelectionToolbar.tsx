import React, { useState } from 'react';
import { HighlightColor } from '../types/reader';
import { Edit3, Copy, Pin, Share2, Check, Sparkles } from 'lucide-react';

interface TextSelectionToolbarProps {
  position: { x: number; y: number } | null;
  selectedText: string;
  onHighlight: (color: HighlightColor) => void;
  onAddNote: () => void;
  onPin: () => void;
  onClose: () => void;
}

export const TextSelectionToolbar: React.FC<TextSelectionToolbarProps> = ({
  position,
  selectedText,
  onHighlight,
  onAddNote,
  onPin,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColor, setActiveColor] = useState<HighlightColor>('teal');

  if (!position || !selectedText) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: `"${selectedText}"`,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
    onClose();
  };

  const colors: { id: HighlightColor; hex: string; bgClass: string }[] = [
    { id: 'teal', hex: '#2dd4bf', bgClass: 'bg-teal-400' },
    { id: 'yellow', hex: '#fde047', bgClass: 'bg-amber-300' },
    { id: 'pink', hex: '#f472b6', bgClass: 'bg-pink-400' },
    { id: 'orange', hex: '#fb923c', bgClass: 'bg-orange-400' },
  ];

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-3 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
      style={{
        left: `${Math.max(140, Math.min(window.innerWidth - 140, position.x))}px`,
        top: `${Math.max(60, position.y - 12)}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-(--bg-surface) text-(--text-primary) border border-(--c-grey-line) shadow-2xl rounded-full p-1.5 flex flex-col items-center gap-1 backdrop-blur-md">
        {/* Color Palette Row if open */}
        {showColorPicker && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-1 border-b border-(--c-grey-line) w-full justify-center">
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveColor(c.id);
                  onHighlight(c.id);
                  setShowColorPicker(false);
                }}
                className={`w-6 h-6 rounded-full ${c.bgClass} shadow-xs hover:scale-110 transition-transform flex items-center justify-center`}
                title={`Highlight with ${c.id}`}
              >
                {activeColor === c.id && <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[3]" />}
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons Row with Awake Pill Design */}
        <div className="flex items-center gap-1">
          {/* Highlight */}
          <button
            onClick={() => {
              if (showColorPicker) {
                onHighlight(activeColor);
                setShowColorPicker(false);
              } else {
                setShowColorPicker(true);
              }
            }}
            className={`awake-pill px-3 py-1.5 text-xs font-semibold rounded-full transition flex items-center gap-1.5 ${
              showColorPicker ? 'bg-[#ff003d] text-white' : 'hover:bg-(--bg-subtle) text-(--text-primary)'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 border border-black/20" />
            <span>Highlight</span>
          </button>

          {/* Note */}
          <button
            onClick={onAddNote}
            className="awake-pill px-3 py-1.5 text-xs font-semibold rounded-full hover:bg-(--bg-subtle) text-(--text-primary) transition flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#ff003d]" />
            <span>Note</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="awake-pill px-3 py-1.5 text-xs font-semibold rounded-full hover:bg-(--bg-subtle) text-(--text-primary) transition flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-(--text-secondary)" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Pin */}
          <button
            onClick={onPin}
            className="awake-pill p-2 rounded-full hover:bg-(--bg-subtle) text-(--text-secondary) hover:text-[#ff003d] transition"
            title="Pin snippet"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="awake-pill p-2 rounded-full hover:bg-(--bg-subtle) text-(--text-secondary) hover:text-[#ff003d] transition"
            title="Share quote"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
