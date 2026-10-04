'use client';

import React, { useState } from 'react';
import {
  PenaltyRecord,
  DrillEvent,
} from '@/types/drill';
import { PENALTY_RATES, computeTotalPenalties } from '@/lib/drill-sop/penalties';
import {
  ShieldAlert,
  Plus,
  Minus,
  AlertOctagon,
  Trash2,
  FileEdit,
  Clock,
  Users,
  Footprints,
} from 'lucide-react';

interface HeadJudgePenaltyDrawerProps {
  penalty: PenaltyRecord;
  event: DrillEvent;
  onPenaltyChange: (updated: PenaltyRecord) => void;
  isReadOnly?: boolean;
}

export default function HeadJudgePenaltyDrawer({
  penalty,
  event,
  onPenaltyChange,
  isReadOnly = false,
}: HeadJudgePenaltyDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateCounts = (field: keyof PenaltyRecord, delta: number) => {
    if (isReadOnly) return;
    const currentVal = (penalty[field] as number) || 0;
    const nextVal = Math.max(0, currentVal + delta);
    const updated: PenaltyRecord = {
      ...penalty,
      [field]: nextVal,
    };
    updated.total_penalty_deduction = computeTotalPenalties(updated);
    onPenaltyChange(updated);
  };

  const handleNotesChange = (text: string) => {
    if (isReadOnly) return;
    onPenaltyChange({
      ...penalty,
      notes: text,
    });
  };

  const totalDeductions = computeTotalPenalties(penalty);
  const missingCount = penalty.missing_cadet_count ?? 0;
  const timeSeconds = penalty.time_under_over_seconds ?? 0;

  return (
    <div className="bg-army-dark border-2 border-red-900/60 rounded-xl overflow-hidden shadow-lg mb-6">
      {/* Drawer Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer bg-red-950/40 hover:bg-red-950/60 p-3.5 sm:p-4 flex items-center justify-between border-b border-red-900/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-900/80 rounded-lg text-red-200">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-red-300">
                HEAD JUDGE PENALTY CONTROLLER
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-red-900/50 text-red-200 border border-red-700/50 uppercase font-bold">
                Exclusive
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Official SOP point deductions applied directly against total raw score
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase text-gray-400 block font-bold">Total Deductions</span>
            <span className="text-lg sm:text-xl font-mono font-extrabold text-red-400">
              -{totalDeductions.toFixed(2)} pts
            </span>
          </div>
          <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Drawer Content */}
      {isExpanded && (
        <div className="p-3.5 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Boundary Violations */}
            <div className="bg-army-black/70 p-3.5 rounded-lg border border-army-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <Footprints className="w-4 h-4 text-amber-400" /> Boundary Violations
                  </span>
                  <span className="text-[10px] font-mono text-red-400 font-bold">
                    -{PENALTY_RATES.BOUNDARY_VIOLATION_PER_OCCURRENCE} pts/ea
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Crossing boundary tape or boundary cones.
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-army-border/60">
                <span className="text-2xl font-mono font-bold text-white">
                  {penalty.boundary_violations || 0}
                </span>
                {!isReadOnly ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCounts('boundary_violations', -1)}
                      className="w-8 h-8 rounded bg-army-slate hover:bg-army-slate/80 text-white flex items-center justify-center text-sm font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateCounts('boundary_violations', 1)}
                      className="w-8 h-8 rounded bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-sm font-bold shadow"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-red-400 font-mono">
                    -{(penalty.boundary_violations || 0) * PENALTY_RATES.BOUNDARY_VIOLATION_PER_OCCURRENCE} pts
                  </span>
                )}
              </div>
            </div>

            {/* 2. Command Pause Violations */}
            <div className="bg-army-black/70 p-3.5 rounded-lg border border-army-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-amber-400" /> Pause Violations
                  </span>
                  <span className="text-[10px] font-mono text-red-400 font-bold">
                    -{PENALTY_RATES.PAUSE_VIOLATION_PER_OCCURRENCE} pts/ea
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Failure to hold mandatory 5-sec pause on bold commands.
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-army-border/60">
                <span className="text-2xl font-mono font-bold text-white">
                  {penalty.pause_violation_count || 0}
                </span>
                {!isReadOnly ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCounts('pause_violation_count', -1)}
                      className="w-8 h-8 rounded bg-army-slate hover:bg-army-slate/80 text-white flex items-center justify-center text-sm font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateCounts('pause_violation_count', 1)}
                      className="w-8 h-8 rounded bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-sm font-bold shadow"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-red-400 font-mono">
                    -{(penalty.pause_violation_count || 0) * PENALTY_RATES.PAUSE_VIOLATION_PER_OCCURRENCE} pts
                  </span>
                )}
              </div>
            </div>

            {/* 3. Missing Cadets */}
            <div className="bg-army-black/70 p-3.5 rounded-lg border border-army-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" /> Missing Cadets
                  </span>
                  <span className="text-[10px] font-mono text-red-400 font-bold">
                    -{PENALTY_RATES.MISSING_CADET_PER_CADET} pts/ea
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Cadets missing below minimum standard complement ({event.min_cadets} cadets).
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-army-border/60">
                <span className="text-2xl font-mono font-bold text-white">
                  {missingCount}
                </span>
                {!isReadOnly ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCounts('missing_cadet_count', -1)}
                      className="w-8 h-8 rounded bg-army-slate hover:bg-army-slate/80 text-white flex items-center justify-center text-sm font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateCounts('missing_cadet_count', 1)}
                      className="w-8 h-8 rounded bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-sm font-bold shadow"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-red-400 font-mono">
                    -{missingCount * PENALTY_RATES.MISSING_CADET_PER_CADET} pts
                  </span>
                )}
              </div>
            </div>

            {/* 4. Time Violations */}
            <div className="bg-army-black/70 p-3.5 rounded-lg border border-army-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" /> Time Violations
                  </span>
                  <span className="text-[10px] font-mono text-red-400 font-bold">
                    -{PENALTY_RATES.TIME_VIOLATION_PER_SECOND} pt/sec
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Seconds under min or over max allowed time window.
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-army-border/60">
                <span className="text-2xl font-mono font-bold text-white">
                  {timeSeconds}s
                </span>
                {!isReadOnly ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCounts('time_under_over_seconds', -5)}
                      className="px-2 h-8 rounded bg-army-slate hover:bg-army-slate/80 text-white text-xs font-bold"
                    >
                      -5s
                    </button>
                    <button
                      onClick={() => updateCounts('time_under_over_seconds', 5)}
                      className="px-2 h-8 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow"
                    >
                      +5s
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-red-400 font-mono">
                    -{timeSeconds * PENALTY_RATES.TIME_VIOLATION_PER_SECOND} pts
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Head Judge Official Incident Notes
            </label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={penalty.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Record any specific drill boundary transgressions, pause violations, or command discrepancies for tournament audit..."
              className="w-full bg-army-black/70 border border-army-border rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-army-gold disabled:opacity-60"
            />
          </div>
        </div>
      )}
    </div>
  );
}
