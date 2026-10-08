'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { 
  Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, 
  Minus, Plus, ShieldAlert, Award, FileText, Send, UserCheck, Shield, Clock
} from 'lucide-react';
import { drillStore, INITIAL_JUDGES, INITIAL_TEAMS, INITIAL_EVENTS } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getCriteriaForEvent, CriteriaDefinition } from '@/lib/drill-sop/criteria';

// Local scoring state per criteria item
interface CriteriaScore {
  id: string;
  score: number; // 0 = unscored, 1-5 for regulation/exhibition, 1-10 for CG commands, 1-25 for CG holistic
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

  // Official criteria loaded for this judge's event
  const [officialCriteria, setOfficialCriteria] = useState<CriteriaDefinition[]>([]);
  const [criteriaScores, setCriteriaScores] = useState<CriteriaScore[]>([]);

  // Penalty Counters (Head Judge Only)
  const [boundaryViolations, setBoundaryViolations] = useState<number>(0);
  const [outOfSequence, setOutOfSequence] = useState<number>(0);
  const [missingCadets, setMissingCadets] = useState<number>(0);

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
            const { data: judgeRaw } = await supabase
              .from('judges')
              .select('*, events(*)')
              .eq('user_id', user.id)
              .single();
            const judge = judgeRaw as any;

            if (judge) {
              activeJudge = judge;
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

        // Load official criteria for this judge's event
        const category = activeJudge?.events?.category || 'REGULATION';
        const division = activeJudge?.events?.division;
        const criteria = getCriteriaForEvent(category, division);
        setOfficialCriteria(criteria);
        setCriteriaScores(criteria.map((c) => ({ id: c.id, score: 0 })));

      } catch (err) {
        console.warn('Error fetching live judge data, falling back to local store:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Switch demo judge
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

    // Reload criteria for the new judge's event
    const category = selected?.events?.category || 'REGULATION';
    const division = selected?.events?.division;
    const criteria = getCriteriaForEvent(category, division);
    setOfficialCriteria(criteria);
    setCriteriaScores(criteria.map((c) => ({ id: c.id, score: 0 })));
    setSubmittedSuccess(false);
    setBoundaryViolations(0);
    setOutOfSequence(0);
    setMissingCadets(0);
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
  // 3. Scoring helpers
  // ------------------------------------------------------------------
  const setScore = (id: string, score: number) => {
    setCriteriaScores((prev) =>
      prev.map((cs) => (cs.id === id ? { ...cs, score } : cs))
    );
  };

  const getScore = (id: string) => criteriaScores.find((cs) => cs.id === id)?.score ?? 0;

  // Build tap button options for a given item (1 to maxPoints, stepping by 1 for 1-5, 1-10, etc.)
  // For regulation: 1-5 buttons. For CG commands: 2,4,6,8,10. For holistic: 5,10,15,20,25.
  const getTapOptions = (maxPoints: number): number[] => {
    if (maxPoints === 5) return [1, 2, 3, 4, 5];
    if (maxPoints === 10) return [2, 4, 6, 8, 10];
    if (maxPoints === 25) return [5, 10, 15, 20, 25];
    // Fallback: evenly spaced 5 options
    const step = maxPoints / 5;
    return [1, 2, 3, 4, 5].map((i) => Math.round(i * step));
  };

  // ------------------------------------------------------------------
  // 4. Computed Calculations
  // ------------------------------------------------------------------
  const totalRawScore = criteriaScores.reduce((sum, cs) => sum + cs.score, 0);
  const maxPossibleScore = officialCriteria.reduce((sum, c) => sum + c.maxPoints, 0);

  const maxSecs = judgeInfo?.events?.time_limit_max_sec || judgeInfo?.events?.time_limit_max || 0;
  const timePenaltySecs = maxSecs > 0 && timerSeconds > maxSecs ? timerSeconds - maxSecs : 0;

  const totalPenalties =
    (boundaryViolations * 10) +
    (outOfSequence * 10) +
    (missingCadets * 25) +
    (timePenaltySecs * 1);

  const netScore = Math.max(0, totalRawScore - totalPenalties);
  const scoredCount = criteriaScores.filter((cs) => cs.score > 0).length;
  const progressPct = officialCriteria.length > 0 ? Math.round((scoredCount / officialCriteria.length) * 100) : 0;

  // ------------------------------------------------------------------
  // 5. Submit Scorecard & Penalties
  // ------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!selectedTeamId) {
      alert('Please select a team before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const breakdownObj = criteriaScores.reduce((acc, curr) => {
        acc[curr.id] = curr.score;
        return acc;
      }, {} as Record<string, number>);

      drillStore.saveScorecard({
        id: `sc-${judgeInfo.id}-${selectedTeamId}-${judgeInfo.assigned_event_id}`,
        team_id: selectedTeamId,
        judge_id: judgeInfo.id,
        event_id: judgeInfo.assigned_event_id,
        raw_score: totalRawScore,
        overall_knowledge_score: 0,
        uniform_appearance_score: 0,
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
          pause_violation_count: 0,
          boundary_violations: boundaryViolations,
          time_under_over_seconds: timePenaltySecs,
          total_penalty_deduction: totalPenalties,
          elapsed_time_seconds: timerSeconds,
        });
      }

      if (isSupabaseConfigured) {
        const { error: scorecardErr } = await supabase
          .from('scorecards')
          .upsert({
            team_id: selectedTeamId,
            judge_id: judgeInfo.id,
            event_id: judgeInfo.assigned_event_id,
            raw_score: totalRawScore,
            overall_knowledge_score: 0,
            uniform_appearance_score: 0,
            criteria_breakdown: criteriaScores,
            status: 'SUBMITTED',
            submitted_at: new Date().toISOString()
          } as any);

        if (scorecardErr) console.warn('Supabase scorecard sync warning:', scorecardErr.message);

        if (judgeInfo.is_head_judge) {
          const { error: penaltyErr } = await supabase
            .from('penalties')
            .upsert({
              team_id: selectedTeamId,
              event_id: judgeInfo.assigned_event_id,
              head_judge_id: judgeInfo.id,
              missing_cadet_count: missingCadets,
              pause_violation_count: 0,
              boundary_violations: boundaryViolations,
              time_under_over_seconds: timePenaltySecs,
            } as any);
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
    <div className="min-h-screen text-slate-100 pb-12 select-none">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-30 camo-card-burgundy border-b border-concordia-burgundy-light/40 px-4 py-3 flex justify-between items-center shadow-xl">
        <div>
          <h1 className="text-lg font-extrabold text-white">Homer L. Clendenen Memorial Drill Meet</h1>
          <p className="text-xs text-gray-200">
            {judgeInfo?.events?.name || 'Drill Event'} | {judgeInfo?.is_head_judge ? 'HEAD JUDGE' : `Judge #${judgeInfo?.judge_number || 2}`}
          </p>
        </div>

        {/* TIMER DISPLAY */}
        <div className="flex items-center space-x-2 bg-military-dark/90 px-3 py-1.5 rounded-lg border border-concordia-burgundy/40 shadow-inner">
          <span className="font-mono text-xl text-emerald-400 font-bold">{formatTime(timerSeconds)}</span>
          <button 
            onClick={() => setIsTimerRunning(!isTimerRunning)} 
            className="p-1.5 rounded bg-concordia-burgundy hover:bg-concordia-burgundy-light text-white transition-colors"
            title={isTimerRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}
          >
            {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button 
            onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }} 
            className="p-1.5 rounded bg-military-dark hover:bg-military-slate text-gray-300 border border-military-slate transition-colors"
            title="Reset Stopwatch"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* DEMO / FIELD PROFILE SWITCHER */}
      {demoJudges.length > 0 && (
        <div className="camo-card border-b border-concordia-burgundy/40 px-4 py-2">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 text-xs">
            <span className="text-gray-300 flex items-center gap-1 font-semibold">
              <UserCheck size={14} className="text-concordia-burgundy-lighter" /> Active Judge:
            </span>
            <div className="flex items-center gap-1.5">
              {demoJudges.map((j) => (
                <button
                  key={j.id}
                  onClick={() => handleSwitchDemoJudge(j.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    judgeInfo?.id === j.id
                      ? 'bg-white text-concordia-burgundy-dark shadow-md border border-white font-black'
                      : 'bg-military-dark/90 text-gray-200 hover:text-white border border-concordia-burgundy/40'
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
        <div className="camo-card p-4 rounded-xl border border-concordia-burgundy/40 space-y-2 shadow-lg">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Select Competing Unit</label>
          <select 
            value={selectedTeamId}
            onChange={(e) => { setSelectedTeamId(e.target.value); setSubmittedSuccess(false); }}
            className="w-full bg-military-dark border border-concordia-burgundy/50 rounded-lg p-3 text-white font-medium focus:ring-2 focus:ring-concordia-burgundy focus:outline-none"
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
            {/* PROGRESS BAR */}
            {officialCriteria.length > 0 && (
              <div className="camo-card p-3 rounded-xl border border-concordia-burgundy/30 shadow">
                <div className="flex justify-between items-center mb-1.5 text-xs text-gray-300">
                  <span className="font-semibold">Scoring Progress</span>
                  <span className="font-mono font-bold text-white">{scoredCount} / {officialCriteria.length} items scored</span>
                </div>
                <div className="w-full bg-military-dark rounded-full h-2.5 border border-military-slate/60">
                  <div
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: progressPct === 100 ? '#4ade80' : '#7A3346',
                    }}
                  />
                </div>
                <div className="text-right text-xs text-gray-400 mt-1 font-mono">{progressPct}%</div>
              </div>
            )}

            {/* OFFICIAL MOVEMENT CRITERIA — 1-5 TAP BUTTONS */}
            <div className="camo-card rounded-xl border border-concordia-burgundy/40 p-4 space-y-3 shadow-lg">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Award size={18} className="text-concordia-burgundy-lighter" /> 
                Official Prescribed Movements
                <span className="ml-auto text-xs font-normal text-gray-400 normal-case tracking-normal">
                  {officialCriteria.length} items · max {maxPossibleScore} pts
                </span>
              </h2>

              {officialCriteria.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No criteria loaded for this event.</p>
              ) : (
                <div className="space-y-2">
                  {officialCriteria.map((item) => {
                    const currentScore = getScore(item.id);
                    const tapOptions = getTapOptions(item.maxPoints);
                    return (
                      <div
                        key={item.id}
                        className={`rounded-lg border p-3 transition-colors ${
                          currentScore > 0
                            ? 'bg-military-dark/80 border-concordia-burgundy/50'
                            : 'bg-slate-900/70 border-slate-800'
                        }`}
                      >
                        {/* Command header row */}
                        <div className="flex items-start gap-2 mb-2.5">
                          {/* Sequence number badge */}
                          <span className="flex-shrink-0 w-7 h-7 rounded bg-military-dark border border-concordia-burgundy/40 text-xs font-black text-concordia-burgundy-lighter flex items-center justify-center">
                            {item.seqNumber}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-sm font-semibold leading-tight ${currentScore > 0 ? 'text-white' : 'text-slate-200'}`}>
                                {item.name}
                              </span>
                              {item.isPauseCommand && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-600/40">
                                  <Clock size={9} />5 SEC
                                </span>
                              )}
                            </div>
                            {item.description && !item.isPauseCommand && (
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{item.description}</p>
                            )}
                          </div>
                          {/* Current score display */}
                          <div className="flex-shrink-0 text-right">
                            <span className={`text-lg font-black font-mono ${currentScore > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                              {currentScore > 0 ? currentScore : '—'}
                            </span>
                            <div className="text-[10px] text-slate-500">/{item.maxPoints}</div>
                          </div>
                        </div>

                        {/* TAP BUTTONS */}
                        <div className="flex gap-1.5">
                          {tapOptions.map((val) => (
                            <button
                              key={val}
                              onClick={() => setScore(item.id, currentScore === val ? 0 : val)}
                              className={`flex-1 py-2.5 rounded-lg text-sm font-black border transition-all active:scale-95 ${
                                currentScore === val
                                  ? 'bg-concordia-burgundy border-concordia-burgundy-light text-white shadow-lg shadow-concordia-burgundy/40'
                                  : 'bg-military-dark/80 border-slate-700 text-slate-300 hover:border-concordia-burgundy/50 hover:text-white'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* HEAD JUDGE PENALTY CONTROLLERS */}
            {judgeInfo?.is_head_judge && (
              <div className="camo-card rounded-xl border border-red-900/50 p-4 space-y-4 shadow-lg">
                <h2 className="text-sm font-extrabold text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={18} className="text-red-400" /> Rule Violations &amp; Deductions
                </h2>

                <div className="space-y-3">
                  {/* Boundary Violations */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Boundary Violation</div>
                      <div className="text-xs text-red-400">-10 pts per event boundary breach</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setBoundaryViolations(Math.max(0, boundaryViolations - 1))} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 active:scale-95">
                        <Minus size={16} />
                      </button>
                      <span className="font-mono text-xl font-bold w-6 text-center text-red-400">{boundaryViolations}</span>
                      <button onClick={() => setBoundaryViolations(boundaryViolations + 1)} className="p-2 bg-red-950/60 border border-red-800 rounded-lg text-red-300 active:scale-95">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Out-of-Sequence Command */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Out-of-Sequence Command</div>
                      <div className="text-xs text-red-400">-10 pts per command given out of order</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setOutOfSequence(Math.max(0, outOfSequence - 1))} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 active:scale-95">
                        <Minus size={16} />
                      </button>
                      <span className="font-mono text-xl font-bold w-6 text-center text-red-400">{outOfSequence}</span>
                      <button onClick={() => setOutOfSequence(outOfSequence + 1)} className="p-2 bg-red-950/60 border border-red-800 rounded-lg text-red-300 active:scale-95">
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
                      <button onClick={() => setMissingCadets(Math.max(0, missingCadets - 1))} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 active:scale-95">
                        <Minus size={16} />
                      </button>
                      <span className="font-mono text-xl font-bold w-6 text-center text-red-400">{missingCadets}</span>
                      <button onClick={() => setMissingCadets(missingCadets + 1)} className="p-2 bg-red-950/60 border border-red-800 rounded-lg text-red-300 active:scale-95">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Time Violations */}
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
            <div className="camo-card-burgundy p-4 rounded-xl border-2 border-concordia-burgundy-light/60 shadow-xl">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-xs text-gray-200">
                    Raw Score: <span className="font-bold text-white font-mono">{totalRawScore}</span>
                    <span className="text-gray-400"> / {maxPossibleScore}</span>
                  </div>
                  {judgeInfo?.is_head_judge && totalPenalties > 0 && (
                    <div className="text-xs text-red-300">
                      Deductions: <span className="font-bold">-{totalPenalties}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-200 uppercase tracking-wider font-bold">Net Score</div>
                  <div className="text-3xl font-black text-white font-mono drop-shadow">{netScore}</div>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={submitting || scoredCount === 0}
              className="w-full py-4 bg-white hover:bg-gray-100 disabled:opacity-50 text-concordia-burgundy-dark font-black text-lg rounded-xl flex items-center justify-center gap-2 shadow-2xl border-2 border-white transition-all transform hover:scale-[1.01] cursor-pointer"
            >
              {submitting ? 'Transmitting Scorecard...' : <><Send size={20} className="text-concordia-burgundy" /> Submit &amp; Lock Scorecard</>}
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
