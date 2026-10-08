import React, { useState } from 'react';
import { Search, ArrowRight, BookOpen, Layers, ShieldCheck, Sparkles, FileText } from 'lucide-react';
import { ResearchDepth, UploadedDocument } from '../types/research';

interface ResearchFormProps {
  onSubmit: (query: string, depth: ResearchDepth) => void;
  isResearching: boolean;
  uploadedDocs: UploadedDocument[];
  onOpenDocumentsModal: () => void;
}

const PRESET_QUERIES = [
  {
    category: 'Enterprise Engineering',
    query: 'Compare React and Angular for large enterprise applications.',
    description: 'Architecture, state patterns, team scale, and long-term maintenance',
  },
  {
    category: 'AI Architecture',
    query: 'Compare DeepSeek R1 and OpenAI o1 reasoning architectures and inference economics.',
    description: 'Reinforcement learning, chain-of-thought distillation, and compute costs',
  },
  {
    category: 'Clean Energy & Tech',
    query: 'Solid-state batteries vs lithium-ion for commercial EV adoption 2026-2030.',
    description: 'Energy density, thermal stability, manufacturing yields, and automotive timelines',
  },
  {
    category: 'Data Infrastructure',
    query: 'PostgreSQL vs ClickHouse for real-time multi-tenant analytics at 10B+ events.',
    description: 'Columnar compression, ingestion throughput, concurrency, and query latency',
  },
];

export const ResearchForm: React.FC<ResearchFormProps> = ({
  onSubmit,
  isResearching,
  uploadedDocs,
  onOpenDocumentsModal,
}) => {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<ResearchDepth>('comprehensive');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isResearching) return;
    onSubmit(query.trim(), depth);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Intro hero section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-700 bg-indigo-50/80 px-3 py-1 rounded-full mb-3 border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Full Autonomous Multi-Stage Research Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
          Deep Technical & Factual Research, Verified.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Formulates research plans, searches grounded sources via Gemini, indexes evidence into vector RAG, conducts claim verification, and executes rigorous peer-evaluation.
        </p>
      </div>

      {/* Main input card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 transition-shadow focus-within:shadow-md focus-within:border-slate-300"
      >
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isResearching}
            placeholder="What technical, scientific, or strategic topic would you like to investigate? (e.g. Compare React and Angular for enterprise applications)"
            rows={3}
            className="w-full text-slate-900 placeholder:text-slate-400 bg-transparent text-base sm:text-lg resize-none border-0 focus:outline-none focus:ring-0 p-0 leading-relaxed disabled:opacity-50"
          />
        </div>

        {/* Configuration Row */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Depth Segmented Control & Speed indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Depth:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setDepth('brief')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    depth === 'brief'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Brief
                </button>
                <button
                  type="button"
                  onClick={() => setDepth('comprehensive')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    depth === 'comprehensive'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Comprehensive
                </button>
                <button
                  type="button"
                  onClick={() => setDepth('academic')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    depth === 'academic'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Academic
                </button>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
              ⚡ Ultra-Fast (&lt;3s)
            </span>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {/* Uploaded documents pill */}
            <button
              type="button"
              onClick={onOpenDocumentsModal}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 hover:underline"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {uploadedDocs.length > 0
                  ? `${uploadedDocs.length} custom doc${uploadedDocs.length > 1 ? 's' : ''} attached`
                  : 'Attach custom docs (RAG)'}
              </span>
            </button>

            {/* Launch research button */}
            <button
              type="submit"
              disabled={!query.trim() || isResearching}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Launch Research</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Preset Topics */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Suggested Investigations
          </span>
          <span className="text-xs text-slate-500">Press Cmd/Ctrl + Enter to run</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(preset.query);
              }}
              className="text-left p-3.5 bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs rounded-xl transition-all group"
            >
              <div className="text-xs font-medium text-indigo-700 mb-1">
                {preset.category}
              </div>
              <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-900 leading-snug mb-1">
                {preset.query}
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Workflow highlights */}
      <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Search Grounding + RAG</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Retrieves live Google Search findings and vectorizes custom documents using Gemini embedding models for evidence-based context.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Claim Verification</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Extracts factual assertions and audits them against retrieved quotes to classify confidence and eliminate hallucinations.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-1.5">
            <Layers className="w-4 h-4 text-violet-600" />
            <span>Multi-Criteria Rubric</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluates the final synthesis on depth, grounding, objectivity, and actionability to ensure executive-ready output.
          </p>
        </div>
      </div>
    </div>
  );
};
