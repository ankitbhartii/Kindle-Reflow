import {
  ReadingSettings,
  ThemeMode,
  FontFamily,
  LineHeightSize,
  MarginSize,
  TextAlign,
} from '../types/reader';
import { X, Minus, Plus, Sun, Moon, Coffee, Columns, Square, AlignLeft, AlignJustify } from 'lucide-react';

interface FontSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
}

export const FontSettingsModal: React.FC<FontSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const fontOptions: { id: FontFamily; label: string; sample: string }[] = [
    { id: 'bookerly', label: 'Bookerly', sample: 'Literata' },
    { id: 'serif', label: 'Merriweather', sample: 'Serif' },
    { id: 'sans', label: 'Amazon Ember', sample: 'Sans' },
    { id: 'mono', label: 'JetBrains', sample: 'Mono' },
  ];

  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode; bg: string; text: string; border: string }[] = [
    {
      id: 'light',
      label: 'Light',
      icon: <Sun className="w-4 h-4 text-amber-600" />,
      bg: 'bg-[#fcfbf9]',
      text: 'text-neutral-900',
      border: 'border-neutral-300',
    },
    {
      id: 'sepia',
      label: 'Sepia',
      icon: <Coffee className="w-4 h-4 text-amber-700" />,
      bg: 'bg-[#f5edd6]',
      text: 'text-[#382b1d]',
      border: 'border-[#dfcfaf]',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: <Moon className="w-4 h-4 text-blue-400" />,
      bg: 'bg-[#141416]',
      text: 'text-neutral-200',
      border: 'border-neutral-700',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-(--bg-surface) text-(--text-primary) border-t sm:border border-(--border-color) sm:rounded-2xl shadow-2xl p-6 sm:p-7 max-h-[88vh] overflow-y-auto no-scrollbar transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-(--border-color)">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight">Aa</span>
            <h3 className="text-base font-semibold">Reading Appearance</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-(--bg-subtle) text-(--text-secondary) transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Font Size */}
        <div className="py-4 border-b border-(--border-color)">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-(--text-secondary)">Font Size</span>
            <span className="text-sm font-semibold">{settings.fontSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpdateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}
              disabled={settings.fontSize <= 12}
              className="flex-1 py-2.5 px-3 rounded-lg border border-(--border-color) bg-(--bg-subtle) hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition"
              aria-label="Decrease font size"
            >
              <Minus className="w-4 h-4" />
              <span className="text-xs font-serif font-medium">A</span>
            </button>
            <div className="flex-2 flex items-center justify-center">
              <input
                type="range"
                min="12"
                max="32"
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                className="w-full accent-blue-600 h-1.5 bg-(--bg-subtle) rounded-lg cursor-pointer"
              />
            </div>
            <button
              onClick={() => onUpdateSettings({ fontSize: Math.min(32, settings.fontSize + 1) })}
              disabled={settings.fontSize >= 32}
              className="flex-1 py-2.5 px-3 rounded-lg border border-(--border-color) bg-(--bg-subtle) hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition"
              aria-label="Increase font size"
            >
              <Plus className="w-4 h-4" />
              <span className="text-base font-serif font-bold">A</span>
            </button>
          </div>
        </div>

        {/* Themes */}
        <div className="py-4 border-b border-(--border-color)">
          <span className="text-sm font-medium text-(--text-secondary) block mb-3">Theme</span>
          <div className="grid grid-cols-3 gap-2.5">
            {themeOptions.map((th) => {
              const isSelected = settings.theme === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => onUpdateSettings({ theme: th.id })}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                    th.bg
                  } ${th.text} ${isSelected ? 'border-blue-600 ring-2 ring-blue-600/30 font-semibold' : th.border}`}
                >
                  {th.icon}
                  <span className="text-xs">{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Families */}
        <div className="py-4 border-b border-(--border-color)">
          <span className="text-sm font-medium text-(--text-secondary) block mb-3">Typeface</span>
          <div className="grid grid-cols-2 gap-2">
            {fontOptions.map((f) => {
              const isSelected = settings.fontFamily === f.id;
              const familyClass =
                f.id === 'bookerly'
                  ? 'font-kindle-bookerly'
                  : f.id === 'serif'
                  ? 'font-kindle-serif'
                  : f.id === 'mono'
                  ? 'font-kindle-mono'
                  : 'font-kindle-sans';

              return (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ fontFamily: f.id })}
                  className={`p-2.5 text-left rounded-xl border transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/10 font-bold'
                      : 'border-(--border-color) hover:bg-(--bg-subtle)'
                  }`}
                >
                  <div className={`text-sm ${familyClass}`}>{f.label}</div>
                  <div className={`text-xs text-(--text-muted) ${familyClass}`}>The quick brown fox</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacing & Margins */}
        <div className="py-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-(--text-secondary)">Line Spacing</span>
              <span className="text-xs text-(--text-muted) capitalize">{settings.lineHeight}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['tight', 'normal', 'relaxed'] as LineHeightSize[]).map((lh) => (
                <button
                  key={lh}
                  onClick={() => onUpdateSettings({ lineHeight: lh })}
                  className={`py-2 px-3 text-xs capitalize rounded-lg border transition ${
                    settings.lineHeight === lh
                      ? 'border-blue-600 bg-blue-50/10 font-semibold text-blue-600'
                      : 'border-(--border-color) hover:bg-(--bg-subtle)'
                  }`}
                >
                  {lh}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-(--text-secondary)">Text Alignment</span>
              <span className="text-xs text-(--text-muted) capitalize">{settings.textAlign || 'left'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ textAlign: 'left' })}
                className={`py-2 px-3 text-xs rounded-lg border flex items-center justify-center gap-1.5 transition ${
                  (settings.textAlign || 'left') === 'left'
                    ? 'border-blue-600 bg-blue-50/10 font-semibold text-blue-600'
                    : 'border-(--border-color) hover:bg-(--bg-subtle)'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Left Aligned</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ textAlign: 'justify' })}
                className={`py-2 px-3 text-xs rounded-lg border flex items-center justify-center gap-1.5 transition ${
                  settings.textAlign === 'justify'
                    ? 'border-blue-600 bg-blue-50/10 font-semibold text-blue-600'
                    : 'border-(--border-color) hover:bg-(--bg-subtle)'
                }`}
              >
                <AlignJustify className="w-3.5 h-3.5" />
                <span>Justified</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-(--text-secondary)">Margins</span>
              <span className="text-xs text-(--text-muted) capitalize">{settings.margin}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'normal', 'wide'] as MarginSize[]).map((m) => (
                <button
                  key={m}
                  onClick={() => onUpdateSettings({ margin: m })}
                  className={`py-2 px-3 text-xs capitalize rounded-lg border transition ${
                    settings.margin === m
                      ? 'border-blue-600 bg-blue-50/10 font-semibold text-blue-600'
                      : 'border-(--border-color) hover:bg-(--bg-subtle)'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Two-column toggle */}
          <div className="hidden sm:flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {settings.twoColumnDesktop ? <Columns className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4 text-(--text-secondary)" />}
              <span className="text-sm font-medium text-(--text-secondary)">Two-page Spread on Desktop</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ twoColumnDesktop: !settings.twoColumnDesktop })}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.twoColumnDesktop ? 'bg-blue-600' : 'bg-(--bg-subtle) border border-(--border-color)'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.twoColumnDesktop ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
