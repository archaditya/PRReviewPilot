'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Check, Info } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  updatedAt: string;
}

interface CookieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prefs: CookiePreferences) => void;
  currentPrefs?: CookiePreferences | null;
}

export function CookieModal({ isOpen, onClose, onSave, currentPrefs }: CookieModalProps) {
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(false);

  useEffect(() => {
    if (currentPrefs) {
      setAnalytics(Boolean(currentPrefs.analytics));
      setFunctional(Boolean(currentPrefs.functional));
    }
  }, [currentPrefs, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      essential: true,
      analytics,
      functional,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleAcceptAll = () => {
    onSave({
      essential: true,
      analytics: true,
      functional: true,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleRejectAll = () => {
    onSave({
      essential: true,
      analytics: false,
      functional: false,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg card-chai p-6 sm:p-7 space-y-6 border border-white/10 shadow-2xl bg-[#0e1117]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-white text-base">Cookie &amp; Privacy Preferences</h3>
              <p className="text-[11px] font-mono text-neutral-400">Zero Dark Patterns &bull; DPDP Act 2023 Compliant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4 text-xs font-sans">
          {/* Essential */}
          <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">Strictly Essential Cookies</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-neutral-300">Always Active</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Necessary for secure session authentication, CSRF defense, and multi-tenant organization routing. These cannot be disabled.
              </p>
            </div>
          </div>

          {/* Analytics */}
          <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-semibold text-white">Analytics &amp; Performance</span>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Helps us measure AST traversal latencies, review job completion rates, and platform stability without identifying personal codebases.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-0.5">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F6821F]"></div>
            </label>
          </div>

          {/* Functional */}
          <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-semibold text-white">Functional Preferences</span>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Remembers user interface customizations such as active tab choices, repository filter selections, and sidebar expansion states.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-0.5">
              <input
                type="checkbox"
                checked={functional}
                onChange={(e) => setFunctional(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F6821F]"></div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRejectAll}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
            >
              Reject All
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
            >
              Accept All
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-4 py-1.5 rounded-md bg-[#F6821F] hover:bg-[#ff9538] text-black font-semibold transition-all shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
