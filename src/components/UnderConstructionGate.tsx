'use client';

import React, { useState, useEffect } from 'react';
import { siteConfig } from '@/content/site';

const STORAGE_KEY = 'chirag_portfolio_unlocked';

export function UnderConstructionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bypassed, setBypassed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      setBypassed(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === siteConfig.gate.password) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setError(false);
      setPasswordInput('');
      setBypassed(true);
    } else {
      setError(true);
    }
  };

  if (!siteConfig.gate.enabled || (mounted && bypassed)) {
    return (
      <>
        {siteConfig.gate.enabled && bypassed && (
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(STORAGE_KEY);
              setBypassed(false);
            }}
            className="fixed bottom-3 right-3 z-[150] font-mono text-[11px] opacity-40 hover:opacity-100 transition-opacity px-2 py-1"
            title="Lock portfolio"
          >
            [lock]
          </button>
        )}
        {children}
      </>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f1efeb] text-[#252526]">
      <div className="flex flex-col items-center gap-4 text-sm font-mono tracking-wide">
        <div>
          <span className="opacity-50">chirag rajdeo</span>
          <span className="mx-3 opacity-30">·</span>
          <span>portfolio — under construction</span>
        </div>

        <form onSubmit={handleUnlock} className="flex items-center gap-2 mt-1">
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              if (error) setError(false);
            }}
            placeholder="passkey"
            autoComplete="off"
            className={`bg-transparent border-b px-1 py-0.5 text-xs font-mono tracking-wide text-center w-32 focus:outline-none transition-colors ${
              error
                ? 'border-red-600 text-red-600'
                : 'border-[#252526]/25 focus:border-[#252526]'
            }`}
          />
          <button
            type="submit"
            className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity px-1"
          >
            →
          </button>
        </form>
      </div>
    </main>
  );
}

export default UnderConstructionGate;
