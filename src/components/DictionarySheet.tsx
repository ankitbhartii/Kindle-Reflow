import React, { useState } from 'react';
import { DictionaryEntry } from '../types/reader';
import { Volume2, ChevronDown, ChevronUp, X, Sparkles, ExternalLink, BookCheck } from 'lucide-react';
import { playPronunciation } from '../services/dictionary';

interface DictionarySheetProps {
  entry: DictionaryEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DictionarySheet: React.FC<DictionarySheetProps> = ({
  entry,
  isOpen,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen || !entry) return null;

  const handleSpeak = () => {
    setIsPlayingAudio(true);
    playPronunciation(entry.word, entry.audioUrl);
    setTimeout(() => setIsPlayingAudio(false), 1200);
  };

  const handleSearchWikipedia = () => {
    window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(entry.word)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center justify-end pointer-events-none animate-in slide-in-from-bottom duration-250"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Bottom Sheet Card */}
      <div className="w-full max-w-2xl bg-(--bg-surface) text-(--text-primary) border-t sm:border-x border-(--border-color) sm:rounded-t-3xl shadow-2xl pointer-events-auto p-4 sm:p-5 flex flex-col max-h-[75vh] transition-all">
        {/* Drag Pill Handle */}
        <div
          onClick={() => setIsExpanded((v) => !v)}
          className="w-12 h-1.5 bg-(--border-color) rounded-full mx-auto mb-3 cursor-pointer hover:bg-(--text-muted) transition"
        />

        {/* Word & Pronunciation Audio Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-(--border-color)/70">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSpeak}
              className={`p-2 rounded-full border border-(--border-color) hover:bg-(--bg-subtle) transition ${
                isPlayingAudio ? 'text-blue-600 bg-blue-50/20 scale-105' : 'text-(--text-secondary)'
              }`}
              title="Listen to pronunciation"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <span className="font-serif font-bold text-lg text-(--text-primary)">
              {entry.word}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSearchWikipedia}
              className="p-1.5 rounded-lg text-xs flex items-center gap-1 text-(--text-secondary) hover:bg-(--bg-subtle) transition"
              title="Search Wikipedia"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Wikipedia</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-(--bg-subtle) text-(--text-secondary) transition"
              aria-label="Close dictionary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dictionary Section */}
        <div className="pt-3 overflow-y-auto no-scrollbar space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Oxford & English Dictionary</span>
            </div>
            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="text-(--text-muted) hover:text-(--text-primary) p-1 rounded transition"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Word Heading with Phonetic */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-base text-(--text-primary)">
                {entry.word}
              </span>
              {entry.phonetic && (
                <span className="text-xs text-(--text-secondary) font-sans">
                  {entry.phonetic}
                </span>
              )}
            </div>

            {entry.partOfSpeech && (
              <div className="text-xs italic text-(--text-muted)">
                {entry.partOfSpeech}
              </div>
            )}
          </div>

          {/* Definition */}
          <div className="text-sm font-sans text-(--text-primary) leading-relaxed">
            <span className="font-semibold text-xs mr-1 text-(--text-muted)">1.</span>
            {entry.definition}
          </div>

          {/* Example Sentence */}
          {entry.example && (
            <div className="pl-3 border-l-2 border-blue-500/40 text-xs italic text-(--text-secondary)">
              • {entry.example}
            </div>
          )}

          {/* Offline & Cache Badge */}
          <div className="flex items-center gap-1.5 pt-2 text-[11px] text-(--text-muted)">
            <BookCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Available offline. Cached locally in browser IndexedDB.</span>
          </div>

          {/* Expanded extra info */}
          {isExpanded && (
            <div className="pt-2 text-xs text-(--text-muted) border-t border-(--border-color)/50 space-y-1">
              <p>Definitions provided by English Lexical Database & Datamuse.</p>
              <p>All definitions are stored locally for instant reading without network dependence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
