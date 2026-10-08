import React from 'react';
import { Award, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { ResponseEvaluation } from '../types/research';

interface EvaluationRadarProps {
  evaluation: ResponseEvaluation;
  onAskFollowUp: (q: string) => void;
}

export const EvaluationRadar: React.FC<EvaluationRadarProps> = ({
  evaluation,
  onAskFollowUp,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Evaluation Scorecard */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Multi-Criteria Rubric & Peer-Review Evaluation</span>
            </div>
            <p className="text-xs text-slate-600">
              Rigorous G-Eval style assessment evaluating factual accuracy, analytical rigor, neutrality, and practical utility.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-500">Composite Score</div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {evaluation.overallScore} <span className="text-sm font-normal text-slate-400">/ 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Dimensional Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
          {evaluation.dimensions.map((dim, idx) => {
            const pct = Math.round((dim.score / 10) * 100);

            return (
              <div key={idx} className="bg-slate-50/70 border border-slate-200/70 rounded-lg p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>{dim.name}</span>
                  <span className="text-indigo-700 font-mono">{dim.score.toFixed(1)} / 10</span>
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{dim.critique}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths and Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Key Strengths */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Key Research Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {evaluation.keyStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations & Caveats */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Limitations & Environmental Caveats</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {evaluation.limitations.map((lim, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span className="leading-relaxed">{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Follow-Ups */}
      {evaluation.suggestedFollowUps && evaluation.suggestedFollowUps.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Recommended Investigative Extensions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {evaluation.suggestedFollowUps.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onAskFollowUp(q)}
                className="text-left p-3.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-lg text-xs text-slate-800 hover:text-indigo-950 transition-all font-medium leading-snug group"
              >
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold group-hover:text-indigo-600">
                  Follow-Up #{idx + 1}
                </div>
                <div>{q}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
