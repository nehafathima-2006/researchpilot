import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Terminal,
  Clock,
} from 'lucide-react';
import { ResearchStageId, StageProgress } from '../types/research';

interface WorkflowTrackerProps {
  stages: Record<ResearchStageId, StageProgress>;
  currentStageId: ResearchStageId | null;
  elapsedSeconds: number;
  isComplete: boolean;
  onViewReport?: () => void;
}

const STAGE_ORDER: Array<{ id: ResearchStageId; label: string; short: string }> = [
  { id: 'query_understanding', label: 'Query Understanding', short: 'Intent' },
  { id: 'research_planning', label: 'Strategic Planning', short: 'Plan' },
  { id: 'search_retrieval', label: 'Search & Grounding', short: 'Search' },
  { id: 'source_processing', label: 'Source Extraction', short: 'Sources' },
  { id: 'rag_indexing', label: 'Vector RAG Indexing', short: 'RAG' },
  { id: 'context_management', label: 'Context Engineering', short: 'Context' },
  { id: 'deep_analysis', label: 'Analytical Synthesis', short: 'Analysis' },
  { id: 'claim_verification', label: 'Claim Verification', short: 'Audit' },
  { id: 'response_evaluation', label: 'Response Evaluation', short: 'Eval' },
  { id: 'final_report', label: 'Final Report Assembly', short: 'Report' },
];

export const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({
  stages,
  currentStageId,
  elapsedSeconds,
  isComplete,
}) => {
  const [showLogs, setShowLogs] = useState(false);

  // Compute progress percentage
  const completedCount = Object.values(stages).filter((s) => s.status === 'completed').length;
  const progressPercent = Math.min(100, Math.round((completedCount / STAGE_ORDER.length) * 100));

  const currentStage = currentStageId ? stages[currentStageId] : null;

  // Flatten logs from all stages
  const allLogs: Array<{ stage: string; text: string }> = [];
  STAGE_ORDER.forEach((s) => {
    const stageData = stages[s.id];
    if (stageData?.logs?.length) {
      stageData.logs.forEach((log) => {
        allLogs.push({ stage: s.label, text: log });
      });
    }
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-6">
      {/* Header with Title and Elapsed Time */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Autonomous Agent Workflow
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {completedCount} of {STAGE_ORDER.length} stages complete
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            {isComplete
              ? 'Multi-stage autonomous investigation completed successfully.'
              : currentStage?.detail || 'Executing autonomous pipeline...'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-mono bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{elapsedSeconds.toFixed(1)}s elapsed</span>
          </div>

          <button
            onClick={() => setShowLogs(!showLogs)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <Terminal className="w-3 h-3 text-slate-500" />
            <span>{showLogs ? 'Hide Logs' : 'View Logs'}</span>
            {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-5">
        <div
          className="bg-slate-900 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Visual Stepper Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {STAGE_ORDER.map((item, index) => {
          const stageState = stages[item.id];
          const isCurrent = currentStageId === item.id;
          const isDone = stageState?.status === 'completed';

          return (
            <div
              key={item.id}
              className={`p-2 rounded-lg border text-left transition-all ${
                isCurrent
                  ? 'border-indigo-400 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-300'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-slate-100 bg-slate-50/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-600 font-semibold">
                  0{index + 1}
                </span>
                {isCurrent ? (
                  <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
                ) : isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Circle className="w-3 h-3 text-slate-300" />
                )}
              </div>
              <div className="text-xs font-medium text-slate-800 truncate" title={item.label}>
                {item.short}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Execution Logs Console */}
      {showLogs && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
            <span>Execution Telemetry & Activity Stream</span>
            <span className="text-[11px] text-slate-500 font-normal">
              {allLogs.length} logged events
            </span>
          </div>
          <div className="bg-slate-900 text-slate-200 rounded-lg p-3 font-mono text-xs max-h-52 overflow-y-auto space-y-1.5 shadow-inner">
            {allLogs.length === 0 ? (
              <div className="text-slate-500 italic">No events logged yet.</div>
            ) : (
              allLogs.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 shrink-0">[{entry.stage}]</span>
                  <span className="text-slate-300 break-words">{entry.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
