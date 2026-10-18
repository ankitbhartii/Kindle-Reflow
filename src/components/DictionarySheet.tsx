import React, { useState } from 'react';
import { DictionaryEntry } from '../types/reader';
import { Volume2, ChevronDown, ChevronUp, X, Sparkles, ExternalLink, BookCheck, ShieldCheck } from 'lucide-react';
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
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center justify-end pointer-events-none animate-in slide-in-from-bottom duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Awake Bottom Sheet Panel */}
      <div className="w-full max-w-2xl bg-(--bg-surface) text-(--text-primary) border-t sm:border-x border-(--c-grey-line) sm:rounded-t-[2rem] shadow-2xl pointer-events-auto p-5 sm:p-7 flex flex-col max-h-[78vh] transition-all">
        {/* Drag Pill Handle */}
        <div
          onClick={() => setIsExpanded((v) => !v)}
          className="w-12 h-1.5 bg-(--c-grey-line) rounded-full mx-auto mb-4 cursor-pointer hover:bg-[#ff003d] transition-colors"
        />

        {/* Word & Pronunciation Audio Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-(--c-grey-line)">
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleSpeak}
              className={`awake-pill p-2.5 rounded-full border border-(--c-grey-line) hover:border-[#ff003d] transition-all ${
                isPlayingAudio ? 'text-white bg-[#ff003d] scale-105 shadow-md shadow-[#ff003d]/30' : 'text-(--c-ink) bg-(--bg-subtle)'
              }`}
              title="Listen to pronunciation"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div>
              <span className="font-display font-bold text-xl sm:text-2xl text-(--c-ink) tracking-tight">
                {entry.word}
              </span>
              {entry.phonetic && (
                <span className="ml-2.5 text-xs font-mono font-medium text-(--text-muted) px-2 py-0.5 rounded-full bg-(--bg-subtle) border border-(--c-grey-line)">
                  {entry.phonetic}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSearchWikipedia}
              className="awake-pill px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-(--c-grey-line) hover:border-(--c-ink) text-(--text-secondary) transition"
              title="Search Wikipedia"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wiki</span>
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
        <div className="pt-4 overflow-y-auto no-scrollbar space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
              <span className="w-2 h-2 rounded-full bg-[#ff003d]" />
              <span>Offline Lexicon & Stemmer</span>
            </div>
            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="text-(--text-muted) hover:text-(--c-ink) p-1 rounded-full transition"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Definition Card */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-(--bg-subtle)/60 border border-(--c-grey-line) space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#ff003d]/10 text-[#ff003d]">
                  {entry.partOfSpeech || 'Definition'}
                </span>
                <span className="text-xs font-display font-semibold text-(--text-muted)">
                  [01]
                </span>
              </div>
              <p className="text-sm text-(--text-primary) font-normal leading-relaxed">
                {entry.definition}
              </p>
              {entry.example && (
                <p className="text-xs text-(--text-muted) italic pt-2 border-t border-(--c-grey-line)/40">
                  "{entry.example}"
                </p>
              )}
            </div>
          </div>

          {/* Privacy & Engine Badge */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-(--text-muted) border-t border-(--c-grey-line)">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Private Client-Side
            </span>
            <span>Web Speech API Synthesis</span>
          </div>
        </div>
      </div>
    </div>
  );
};
