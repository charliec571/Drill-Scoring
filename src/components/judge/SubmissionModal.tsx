'use client';

import React, { useState } from 'react';
import { Scorecard, PenaltyRecord, DrillEvent, Team, School } from '@/types/drill';
import { Lock, CheckCircle, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface SubmissionModalProps {
  scorecard: Scorecard;
  penalty?: PenaltyRecord;
  event: DrillEvent;
  team: Team;
  school?: School;
  judgeName: string;
  isHeadJudge: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (signatureName: string) => void;
}

export default function SubmissionModal({
  scorecard,
  penalty,
  event,
  team,
  school,
  judgeName,
  isHeadJudge,
  isOpen,
  onClose,
  onSubmit,
}: SubmissionModalProps) {
  const [signature, setSignature] = useState(judgeName);
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const rawScore = scorecard.raw_score || 0;
  const totalDeductions = isHeadJudge && penalty ? penalty.total_penalty_deduction : 0;
  const netScore = Math.max(0, rawScore - totalDeductions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature.trim() || !agreed) return;
    onSubmit(signature.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-army-dark border border-army-gold/60 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-army-green to-army-black p-4 flex items-center justify-between border-b border-army-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-army-gold rounded-lg text-army-black">
              <ShieldCheck className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Official Digital Sign-off & Lock
              </h3>
              <p className="text-xs text-army-gold-light">
                2026 JROTC National Drill Championship
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Card */}
        <div className="p-5 space-y-4">
          <div className="bg-army-black/70 p-4 rounded-xl border border-army-border space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>School / Team:</span>
              <span className="font-bold text-white text-sm">
                {school?.name || 'Team'} ({team.division})
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Event Category:</span>
              <span className="font-semibold text-army-gold">{event.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Cadet Commander:</span>
              <span className="text-gray-300 font-mono">{team.commander_name}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Cadet Count:</span>
              <span className="text-gray-300 font-mono">{team.cadet_count} cadets</span>
            </div>
          </div>

          {/* Point Breakdown */}
          <div className="bg-army-black p-4 rounded-xl border border-army-border/70 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Judge Raw Score:</span>
              <span className="font-mono font-bold text-white">{rawScore.toFixed(2)} pts</span>
            </div>

            {isHeadJudge && (
              <div className="flex justify-between text-sm text-red-400">
                <span>Head Judge Total Deductions:</span>
                <span className="font-mono font-bold">-{totalDeductions.toFixed(2)} pts</span>
              </div>
            )}

            <div className="pt-2 border-t border-army-border flex justify-between items-baseline">
              <span className="text-xs uppercase font-extrabold tracking-wider text-army-gold">
                Net Score:
              </span>
              <span className="text-2xl font-mono font-extrabold text-army-gold">
                {netScore.toFixed(2)} pts
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Official Signature / Judge Name
              </label>
              <input
                type="text"
                required
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type full rank & name to sign"
                className="w-full bg-army-black border border-army-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-army-gold font-mono"
              />
            </div>

            <div className="flex items-start gap-2.5 bg-army-slate/30 p-3 rounded-lg border border-army-border/50">
              <input
                type="checkbox"
                id="lock-confirm"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-army-gold focus:ring-army-gold bg-army-black border-army-border cursor-pointer"
              />
              <label htmlFor="lock-confirm" className="text-xs text-gray-300 leading-snug cursor-pointer">
                I attest that this scorecard was recorded in accordance with TC 3-21.5 and official 2026 JROTC National Drill Championship SOP rules.
                <span className="block text-amber-300 font-bold mt-1">
                  ⚠️ Once submitted, this scorecard transitions to SUBMITTED status and will be permanently locked from field edits.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
              >
                Return to Review
              </button>
              <button
                type="submit"
                disabled={!agreed || !signature.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-army-gold hover:bg-army-gold-light text-army-black font-extrabold text-xs uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none shadow-lg transition-all"
              >
                <Lock className="w-4 h-4" /> Sign & Lock Scorecard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
