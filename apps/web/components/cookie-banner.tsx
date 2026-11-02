'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Cookie, Settings2 } from 'lucide-react';
import { CookieModal, CookiePreferences } from './cookie-modal';

const STORAGE_KEY = 'reviewpilot_cookie_consent';

export function CookieBanner() {
  const [hasMounted, setHasMounted] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPrefs, setCurrentPrefs] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    setHasMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCurrentPrefs(JSON.parse(stored));
      } else {
        setBannerVisible(true);
      }
    } catch {
      // In case localStorage is blocked or restricted
      setBannerVisible(true);
    }

    // Global listener for opening cookie preferences from any footer or button
    const handleOpenPrefs = () => {
      setModalOpen(true);
    };

    window.addEventListener('open-cookie-preferences', handleOpenPrefs);
    return () => {
      window.removeEventListener('open-cookie-preferences', handleOpenPrefs);
    };
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setCurrentPrefs(prefs);
    } catch (e) {
      console.error('Failed to save cookie preferences to localStorage', e);
    }
    setBannerVisible(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      functional: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      functional: false,
      updatedAt: new Date().toISOString(),
    });
  };

  if (!hasMounted) return null;

  return (
    <>
      {bannerVisible && (
        <aside
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-0 inset-x-0 z-40 p-4 sm:p-5 border-t border-white/10 bg-[#0c0e12]/95 backdrop-blur-md shadow-2xl transition-all animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="w-8 h-8 rounded-lg border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
                <Cookie className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                  We use cookies to maintain your session security and evaluate system performance under India&apos;s{' '}
                  <strong className="text-white">Digital Personal Data Protection Act, 2023</strong>. Non-essential tracking is strictly opt-in and zero dark patterns are enforced.
                </p>
                <div className="flex items-center space-x-3 text-[11px] font-mono text-neutral-400">
                  <Link href="/privacy" className="text-orange-400 hover:text-orange-300 underline">
                    Read Privacy Notice
                  </Link>
                  <span>&bull;</span>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>

            {/* Action Buttons: Equal visual weight, zero dark patterns */}
            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-3 py-1.5 rounded-md border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>

              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3.5 py-1.5 rounded-md border border-white/15 hover:border-white/30 bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium transition-colors"
              >
                Reject Non-Essential
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-1.5 rounded-md bg-[#F6821F] hover:bg-[#ff9538] text-black font-semibold text-xs transition-all shadow-sm"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Modal */}
      <CookieModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={savePreferences}
        currentPrefs={currentPrefs}
      />
    </>
  );
}
