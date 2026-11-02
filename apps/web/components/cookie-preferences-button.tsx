'use client';

import React from 'react';

export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('open-cookie-preferences'));
        }
      }}
      className={className || 'hover:text-white transition-colors text-left font-mono text-[11px]'}
    >
      Cookie Preferences
    </button>
  );
}
