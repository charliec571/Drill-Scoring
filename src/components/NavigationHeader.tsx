'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { drillStore } from '@/lib/store';
import {
  ClipboardCheck,
  ShieldCheck,
  Trophy,
  Wifi,
  WifiOff,
  Database,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function NavigationHeader() {
  const pathname = usePathname();
  const [networkStatus, setNetworkStatus] = useState(drillStore.getNetworkStatus());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    const unsub = drillStore.subscribe(() => {
      setNetworkStatus(drillStore.getNetworkStatus());
    });
    return unsub;
  }, []);

  const handleResetData = () => {
    drillStore.resetToSampleBaseline();
    setShowConfirmReset(false);
  };

  const navLinks = [
    { href: '/judge', label: 'Judge Pad', icon: ClipboardCheck },
    { href: '/admin', label: 'Admin Command', icon: ShieldCheck },
    { href: '/scoreboard', label: 'Scoreboard', icon: Trophy },
  ];

  return (
    <header className="bg-army-dark border-b border-army-border sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-army-green border-2 border-army-gold flex items-center justify-center text-army-gold shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-xs font-black tracking-tighter">★</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-army-gold">
                Concordia H.S. JROTC
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] uppercase font-mono font-bold bg-army-green/60 text-army-gold rounded border border-army-gold/30">
                Mar 6, 2027
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight">
              Annual Clendenen
            </h1>
          </div>
        </Link>

        {/* Center Nav tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href) || (link.href === '/judge' && pathname === '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-army-gold text-army-black font-bold shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-army-slate/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Status & Tools */}
        <div className="flex items-center gap-2">
          {/* Network / Supabase indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border"
            style={{
              backgroundColor: networkStatus.isOnline ? 'rgba(75, 83, 32, 0.4)' : 'rgba(180, 40, 40, 0.3)',
              borderColor: networkStatus.isOnline ? 'rgba(255, 199, 44, 0.4)' : 'rgba(255, 100, 100, 0.5)',
              color: networkStatus.isOnline ? '#FFE58F' : '#FFAAAA',
            }}
            title={
              networkStatus.isSupabaseLive
                ? 'Connected to live Supabase database'
                : 'Offline/Local Storage Active (syncs when Supabase is configured)'
            }
          >
            {networkStatus.isOnline ? (
              <Wifi className="w-3 h-3 text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400" />
            )}
            <span className="hidden sm:inline">
              {networkStatus.isSupabaseLive ? 'Supabase Live' : 'Field Mode'}
            </span>
            {networkStatus.queueCount > 0 && (
              <span className="bg-amber-500 text-black px-1 rounded-full text-[9px] font-bold">
                {networkStatus.queueCount} Q
              </span>
            )}
          </div>

          {/* Reset Baseline Seed Data button */}
          <button
            onClick={() => setShowConfirmReset(true)}
            title="Reset baseline tournament data"
            className="p-1.5 rounded-lg text-gray-400 hover:text-army-gold hover:bg-army-slate/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-army-dark border border-army-border rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-army-gold" />
              Reset Tournament Data?
            </h3>
            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              This will restore all teams, events, sample scorecards, and penalties back to the baseline 2026 National Championship test suite.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-3 py-1.5 text-xs font-bold bg-army-gold text-black rounded hover:bg-army-gold-light"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
