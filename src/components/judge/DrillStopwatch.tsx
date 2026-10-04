'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DrillEvent } from '@/types/drill';
import { calculateTimePenalty } from '@/lib/drill-sop/penalties';

interface DrillStopwatchProps {
  event: DrillEvent;
  elapsedSeconds: number;
  onTimeChange: (seconds: number) => void;
  isReadOnly?: boolean;
}

export default function DrillStopwatch({
  event,
  elapsedSeconds,
  onTimeChange,
  isReadOnly = false,
}: DrillStopwatchProps) {
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        onTimeChange(elapsedSeconds + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, elapsedSeconds, onTimeChange]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const penaltyInfo = calculateTimePenalty(elapsedSeconds, event);
  const minSec = event.time_limit_min_sec ?? event.time_limit_min ?? 0;
  const maxSec = event.time_limit_max_sec ?? event.time_limit_max ?? 0;
  const minMin = Math.floor(minSec / 60);
  const maxMin = Math.floor(maxSec / 60);

  // Status color
  let statusColor = 'text-gray-300';
  let badgeText = 'Standby';
  if (elapsedSeconds > 0) {
    if (minSec > 0 && elapsedSeconds < minSec) {
      statusColor = 'text-amber-400';
      badgeText = `Under Min (${minMin}m)`;
    } else if (maxSec === 0 || elapsedSeconds <= maxSec) {
      statusColor = 'text-emerald-400';
      badgeText = 'Regulation Window';
    } else {
      statusColor = 'text-red-400';
      badgeText = `Over Max (${maxMin}m)`;
    }
  }

  return (
    <div className="bg-army-dark border border-army-border rounded-xl p-3.5 sm:p-4 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-army-gold" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Drill Pad Official Timer
          </span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-army-black text-army-gold border border-army-border">
          Target: {minMin}:00 - {maxMin}:00
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-army-black/70 p-3 rounded-lg border border-army-border/60">
        <div className="flex items-center gap-3">
          <span className={`text-3xl sm:text-4xl font-mono font-extrabold tracking-wider ${statusColor}`}>
            {formatTime(elapsedSeconds)}
          </span>
          <div className="flex flex-col">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                statusColor === 'text-emerald-400'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                  : statusColor === 'text-red-400'
                  ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                  : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
              }`}
            >
              {badgeText}
            </span>
            {penaltyInfo.penaltyPoints > 0 && (
              <span className="text-[11px] font-bold text-red-400 mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                -{penaltyInfo.penaltyPoints} pts ({penaltyInfo.secondsOff}s violation)
              </span>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-black'
                  : 'bg-army-gold hover:bg-army-gold-light text-black'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" /> Stop Report
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start Report
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                onTimeChange(0);
              }}
              disabled={elapsedSeconds === 0}
              className="p-2 rounded-lg bg-army-slate hover:bg-army-slate/80 text-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Reset stopwatch"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
