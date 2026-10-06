'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { drillStore } from '@/lib/store';
import {
  Division,
  EventCategory,
  Scorecard,
  PenaltyRecord,
  Team,
  School,
  Judge,
  DrillEvent,
  DrillScheduleItem,
} from '@/types/drill';
import { downloadChampionshipExcel } from '@/lib/excel-export';
import {
  ShieldCheck,
  FileSpreadsheet,
  Trophy,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  ChevronRight,
  Filter,
  Users,
  Search,
  ExternalLink,
  Award,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'standings' | 'feed' | 'roster' | 'penalties'>('standings');
  const [selectedDivision, setSelectedDivision] = useState<Division>('ARMED');
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [penalties, setPenalties] = useState<PenaltyRecord[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [events, setEvents] = useState<DrillEvent[]>([]);
  const [schedules, setSchedules] = useState<DrillScheduleItem[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const refreshData = () => {
    setScorecards(drillStore.getScorecards());
    setPenalties(drillStore.getPenalties());
    setTeams(drillStore.getTeams());
    setSchools(drillStore.getSchools());
    setJudges(drillStore.getJudges());
    setEvents(drillStore.getEvents());
    setSchedules(drillStore.getSchedules());
  };

  useEffect(() => {
    refreshData();
    const unsub = drillStore.subscribe(refreshData);
    return unsub;
  }, []);

  const schoolMap = useMemo(() => new Map(schools.map((s) => [s.id, s])), [schools]);
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const judgeMap = useMemo(() => new Map(judges.map((j) => [j.id, j])), [judges]);
  const eventMap = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  // Tabulation Engine
  const tabulation = useMemo(() => {
    return drillStore.getTabulation();
  }, [teams, schools, judges, scorecards, penalties]);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await downloadChampionshipExcel({
        tabulation,
        schools,
        teams,
        judges,
        events,
        scorecards,
        penalties,
      });
    } catch (err) {
      console.error('Failed to export Excel report:', err);
      alert('Error exporting Excel report. See console.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleVerifyScorecard = (id: string) => {
    drillStore.updateScorecardStatus(id, 'VERIFIED');
  };

  const handleUnlockScorecard = (id: string) => {
    if (confirm('Unlock this scorecard to allow field judge adjustments?')) {
      drillStore.updateScorecardStatus(id, 'DRAFT');
    }
  };

  const filteredScorecards = useMemo(() => {
    return scorecards.filter((sc) => {
      if (statusFilter === 'ALL') return true;
      return sc.status === statusFilter;
    });
  }, [scorecards, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="camo-card-burgundy border-2 border-concordia-burgundy-light/60 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold uppercase text-white px-2.5 py-0.5 rounded bg-concordia-burgundy/80 border border-white/30 shadow-sm">
              Command & Tabulation Room
            </span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-200">Concordia JROTC • March 6, 2027</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Concordia High School<br />
            Annual Clendenen<br />
            Drill Meet — HQ
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-2xl font-medium">
            Live score tabulation with deterministic event & overall championship tie-breaking.
          </p>
        </div>

        {/* Action Button: Excel Export */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-100 text-concordia-burgundy-dark font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl border-2 border-white transition-transform hover:scale-102 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-concordia-burgundy" />
            {isExporting ? 'Generating...' : 'Export Complete Excel (.xlsx)'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-concordia-burgundy/40 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('standings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'standings'
              ? 'bg-white text-concordia-burgundy-dark font-black shadow-md border border-white'
              : 'text-gray-300 hover:text-white hover:bg-concordia-burgundy-deep/60'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Official Tabulation & Tie-Breakers
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'feed'
              ? 'bg-white text-concordia-burgundy-dark font-black shadow-md border border-white'
              : 'text-gray-300 hover:text-white hover:bg-concordia-burgundy-deep/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          Live Scoring Feed ({scorecards.length})
        </button>
        <button
          onClick={() => setActiveTab('penalties')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'penalties'
              ? 'bg-white text-concordia-burgundy-dark font-black shadow-md border border-white'
              : 'text-gray-300 hover:text-white hover:bg-concordia-burgundy-deep/60'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Penalty Audit Log ({penalties.length})
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'roster'
              ? 'bg-army-gold text-army-black shadow-md'
              : 'text-gray-300 hover:text-white hover:bg-army-dark'
          }`}
        >
          <Users className="w-4 h-4" />
          Roster & Schedules ({teams.length})
        </button>
      </div>

      {/* TAB 1: TABULATION & TIE-BREAKERS */}
      {activeTab === 'standings' && (
        <div className="space-y-6">
          {/* Division Selector */}
          <div className="flex items-center justify-between camo-card p-3 rounded-xl border border-concordia-burgundy/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-gray-300">Select Division:</span>
              {(['ARMED', 'UNARMED'] as Division[]).map((div) => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedDivision === div
                      ? 'bg-white text-concordia-burgundy-dark font-black shadow-md border border-white'
                      : 'bg-military-dark text-gray-200 hover:text-white border border-concordia-burgundy/30'
                  }`}
                >
                  {div} DIVISION
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-300 font-mono hidden sm:inline">
              Tie-Breakers Active
            </span>
          </div>

          {/* OVERALL CHAMPIONSHIP STANDINGS TABLE */}
          <div className="camo-card border border-concordia-burgundy/40 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-concordia-burgundy-deep/90 p-4 border-b border-concordia-burgundy/40 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-white" />
                  {selectedDivision} OVERALL CHAMPIONSHIP STANDINGS
                </h3>
                <p className="text-xs text-gray-300">
                  Calculated from all 4 events; ties resolved by 1st, 2nd, and 3rd place finish counts.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-army-slate/40 text-gray-300 border-b border-army-border font-mono text-[11px] uppercase">
                    <th className="p-3 text-center">Rank</th>
                    <th className="p-3">School / Unit</th>
                    <th className="p-3">Brigade</th>
                    <th className="p-3">Cadet Commander</th>
                    <th className="p-3 text-center">1st</th>
                    <th className="p-3 text-center">2nd</th>
                    <th className="p-3 text-center">3rd</th>
                    <th className="p-3 text-right">Total Score</th>
                    <th className="p-3">Tie Breaker Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-army-border/60">
                  {(tabulation.overallStandings[selectedDivision] || []).map((standing) => (
                    <tr
                      key={standing.team_id}
                      className={`hover:bg-army-slate/20 transition-colors ${
                        standing.overall_rank === 1 ? 'bg-army-gold/10' : ''
                      }`}
                    >
                      <td className="p-3 text-center font-mono font-extrabold">
                        {standing.overall_rank === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-army-gold text-army-black font-extrabold text-xs">
                            ★ 1st
                          </span>
                        ) : standing.overall_rank === 2 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-black font-bold text-xs">
                            2nd
                          </span>
                        ) : standing.overall_rank === 3 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-700 text-white font-bold text-xs">
                            3rd
                          </span>
                        ) : (
                          `${standing.overall_rank}th`
                        )}
                      </td>
                      <td className="p-3 font-bold text-white">
                        {standing.school_name}
                      </td>
                      <td className="p-3 text-gray-300 font-mono text-xs">{standing.brigade}</td>
                      <td className="p-3 text-gray-300 font-mono text-xs">{standing.commander_name}</td>
                      <td className="p-3 text-center font-mono font-bold text-army-gold">{standing.first_place_count}</td>
                      <td className="p-3 text-center font-mono text-gray-300">{standing.second_place_count}</td>
                      <td className="p-3 text-center font-mono text-gray-300">{standing.third_place_count}</td>
                      <td className="p-3 text-right font-mono font-extrabold text-base text-white">
                        {standing.total_championship_score.toFixed(2)}
                      </td>
                      <td className="p-3">
                        {standing.tie_broken ? (
                          <span className="text-[11px] font-mono text-amber-300 bg-amber-950/80 px-2 py-1 rounded border border-amber-500/40 inline-block font-semibold">
                            {standing.tie_break_reason}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-500">Standard</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* EVENT BY EVENT RESULTS (With SOP Para 5 Tie-Breakers) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Event Standings & Judge Breakdown ({selectedDivision})
            </h3>

            {events
              .filter((e) => e.division === selectedDivision)
              .map((ev) => {
                const results = tabulation.eventResults[ev.id] || [];

                return (
                  <div
                    key={ev.id}
                    className="camo-card border border-concordia-burgundy/35 rounded-xl overflow-hidden shadow-md"
                  >
                    <div className="bg-concordia-burgundy-deep/70 px-4 py-3 border-b border-concordia-burgundy/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">{ev.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-concordia-burgundy/80 text-white border border-white/20">
                          {ev.category}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {results.length} Teams Scored
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-army-slate/30 text-gray-400 border-b border-army-border font-mono text-[10px] uppercase">
                            <th className="p-2.5 text-center">Rank</th>
                            <th className="p-2.5">School / Unit</th>
                            <th className="p-2.5 text-center">Judge 1 (HJ)</th>
                            <th className="p-2.5 text-center">Judge 2</th>
                            <th className="p-2.5 text-right">Raw Total</th>
                            <th className="p-2.5 text-right">Deductions</th>
                            <th className="p-2.5 text-right">Final Score</th>
                            <th className="p-2.5">Tie Breaker Notes (SOP Para 5)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-army-border/50">
                          {results.map((res) => {
                            const hjScore = res.judge_raw_scores.find((j) => j.is_head_judge)?.raw_score;
                            const j2Score = res.judge_raw_scores.filter((j) => !j.is_head_judge)[0]?.raw_score;

                            return (
                              <tr key={res.id} className="hover:bg-army-slate/20 transition-colors">
                                <td className="p-2.5 text-center font-mono font-bold">
                                  {res.event_rank === 1 ? (
                                    <span className="px-2 py-0.5 bg-army-gold text-army-black font-extrabold rounded-full text-xs">
                                      1st
                                    </span>
                                  ) : (
                                    `${res.event_rank}th`
                                  )}
                                </td>
                                <td className="p-2.5 font-bold text-white">{res.school_name}</td>
                                <td className="p-2.5 text-center font-mono text-gray-300">
                                  {hjScore !== undefined ? hjScore.toFixed(1) : '-'}
                                </td>
                                <td className="p-2.5 text-center font-mono text-gray-300">
                                  {j2Score !== undefined ? j2Score.toFixed(1) : '-'}
                                </td>
                                <td className="p-2.5 text-right font-mono font-semibold text-white">
                                  {res.total_raw_score.toFixed(2)}
                                </td>
                                <td className="p-2.5 text-right font-mono text-red-400">
                                  {res.total_penalties > 0 ? `-${res.total_penalties.toFixed(2)}` : '0.00'}
                                </td>
                                <td className="p-2.5 text-right font-mono font-extrabold text-army-gold">
                                  {res.final_score.toFixed(2)}
                                </td>
                                <td className="p-2.5">
                                  {res.tie_broken ? (
                                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 inline-block">
                                      {res.tie_break_reason}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-gray-500">Standard</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {results.length === 0 && (
                            <tr>
                              <td colSpan={8} className="p-4 text-center text-xs text-gray-500">
                                No submitted scorecards recorded yet for this event.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SCORING FEED */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 camo-card p-3.5 rounded-xl border border-concordia-burgundy/30">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-concordia-burgundy-lighter" />
              <span className="text-xs font-bold uppercase text-gray-300">Filter by Status:</span>
              {['ALL', 'DRAFT', 'SUBMITTED', 'VERIFIED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-concordia-burgundy-dark font-black shadow-sm border border-white'
                      : 'bg-military-dark text-gray-300 hover:text-white border border-concordia-burgundy/30'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-300 font-mono">
              Showing {filteredScorecards.length} of {scorecards.length} cards
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredScorecards.map((sc) => {
              const team = teamMap.get(sc.team_id);
              const school = team ? schoolMap.get(team.school_id) : null;
              const judge = judgeMap.get(sc.judge_id);
              const event = eventMap.get(sc.event_id);

              return (
                <div
                  key={sc.id}
                  className="camo-card border border-concordia-burgundy/35 rounded-xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {school?.name || 'Team'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-army-slate text-gray-200">
                          {team?.division}
                        </span>
                      </div>
                      <p className="text-xs text-army-gold font-medium mt-0.5">
                        {event?.name}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        sc.status === 'VERIFIED'
                          ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                          : sc.status === 'SUBMITTED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {sc.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-army-black/60 p-2.5 rounded-lg border border-army-border/60">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block">Judge</span>
                      <span className="font-semibold text-gray-200">{judge?.full_name}</span>
                      <span className="text-[10px] text-gray-400 block">
                        {sc.is_head_judge ? 'Head Judge' : 'Judge #2'} ({judge?.drill_pad})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase block">Raw Score</span>
                      <span className="font-mono text-base font-extrabold text-army-gold">
                        {sc.raw_score.toFixed(2)} pts
                      </span>
                    </div>
                  </div>

                  {sc.signature_name && (
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-army-border/40">
                      <span>Signed by: <strong className="text-gray-200">{sc.signature_name}</strong></span>
                      <span className="font-mono text-[10px]">
                        {sc.submitted_at ? new Date(sc.submitted_at).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  )}

                  {/* Admin controls */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-army-border">
                    {sc.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleVerifyScorecard(sc.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Verify Card
                      </button>
                    )}
                    {sc.status !== 'DRAFT' && (
                      <button
                        onClick={() => handleUnlockScorecard(sc.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-army-slate hover:bg-army-slate/80 text-gray-300 text-xs font-bold"
                        title="Unlock to allow judge edits"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Unlock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PENALTY AUDIT LOG */}
      {activeTab === 'penalties' && (
        <div className="camo-card border border-concordia-burgundy/35 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-concordia-burgundy-deep/80 p-4 border-b border-concordia-burgundy/40 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                OFFICIAL COMPETITION PENALTY AUDIT LOG
              </h3>
              <p className="text-xs text-gray-300">
                Full chronological ledger of boundary, cadence pause, missing cadet, and time infractions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-army-slate/40 text-gray-300 border-b border-army-border font-mono text-[10px] uppercase">
                  <th className="p-3">Team / School</th>
                  <th className="p-3">Event</th>
                  <th className="p-3 text-center">Missing Cadets (-25 ea)</th>
                  <th className="p-3 text-center">Pause Violations (-5 ea)</th>
                  <th className="p-3 text-center">Boundary (-10 ea)</th>
                  <th className="p-3 text-center">Time Infraction (-1/s)</th>
                  <th className="p-3 text-right">Total Penalty</th>
                  <th className="p-3">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-army-border/60">
                {penalties.map((pen) => {
                  const team = teamMap.get(pen.team_id);
                  const school = team ? schoolMap.get(team.school_id) : null;
                  const event = eventMap.get(pen.event_id);

                  return (
                    <tr key={pen.id} className="hover:bg-army-slate/20 transition-colors">
                      <td className="p-3 font-bold text-white">
                        {school?.name || pen.team_id}
                        <span className="block text-[10px] text-gray-400 font-normal">
                          {team?.division} Division
                        </span>
                      </td>
                      <td className="p-3 text-army-gold text-xs">{event?.name}</td>
                      <td className="p-3 text-center font-mono">
                        {(pen.missing_cadet_count ?? 0) > 0 ? (
                          <span className="text-red-400 font-bold">
                            {pen.missing_cadet_count} (-{(pen.missing_cadet_count ?? 0) * 25} pts)
                          </span>
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {(pen.pause_violation_count ?? 0) > 0 ? (
                          <span className="text-red-400 font-bold">
                            {pen.pause_violation_count} (-{(pen.pause_violation_count ?? 0) * 5} pts)
                          </span>
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {(pen.boundary_violations ?? 0) > 0 ? (
                          <span className="text-red-400 font-bold">
                            {pen.boundary_violations} (-{(pen.boundary_violations ?? 0) * 10} pts)
                          </span>
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {(pen.time_under_over_seconds ?? 0) > 0 ? (
                          <span className="text-red-400 font-bold">
                            {pen.time_under_over_seconds}s (-{pen.time_under_over_seconds} pts)
                          </span>
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-red-400 text-sm">
                        -{pen.total_penalty_deduction.toFixed(2)} pts
                      </td>
                      <td className="p-3 text-xs text-gray-300">
                        {pen.notes || 'No infractions recorded.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ROSTER & DRILL SCHEDULES */}
      {activeTab === 'roster' && (
        <div className="camo-card border border-concordia-burgundy/35 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-concordia-burgundy-deep/80 p-4 border-b border-concordia-burgundy/40 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                CHAMPIONSHIP ROSTER & DRILL PAD ASSIGNMENTS
              </h3>
              <p className="text-xs text-gray-300">
                Official list of registered drill teams and performance schedules.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-army-slate/40 text-gray-300 border-b border-army-border font-mono text-[10px] uppercase">
                  <th className="p-3">School Name</th>
                  <th className="p-3">Brigade</th>
                  <th className="p-3 text-center">Division</th>
                  <th className="p-3">Cadet Commander</th>
                  <th className="p-3 text-center">Cadet Complement</th>
                  <th className="p-3">Senior Army Instructor</th>
                  <th className="p-3">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-army-border/60">
                {teams.map((t) => {
                  const school = schoolMap.get(t.school_id);
                  return (
                    <tr key={t.id} className="hover:bg-army-slate/20 transition-colors">
                      <td className="p-3 font-bold text-white">{school?.name}</td>
                      <td className="p-3 text-gray-300 font-mono text-xs">{school?.brigade}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            t.division === 'ARMED'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {t.division}
                        </span>
                      </td>
                      <td className="p-3 text-gray-200 font-mono text-xs">{t.commander_name}</td>
                      <td className="p-3 text-center font-mono font-semibold text-white">
                        {t.cadet_count} cadets
                      </td>
                      <td className="p-3 text-gray-300 text-xs">{school?.contact_instructor}</td>
                      <td className="p-3 text-gray-400 font-mono text-xs">{school?.email}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
