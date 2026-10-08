import React from 'react';
import { Sparkles, FileText, History, Upload, Download, RefreshCw } from 'lucide-react';
import { ResearchReport } from '../types/research';

interface HeaderProps {
  currentReport: ResearchReport | null;
  isResearching: boolean;
  historyCount: number;
  uploadedDocsCount: number;
  onNewResearch: () => void;
  onOpenHistory: () => void;
  onOpenDocuments: () => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentReport,
  isResearching,
  historyCount,
  uploadedDocsCount,
  onNewResearch,
  onOpenHistory,
  onOpenDocuments,
  onExportMarkdown,
  onExportJson,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewResearch}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-600 transition-colors">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-base tracking-tight">ResearchPilot</span>
                <span className="text-xs text-slate-500 font-mono">v2.4</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Autonomous Research & Evidence Analysis Agent
              </p>
            </div>
          </button>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2">
          {/* New Research Button */}
          {currentReport && !isResearching && (
            <button
              onClick={onNewResearch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Question</span>
            </button>
          )}

          {/* Attached Documents Trigger */}
          <button
            onClick={onOpenDocuments}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors"
            title="Manage Reference Documents for RAG"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>References</span>
            {uploadedDocsCount > 0 && (
              <span className="text-slate-900 font-semibold">({uploadedDocsCount})</span>
            )}
          </button>

          {/* Past Reports History Trigger */}
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors"
            title="View Past Research History"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="text-slate-900 font-semibold">({historyCount})</span>
            )}
          </button>

          {/* Export Dropdown / Buttons if report loaded */}
          {currentReport && (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
              <button
                onClick={onExportMarkdown}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Export as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Export .MD</span>
              </button>
              <button
                onClick={onExportJson}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Export Full JSON Evidence"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden md:inline">JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
