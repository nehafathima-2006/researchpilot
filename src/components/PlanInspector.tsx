import React from 'react';
import { Compass, CheckSquare, Target, Search } from 'lucide-react';
import { ResearchPlan } from '../types/research';

interface PlanInspectorProps {
  plan: ResearchPlan;
}

export const PlanInspector: React.FC<PlanInspectorProps> = ({ plan }) => {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1">
          <Compass className="w-4 h-4 text-indigo-600" />
          <span>Formulated Research Architecture & Strategy</span>
        </div>
        <p className="text-xs text-slate-600">
          The autonomous planning module decomposed the objective into empirical sub-questions and search vectors before retrieving evidence.
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs">
          <div>
            <span className="text-slate-500">Domain:</span>{' '}
            <span className="font-semibold text-slate-900">{plan.domain}</span>
          </div>
          <div>
            <span className="text-slate-500">Sub-Questions:</span>{' '}
            <span className="font-semibold text-slate-900">{plan.subQuestions.length}</span>
          </div>
          <div>
            <span className="text-slate-500">Search Vectors:</span>{' '}
            <span className="font-semibold text-slate-900">{plan.searchQueries.length}</span>
          </div>
        </div>
      </div>

      {/* Grid of Plan Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sub-Questions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Investigative Sub-Questions</span>
          </div>
          <ol className="space-y-2.5 text-xs text-slate-700 list-decimal list-inside">
            {plan.subQuestions.map((sq, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="font-medium text-slate-900">{sq}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Core Hypotheses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Core Hypotheses Tested</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {plan.coreHypotheses.map((hyp, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{hyp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Evidence Criteria */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <span>Evidence Validation Criteria</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {plan.evidenceCriteria.map((ec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span className="leading-relaxed">{ec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Search Vectors */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
            <Search className="w-4 h-4 text-slate-600" />
            <span>Search Vectors Dispatched</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {plan.searchQueries.map((sq, idx) => (
              <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700">
                {sq}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
