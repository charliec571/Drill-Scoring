'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { drillStore } from '@/lib/store';
import { Division, OverallChampionshipStanding, Team, School } from '@/types/drill';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  Award,
  Crown,
  Maximize2,
  Minimize2,
  Calendar,
} from 'lucide-react';

export default function StadiumScoreboardPage() {
  const [division, setDivision] = useState<Division>('ARMED');
  const [tabulation, setTabulation] = useState(drillStore.getTabulation());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const unsub = drillStore.subscribe(() => {
      setTabulation(drillStore.getTabulation());
    });
    return unsub;
  }, []);

  const standings = useMemo(() => {
    return tabulation.overallStandings[division] || [];
  }, [tabulation, division]);

  const champion = standings[0];

  const handleCelebrate = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFC72C', '#FFE58F', '#4B5320', '#FFFFFF'],
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scoreboard Header */}
      <div className="camo-card-burgundy rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden border-2 border-concordia-burgundy-light/60">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-concordia-burgundy-deep/80 hover:bg-concordia-burgundy text-white border border-white/20 transition-colors"
            title="Toggle Stadium Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-concordia-burgundy/80 border border-white/40 text-white text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-military-gold" /> Official Championship Leaderboard
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight">
          <span className="block text-concordia-burgundy-lighter drop-shadow-md">Homer L. Clendenen</span>
          <span className="block text-white drop-shadow-md">Memorial Drill Meet</span>
          <span className="block text-gray-100">Official Standings</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-200 mt-2 font-medium">
          March 6, 2027 • Official Standings
        </p>

        {/* Division Switcher */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setDivision('ARMED')}
            className={`px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all ${
              division === 'ARMED'
                ? 'bg-white text-concordia-burgundy-dark ring-4 ring-concordia-burgundy/50 shadow-xl scale-105 border border-white'
                : 'bg-military-dark/80 text-gray-200 hover:text-white hover:bg-concordia-burgundy-deep/80 border border-concordia-burgundy/40'
            }`}
          >
            Armed Division Standings
          </button>
          <button
            onClick={() => setDivision('UNARMED')}
            className={`px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all ${
              division === 'UNARMED'
                ? 'bg-white text-concordia-burgundy-dark ring-4 ring-concordia-burgundy/50 shadow-xl scale-105 border border-white'
                : 'bg-military-dark/80 text-gray-200 hover:text-white hover:bg-concordia-burgundy-deep/80 border border-concordia-burgundy/40'
            }`}
          >
            Unarmed Division Standings
          </button>
        </div>
      </div>

      {/* PODIUM SECTION (Top 3 Units) */}
      {standings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 camo-card rounded-2xl p-5 flex flex-col items-center justify-between text-center shadow-lg relative border border-white/20">
            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-900 font-extrabold flex items-center justify-center text-xl mb-3 shadow-md border-2 border-white">
              2
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase font-bold text-slate-300">
                Meet Runner-Up
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {standings[1].school_name}
              </h3>
              <p className="text-xs text-gray-300">{standings[1].brigade}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-concordia-burgundy/40 w-full flex items-center justify-between">
              <span className="text-xs text-gray-300 font-mono">Total Points</span>
              <span className="text-xl font-mono font-extrabold text-white">
                {standings[1].total_championship_score.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 1st Place Champion */}
          <div className="order-1 md:order-2 camo-card-burgundy border-2 border-white rounded-3xl p-6 flex flex-col items-center justify-between text-center shadow-2xl relative md:-translate-y-3">
            <div className="absolute -top-3.5 bg-white text-concordia-burgundy-dark px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg border border-concordia-burgundy-light">
              <Crown className="w-3.5 h-3.5 text-concordia-burgundy" /> Clendenen Champion
            </div>

            <div className="w-16 h-16 rounded-full bg-concordia-burgundy border-2 border-white text-white font-black flex items-center justify-center text-2xl my-3 shadow-xl">
              1
            </div>

            <div>
              <span className="text-xs font-mono uppercase font-extrabold text-white tracking-wider">
                Overall Gold Trophy Winner
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {champion.school_name}
              </h3>
              <p className="text-xs text-gray-200 font-mono mt-0.5">
                {champion.brigade} • Cdr: {champion.commander_name}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/20 w-full flex items-center justify-between">
              <button
                onClick={handleCelebrate}
                className="text-xs font-bold text-white hover:bg-white hover:text-concordia-burgundy flex items-center gap-1 bg-concordia-burgundy px-3 py-1.5 rounded-lg border border-white transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-military-gold" /> Celebrate
              </button>
              <span className="text-3xl font-mono font-black text-white">
                {champion.total_championship_score.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 md:order-3 camo-card border border-amber-700/30 rounded-2xl p-5 flex flex-col items-center justify-between text-center shadow-lg relative">
            <div className="w-12 h-12 rounded-full bg-amber-700/90 text-amber-100 font-extrabold flex items-center justify-center text-xl mb-3 shadow-md border-2 border-amber-400/40">
              3
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase font-bold text-amber-300">
                3rd Place Podium
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {standings[2].school_name}
              </h3>
              <p className="text-xs text-gray-300">{standings[2].brigade}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-concordia-burgundy/40 w-full flex items-center justify-between">
              <span className="text-xs text-gray-300 font-mono">Total Points</span>
              <span className="text-xl font-mono font-extrabold text-white">
                {standings[2].total_championship_score.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FULL LEADERBOARD TABLE */}
      <div className="camo-card rounded-2xl overflow-hidden shadow-2xl border border-concordia-burgundy/40">
        <div className="p-4 bg-concordia-burgundy-deep/90 border-b border-concordia-burgundy/40 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-white" />
            Complete Division Leaderboard & Trophies
          </h3>
          <span className="text-xs font-mono text-gray-200">
            {standings.length} Teams Competing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-military-dark/80 text-gray-200 border-b border-concordia-burgundy/40 font-mono text-xs uppercase">
                <th className="p-4 text-center">Place</th>
                <th className="p-4">School / Drill Team</th>
                <th className="p-4">Brigade</th>
                <th className="p-4">Cadet Commander</th>
                <th className="p-4 text-center">1st Places</th>
                <th className="p-4 text-center">2nd Places</th>
                <th className="p-4 text-center">3rd Places</th>
                <th className="p-4 text-right">Championship Points</th>
                <th className="p-4">Tie Breaker Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-military-slate/60">
              {standings.map((st) => (
                <tr
                  key={st.team_id}
                  className={`hover:bg-concordia-burgundy/20 transition-colors ${
                    st.overall_rank === 1
                      ? 'bg-concordia-burgundy/30'
                      : st.overall_rank === 2
                      ? 'bg-slate-300/10'
                      : st.overall_rank === 3
                      ? 'bg-amber-900/15'
                      : ''
                  }`}
                >
                  <td className="p-4 text-center font-mono font-black text-base">
                    {st.overall_rank === 1 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-concordia-burgundy-dark font-black text-xs shadow border border-concordia-burgundy">
                        ★ 1st Place
                      </span>
                    ) : st.overall_rank === 2 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-900 font-bold text-xs shadow">
                        2nd Place
                      </span>
                    ) : st.overall_rank === 3 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-700 text-white font-bold text-xs shadow">
                        3rd Place
                      </span>
                    ) : (
                      `${st.overall_rank}th`
                    )}
                  </td>
                  <td className="p-4 font-extrabold text-white text-base">
                    {st.school_name}
                  </td>
                  <td className="p-4 text-gray-300 font-mono">{st.brigade}</td>
                  <td className="p-4 text-gray-200 font-mono text-xs">{st.commander_name}</td>
                  <td className="p-4 text-center font-mono font-bold text-army-gold text-base">{st.first_place_count}</td>
                  <td className="p-4 text-center font-mono text-gray-300">{st.second_place_count}</td>
                  <td className="p-4 text-center font-mono text-gray-300">{st.third_place_count}</td>
                  <td className="p-4 text-right font-mono font-black text-xl text-white">
                    {st.total_championship_score.toFixed(2)}
                  </td>
                  <td className="p-4">
                    {st.tie_broken ? (
                      <span className="text-xs font-mono text-amber-300 bg-amber-950 px-2.5 py-1 rounded border border-amber-500/50 inline-block font-semibold">
                        {st.tie_break_reason}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Standard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
