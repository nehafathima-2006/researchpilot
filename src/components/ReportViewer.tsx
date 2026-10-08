import React, { useState } from 'react';
import { Copy, Check, Download, Bookmark, FileText } from 'lucide-react';
import { ResearchReport } from '../types/research';
import { renderMarkdown, formatDate } from '../utils/formatters';

interface ReportViewerProps {
  report: ResearchReport;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onAskFollowUp: (question: string) => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  onExportMarkdown,
  onExportJson,
  onAskFollowUp,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(report.markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const renderedHtml = renderMarkdown(report.markdownContent);

  return (
    <div className="space-y-6">
      {/* Top Meta Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Investigation Completed</span>
              <span aria-hidden="true">·</span>
              <span>{formatDate(report.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{report.depth} Depth</span>
              {report.elapsedSeconds && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{report.elapsedSeconds}s execution time</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {report.query}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              onClick={onExportMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download</span>
            </button>

            <button
              onClick={onExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-left">
          <div>
            <div className="text-xs text-slate-500">Grounded Sources</div>
            <div className="text-lg font-semibold text-slate-900">{report.sources.length} Verified</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Audited Claims</div>
            <div className="text-lg font-semibold text-slate-900">
              {report.claims.filter((c) => c.status === 'VERIFIED').length} / {report.claims.length} Verified
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Overall Rubric Score</div>
            <div className="text-lg font-semibold text-indigo-700">
              {report.evaluation.overallScore} / 10
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Hallucination Risk</div>
            <div className="text-lg font-semibold text-emerald-700">
              {report.evaluation.hallucinationRisk}
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Callout */}
      {report.executiveSummary && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm mb-2">
            <Bookmark className="w-4 h-4 text-indigo-600" />
            <span>Executive Summary & Verdict</span>
          </div>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {report.executiveSummary}
          </div>
        </div>
      )}

      {/* Main Markdown Body */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <article
          className="prose prose-slate max-w-none 
            prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h2:mt-8
            prose-h3:text-lg prose-h3:mt-6
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-ul:text-slate-700 prose-ol:text-slate-700
            prose-li:my-1
            prose-strong:text-slate-900 prose-strong:font-semibold
            prose-table:w-full prose-table:border-collapse prose-table:my-6
            prose-th:bg-slate-50 prose-th:p-2.5 prose-th:text-xs prose-th:font-semibold prose-th:text-slate-900 prose-th:border prose-th:border-slate-200
            prose-td:p-2.5 prose-td:text-xs prose-td:text-slate-700 prose-td:border prose-td:border-slate-200
            prose-code:text-indigo-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-xs
            prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-4 prose-pre:rounded-lg
            prose-a:text-indigo-600 prose-a:underline hover:prose-a:text-indigo-800"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>

      {/* Suggested Next Inquiries */}
      {report.evaluation.suggestedFollowUps && report.evaluation.suggestedFollowUps.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Suggested Follow-Up Inquiries
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {report.evaluation.suggestedFollowUps.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onAskFollowUp(q)}
                className="text-left p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs rounded-lg text-xs font-medium text-slate-800 hover:text-indigo-900 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
