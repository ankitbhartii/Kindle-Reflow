import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWAInstallBanner — shows an Android/Desktop install prompt.
 * Appears only when the browser fires `beforeinstallprompt`.
 * Dismissible and stores preference in sessionStorage.
 */
export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already dismissed this session
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setVisible(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-banner-dismissed', '1');
    setVisible(false);
  };

  if (!visible || installed) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[9000] animate-in slide-in-from-bottom-4 duration-400"
      role="dialog"
      aria-label="Install Kindle-Reflow"
    >
      <div
        className="bg-[#09090B] text-[#F8F4E8] rounded-2xl border-2 border-[#D2E823] p-4 flex items-start gap-3"
        style={{ boxShadow: '6px 6px 0px 0px #D2E823' }}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#D2E823] border-2 border-[#F8F4E8] flex items-center justify-center shrink-0">
          <span className="font-display text-[#09090B] text-lg leading-none">K</span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-display text-sm text-[#D2E823]">INSTALL APP</p>
          <p className="font-body text-xs text-[#F8F4E8]/70 leading-relaxed">
            Add Kindle-Reflow to your home screen for offline reading — no app store needed.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleInstall}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D2E823] text-[#09090B] border-2 border-[#09090B] rounded-lg font-display text-xs uppercase transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
              style={{ boxShadow: '2px 2px 0px 0px #F8F4E8' }}
            >
              <Download className="w-3 h-3" />
              INSTALL
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-transparent text-[#F8F4E8]/60 border-2 border-[#F8F4E8]/20 rounded-lg font-body text-xs uppercase hover:border-[#F8F4E8]/50 transition-colors"
            >
              Later
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-lg hover:bg-[#F8F4E8]/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-[#F8F4E8]/50" />
        </button>
      </div>

      {/* Pointer for phones */}
      <div className="flex justify-center mt-1">
        <Smartphone className="w-4 h-4 text-[#D2E823]/60" />
      </div>
    </div>
  );
}
