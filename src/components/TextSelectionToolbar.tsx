import React, { useState } from 'react';
import { HighlightColor } from '../types/reader';
import { Edit3, Copy, Pin, Share2, Check } from 'lucide-react';

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
      <div className="bg-(--bg-surface) text-(--text-primary) border border-(--border-color) shadow-2xl rounded-2xl p-2 flex flex-col items-center gap-1.5 backdrop-blur-md">
        {/* Color Palette Row if open */}
        {showColorPicker && (
          <div className="flex items-center gap-2 pb-2 mb-1 border-b border-(--border-color) w-full justify-center">
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

        {/* Action Buttons Row matching Kindle exactly */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Highlight */}
          <button
            onClick={() => {
              if (showColorPicker) {
                onHighlight(activeColor);
                setShowColorPicker(false);
              } else {
                onHighlight(activeColor);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowColorPicker((v) => !v);
            }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-(--bg-subtle) transition text-xs font-medium"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker((v) => !v);
              }}
              className={`w-5 h-5 rounded-full ${
                activeColor === 'teal'
                  ? 'bg-teal-400'
                  : activeColor === 'yellow'
                  ? 'bg-amber-300'
                  : activeColor === 'pink'
                  ? 'bg-pink-400'
                  : 'bg-orange-400'
              } shadow-xs cursor-pointer hover:scale-110 transition-transform`}
            />
            <span className="text-[11px] text-(--text-secondary)">Highlight</span>
          </button>

          {/* Note */}
          <button
            onClick={onAddNote}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-(--bg-subtle) transition text-xs font-medium"
          >
            <Edit3 className="w-5 h-5 text-(--text-secondary)" />
            <span className="text-[11px] text-(--text-secondary)">Note</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-(--bg-subtle) transition text-xs font-medium"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <Copy className="w-5 h-5 text-(--text-secondary)" />
            )}
            <span className="text-[11px] text-(--text-secondary)">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>

          {/* Pin */}
          <button
            onClick={onPin}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-(--bg-subtle) transition text-xs font-medium"
          >
            <Pin className="w-5 h-5 text-(--text-secondary)" />
            <span className="text-[11px] text-(--text-secondary)">Pin</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-(--bg-subtle) transition text-xs font-medium"
          >
            <Share2 className="w-5 h-5 text-(--text-secondary)" />
            <span className="text-[11px] text-(--text-secondary)">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
