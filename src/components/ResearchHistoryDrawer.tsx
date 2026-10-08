import React from 'react';
import { X, Trash2, Clock, ChevronRight, FileText, Award } from 'lucide-react';
import { ResearchReport } from '../types/research';
import { formatDate } from '../utils/formatters';

interface ResearchHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ResearchReport[];
  currentReportId: string | null;
  onSelectReport: (report: ResearchReport) => void;
  onDeleteReport: (id: string) => void;
  onClearHistory: () => void;
}

export const ResearchHistoryDrawer: React.FC<ResearchHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  currentReportId,
  onSelectReport,
  onDeleteReport,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Research History</h3>
            <p className="text-[11px] text-slate-500">
              {history.length} saved investigation{history.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No past research sessions yet. Completed investigations are automatically saved locally.
            </div>
          ) : (
            history.map((item) => {
              const isSelected = item.id === currentReportId;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all text-left group flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectReport(item);
                      onClose();
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                      <span>{formatDate(item.createdAt)}</span>
                      <span>·</span>
                      <span className="capitalize">{item.depth}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-900 line-clamp-2 leading-snug mb-2">
                      {item.query}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>{item.sources.length} sources</span>
                      </span>
                      <span className="flex items-center gap-1 text-indigo-700 font-medium">
                        <Award className="w-3 h-3" />
                        <span>{item.evaluation.overallScore}/10</span>
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReport(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center text-xs">
            <button
              onClick={onClearHistory}
              className="text-rose-600 hover:text-rose-700 hover:underline"
            >
              Clear All History
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
