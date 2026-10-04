'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { 
  Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, 
  Minus, Plus, ShieldAlert, Award, FileText, Send, UserCheck, Shield
} from 'lucide-react';
import { drillStore, INITIAL_JUDGES, INITIAL_TEAMS, INITIAL_EVENTS } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabase';

interface CriteriaItem {
  id: string;
  label: string;
  maxPoints: number;
  score: number;
}

export default function JudgeScorecardPage() {
  const supabase = createClientComponentClient();

  // Selected Context States
  const [judgeInfo, setJudgeInfo] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [demoJudges, setDemoJudges] = useState<any[]>([]);

  // Score Criteria States (TC 3-21.5 Standard Movements)
  const [criteria, setCriteria] = useState<CriteriaItem[]>([
    { id: 'report_in', label: '1. Report In / Commander Precision', maxPoints: 10, score: 9.5 },
    { id: 'march_inspection', label: '2. Marching Technique & Cadence', maxPoints: 10, score: 9.0 },
    { id: 'open_ranks', label: '3. Open Ranks / Alignment Precision', maxPoints: 10, score: 9.5 },
    { id: 'manual_arms', label: '4. Manual of Arms Execution', maxPoints: 10, score: 9.5 },
    { id: 'overall_bearing', label: '5. Bearing & Military Courtesy', maxPoints: 10, score: 9.0 },
  ]);

  // Head Judge Specific Inspection Tie-Breaker Fields
  const [overallKnowledge, setOverallKnowledge] = useState<number>(48);
  const [uniformAppearance, setUniformAppearance] = useState<number>(47);

  // Penalty Counters (Head Judge Only)
  const [missingCadets, setMissingCadets] = useState<number>(0);
  const [pauseViolations, setPauseViolations] = useState<number>(0);
  const [boundaryViolations, setBoundaryViolations] = useState<number>(0);

  // Field Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // ------------------------------------------------------------------
  // 1. Fetch Current Judge & Available Teams (with seamless fallback)
  // ------------------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let activeJudge: any = null;
        let activeTeams: any[] = [];

        if (isSupabaseConfigured) {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Fetch judge details
            const { data: judge } = await supabase
              .from('judges')
              .select('*, events(*)')
              .eq('user_id', user.id)
              .single();

            if (judge) {
              activeJudge = judge;
              // Fetch teams matching judge's event division
              if (judge?.events?.division) {
                const { data: teamData } = await supabase
                  .from('teams')
                  .select('*, schools(name)')
                  .eq('division', judge.events.division);
                activeTeams = teamData || [];
              }
            }
          }
        }

        // If no authenticated judge session found (local mode / demo simulation)
        if (!activeJudge) {
          const localJudges = drillStore.getJudges();
          const localEvents = drillStore.getEvents();
          const localTeams = drillStore.getTeams();
          const localSchools = drillStore.getSchools();
          const schoolMap = new Map(localSchools.map((s) => [s.id, s]));

          const enrichedJudges = localJudges.map((j) => {
            const ev = localEvents.find((e) => e.category === j.assigned_event) || localEvents[0];
            return {
              ...j,
              assigned_event_id: ev.id,
              events: ev,
            };
          });

          setDemoJudges(enrichedJudges);
          activeJudge = enrichedJudges[0];

          activeTeams = localTeams
            .filter((t) => t.division === activeJudge.events?.division)
            .map((t) => ({
              ...t,
              schools: { name: schoolMap.get(t.school_id)?.name || 'School' },
            }));
        }

        setJudgeInfo(activeJudge);
        setTeams(activeTeams);
        if (activeTeams.length > 0 && !selectedTeamId) {
          setSelectedTeamId(activeTeams[0].id);
        }
      } catch (err) {
        console.warn('Error fetching live judge data, falling back to local store:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  // Switch demo judge (Head Judge vs Judge #2)
  const handleSwitchDemoJudge = (judgeId: string) => {
    const selected = demoJudges.find((j) => j.id === judgeId);
    if (!selected) return;
    setJudgeInfo(selected);

    const localTeams = drillStore.getTeams();
    const localSchools = drillStore.getSchools();
    const schoolMap = new Map(localSchools.map((s) => [s.id, s]));

    const filteredTeams = localTeams
      .filter((t) => t.division === selected.events?.division)
      .map((t) => ({
        ...t,
        schools: { name: schoolMap.get(t.school_id)?.name || 'School' },
      }));

    setTeams(filteredTeams);
    if (filteredTeams.length > 0) {
      setSelectedTeamId(filteredTeams[0].id);
    }
    setSubmittedSuccess(false);
  };

  // ------------------------------------------------------------------
  // 2. Timer Controls
  // ------------------------------------------------------------------
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ------------------------------------------------------------------
  // 3. Computed Calculations
  // ------------------------------------------------------------------
  const totalRawScore = criteria.reduce((sum, item) => sum + Number(item.score), 0);
  
  // Calculate Over/Under Time Penalties (e.g. if max limit is exceeded)
  const maxSecs = judgeInfo?.events?.time_limit_max_sec || judgeInfo?.events?.time_limit_max || 0;
  const timePenaltySecs = maxSecs > 0 && timerSeconds > maxSecs ? timerSeconds - maxSecs : 0;
  
  const totalPenalties = 
    (missingCadets * 25) + 
    (pauseViolations * 5) + 
    (boundaryViolations * 10) + 
    (timePenaltySecs * 1);

  const netScore = Math.max(0, totalRawScore - totalPenalties);

  // ------------------------------------------------------------------
  // 4. Submit Scorecard & Penalties
  // ------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!selectedTeamId) {
      alert('Please select a team before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const breakdownObj = criteria.reduce((acc, curr) => {
        acc[curr.id] = curr.score;
        return acc;
      }, {} as Record<string, number>);

      // Sync to local store so live tabulation and scoreboard update in real time
      drillStore.saveScorecard({
        id: `sc-${judgeInfo.id}-${selectedTeamId}-${judgeInfo.assigned_event_id}`,
        team_id: selectedTeamId,
        judge_id: judgeInfo.id,
        event_id: judgeInfo.assigned_event_id,
        raw_score: totalRawScore,
        overall_knowledge_score: judgeInfo.is_head_judge ? overallKnowledge : 0,
        uniform_appearance_score: judgeInfo.is_head_judge ? uniformAppearance : 0,
        criteria_breakdown: breakdownObj,
        criteria_scores: breakdownObj,
        status: 'SUBMITTED',
        signature_name: judgeInfo.full_name,
        submitted_at: new Date().toISOString(),
      });

      if (judgeInfo.is_head_judge) {
        drillStore.savePenalty({
          id: `pen-${selectedTeamId}-${judgeInfo.assigned_event_id}`,
          team_id: selectedTeamId,
          event_id: judgeInfo.assigned_event_id,
          head_judge_id: judgeInfo.id,
          missing_cadet_count: missingCadets,
          pause_violation_count: pauseViolations,
          boundary_violations: boundaryViolations,
          time_under_over_seconds: timePenaltySecs,
          total_penalty_deduction: totalPenalties,
          elapsed_time_seconds: timerSeconds,
        });
      }

      // If connected to live Supabase, push to backend
      if (isSupabaseConfigured) {
        const { error: scorecardErr } = await supabase
          .from('scorecards')
          .upsert({
            team_id: selectedTeamId,
            judge_id: judgeInfo.id,
            event_id: judgeInfo.assigned_event_id,
            raw_score: totalRawScore,
            overall_knowledge_score: judgeInfo.is_head_judge ? overallKnowledge : 0,
            uniform_appearance_score: judgeInfo.is_head_judge ? uniformAppearance : 0,
            criteria_breakdown: criteria,
            status: 'SUBMITTED',
            submitted_at: new Date().toISOString()
          });

        if (scorecardErr) console.warn('Supabase scorecard sync warning:', scorecardErr.message);

        if (judgeInfo.is_head_judge) {
          const { error: penaltyErr } = await supabase
            .from('penalties')
            .upsert({
              team_id: selectedTeamId,
              event_id: judgeInfo.assigned_event_id,
              head_judge_id: judgeInfo.id,
              missing_cadet_count: missingCadets,
              pause_violation_count: pauseViolations,
              boundary_violations: boundaryViolations,
              time_under_over_seconds: timePenaltySecs,
            });
          if (penaltyErr) console.warn('Supabase penalty sync warning:', penaltyErr.message);
        }
      }

      setSubmittedSuccess(true);
    } catch (err: any) {
      alert(`Error submitting scorecard: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-300">Loading Drill Pad Interface...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-12 select-none">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-30 bg-slate-800 border-b border-slate-700 px-4 py-3 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-lg font-bold text-amber-400">2026 Army Nationals</h1>
          <p className="text-xs text-slate-400">
            {judgeInfo?.events?.name || 'Drill Event'} | {judgeInfo?.is_head_judge ? 'HEAD JUDGE' : `Judge #${judgeInfo?.judge_number || 2}`}
          </p>
        </div>

        {/* TIMER DISPLAY */}
        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
          <span className="font-mono text-xl text-emerald-400 font-bold">{formatTime(timerSeconds)}</span>
          <button 
            onClick={() => setIsTimerRunning(!isTimerRunning)} 
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            title={isTimerRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}
          >
            {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button 
            onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }} 
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
            title="Reset Stopwatch"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* DEMO / FIELD PROFILE SWITCHER */}
      {demoJudges.length > 0 && (
        <div className="bg-slate-800/80 border-b border-slate-700/60 px-4 py-2">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <UserCheck size={14} className="text-amber-400" /> Active Judge:
            </span>
            <div className="flex items-center gap-1.5">
              {demoJudges.map((j) => (
                <button
                  key={j.id}
                  onClick={() => handleSwitchDemoJudge(j.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    judgeInfo?.id === j.id
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  {j.is_head_judge ? '★ Head Judge' : 'Judge #2'} ({j.drill_pad})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="max-w-2xl mx-auto p-4 space-y-6">

        {/* TEAM SELECTION */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Competing Unit</label>
          <select 
            value={selectedTeamId}
            onChange={(e) => { setSelectedTeamId(e.target.value); setSubmittedSuccess(false); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="">-- Choose School / Team --</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.schools?.name || team.school_name} ({team.division} - Commander: {team.commander_name})
              </option>
            ))}
          </select>
        </div>

        {/* SCORECARD FORM */}
        {selectedTeamId && !submittedSuccess && (
          <>
            {/* TECHNICAL CRITERIA SCORING */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-4">
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Award size={18} /> Evaluation Movement Items
              </h2>

              <div className="space-y-3">
                {criteria.map((item, idx) => (
                  <div key={item.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-sm font-medium pr-2 text-slate-200">{item.label}</span>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number"
                        step={0.5}
                        min={0}
                        max={item.maxPoints}
                        value={item.score}
                        onChange={(e) => {
                          const val = Math.min(item.maxPoints, Math.max(0, Number(e.target.value)));
                          const updated = [...criteria];
                          updated[idx].score = val;
                          setCriteria(updated);
                        }}
                        className="w-16 bg-slate-800 border border-slate-600 rounded text-center py-1.5 text-lg font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <span className="text-xs text-slate-500">/ {item.maxPoints}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HEAD JUDGE SPECIAL INSPECTION BREAKDOWN */}
            {judgeInfo?.is_head_judge && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-4">
                <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={18} /> SOP Tie-Breaker Categories (Head Judge Only)
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <label className="text-xs text-slate-400">Overall Knowledge (Tie-Breaker #3)</label>
                    <input 
                      type="number"
                      value={overallKnowledge}
                      onChange={(e) => setOverallKnowledge(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-lg font-bold text-amber-400"
                    />
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <label className="text-xs text-slate-400">Uniform Appearance (Tie-Breaker #4)</label>
                    <input 
                      type="number"
                      value={uniformAppearance}
                      onChange={(e) => setUniformAppearance(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-lg font-bold text-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HEAD JUDGE PENALTY CONTROLLERS */}
            {judgeInfo?.is_head_judge && (
              <div className="bg-slate-800 rounded-xl border border-red-900/50 p-4 space-y-4">
                <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={18} /> Rule Violations & Deductions
                </h2>

                <div className="space-y-3">
                  {/* Boundary Violations */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Boundary Violation</div>
                      <div className="text-xs text-red-400">-10 pts per event boundary breach</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setBoundaryViolations(Math.max(0, boundaryViolations - 1))} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                        <Minus size={16} />
                      </button>
                      <span className="font-mono text-xl font-bold w-6 text-center text-red-400">{boundaryViolations}</span>
                      <button onClick={() => setBoundaryViolations(boundaryViolations + 1)} className="p-2 bg-red-950/60 border border-red-800 rounded-lg text-red-300">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Mandatory Pause Violations */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Failed 5-Sec Pause</div>
                      <div className="text-xs text-red-400">-5 pts per missed pause on BOLD/CAPS</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setPauseViolations(Math.max(0, pauseViolations - 1))} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                        <Minus size={16} />
                      </button>
                      <span className="font-mono text-xl font-bold w-6 text-center text-red-400">{pauseViolations}</span>
                      <button onClick={() => setPauseViolations(pauseViolations + 1)} className="p-2 bg-red-950/60 border border-red-800 rounded-lg text-red-300">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Missing Cadets */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Missing Cadets</div>
                      <div className="text-xs text-red-400">-25 pts per cadet below requirement</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setMissingCadets(Math.max(0, missingCadets - 1))} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                        <Minus size={16} />
                      </button>
                      <span className="font-mono text-xl font-bold w-6 text-center text-red-400">{missingCadets}</span>
                      <button onClick={() => setMissingCadets(missingCadets + 1)} className="p-2 bg-red-950/60 border border-red-800 rounded-lg text-red-300">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Time Violations (if stopwatch exceeded maxSecs) */}
                  {timePenaltySecs > 0 && (
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-red-900/60 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-red-300">Time Window Overrun</div>
                        <div className="text-xs text-red-400">-1 pt per second over limit ({maxSecs}s allowed)</div>
                      </div>
                      <span className="font-mono text-xl font-bold text-red-400">-{timePenaltySecs} pts</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SCORE SUMMARY FOOTER */}
            <div className="bg-slate-800 p-4 rounded-xl border border-amber-500/30 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-400">Raw Score: <span className="font-bold text-slate-200">{totalRawScore.toFixed(2)}</span></div>
                {judgeInfo?.is_head_judge && (
                  <div className="text-xs text-red-400">Deductions: <span className="font-bold">-{totalPenalties.toFixed(2)}</span></div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Calculated Net</div>
                <div className="text-2xl font-black text-emerald-400">{netScore.toFixed(2)}</div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              {submitting ? 'Transmitting Scorecard...' : <><Send size={20} /> Submit & Lock Scorecard</>}
            </button>
          </>
        )}

        {/* SUCCESS CONFIRMATION */}
        {submittedSuccess && (
          <div className="bg-slate-800 border border-emerald-500/50 p-6 rounded-2xl text-center space-y-3 shadow-xl">
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-100">Scorecard Transmitted</h3>
            <p className="text-sm text-slate-400">
              The evaluation scores and penalties have been successfully posted and calculated into the official tournament results.
            </p>
            <button 
              onClick={() => { setSelectedTeamId(''); setSubmittedSuccess(false); }}
              className="mt-4 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-sm text-slate-200 cursor-pointer"
            >
              Score Next Team
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
