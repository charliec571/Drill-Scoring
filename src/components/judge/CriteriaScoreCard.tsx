'use client';

import React from 'react';
import { CriteriaDefinition } from '@/lib/drill-sop/criteria';
import { Scorecard } from '@/types/drill';
import { Award, Check, Sparkles, BookOpen, Shirt } from 'lucide-react';

interface CriteriaScoreCardProps {
  criteriaList: CriteriaDefinition[];
  scorecard: Scorecard;
  onScoreChange: (criteriaId: string, value: number) => void;
  onSpecialScoreChange: (field: 'overall_knowledge_score' | 'uniform_appearance_score', value: number) => void;
  isReadOnly?: boolean;
}

export default function CriteriaScoreCard({
  criteriaList,
  scorecard,
  onScoreChange,
  onSpecialScoreChange,
  isReadOnly = false,
}: CriteriaScoreCardProps) {
  const quickPillOptions = [10, 9.5, 9.0, 8.5, 8.0, 7.5, 6.0];

  return (
    <div className="space-y-4">
      {criteriaList.map((item, index) => {
        // Is this a special Head Judge tie-breaker item?
        const isSpecialKnowledge = item.isHeadJudgeSpecial === 'knowledge';
        const isSpecialUniform = item.isHeadJudgeSpecial === 'uniform';

        const currentScore = isSpecialKnowledge
          ? (scorecard.overall_knowledge_score ?? 45)
          : isSpecialUniform
          ? (scorecard.uniform_appearance_score ?? 45)
          : ((scorecard.criteria_breakdown && scorecard.criteria_breakdown[item.id]) ?? (scorecard.criteria_scores && scorecard.criteria_scores[item.id]) ?? 9.0);

        return (
          <div
            key={item.id}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
              isSpecialKnowledge || isSpecialUniform
                ? 'bg-army-green/20 border-army-gold shadow-md'
                : 'bg-army-dark border-army-border hover:border-army-slate'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-army-black text-army-gold text-[10px] font-mono font-bold flex items-center justify-center border border-army-border">
                    {index + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {isSpecialKnowledge && <BookOpen className="w-4 h-4 text-army-gold" />}
                    {isSpecialUniform && <Shirt className="w-4 h-4 text-army-gold" />}
                    {item.name}
                  </h4>
                  {(isSpecialKnowledge || isSpecialUniform) && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-army-gold text-army-black font-extrabold uppercase">
                      Official SOP Tie-Breaker
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-7 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Score Display */}
              <div className="flex items-center gap-2 self-end sm:self-start">
                <span className="text-xs text-gray-400 font-mono">Score:</span>
                <span className="text-xl sm:text-2xl font-mono font-extrabold text-army-gold bg-army-black px-3 py-1 rounded-lg border border-army-border">
                  {currentScore.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500 font-mono">/ {item.maxPoints}</span>
              </div>
            </div>

            {/* Quick Scoring Pill Buttons */}
            {!isReadOnly && (
              <div className="pt-2 border-t border-army-border/60 pl-0 sm:pl-7">
                {isSpecialKnowledge || isSpecialUniform ? (
                  // Increments for 0-50 special score
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">Quick Select:</span>
                    {[50, 48, 46, 44, 42, 40, 35, 30].map((val) => (
                      <button
                        key={val}
                        onClick={() =>
                          isSpecialKnowledge
                            ? onSpecialScoreChange('overall_knowledge_score', val)
                            : onSpecialScoreChange('uniform_appearance_score', val)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          currentScore === val
                            ? 'bg-army-gold text-army-black ring-2 ring-army-gold shadow-md'
                            : 'bg-army-black text-gray-300 hover:text-white hover:bg-army-slate border border-army-border'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                ) : (
                  // Increments for 0-10 criteria
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">Quick Select:</span>
                    {quickPillOptions.map((val) => (
                      <button
                        key={val}
                        onClick={() => onScoreChange(item.id, val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          currentScore === val
                            ? 'bg-army-gold text-army-black ring-2 ring-army-gold shadow-md'
                            : 'bg-army-black text-gray-300 hover:text-white hover:bg-army-slate border border-army-border'
                        }`}
                      >
                        {val.toFixed(1)}
                      </button>
                    ))}

                    {/* Stepper adjustment */}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => onScoreChange(item.id, Math.max(0, currentScore - 0.5))}
                        className="px-2 py-1 bg-army-slate hover:bg-army-slate/80 text-white rounded text-xs font-mono font-bold"
                      >
                        -0.5
                      </button>
                      <button
                        onClick={() => onScoreChange(item.id, Math.min(item.maxPoints, currentScore + 0.5))}
                        className="px-2 py-1 bg-army-slate hover:bg-army-slate/80 text-white rounded text-xs font-mono font-bold"
                      >
                        +0.5
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
