import React, { useState } from 'react';
import { ExternalLink, Globe, FileText, Search } from 'lucide-react';
import { ResearchSource, ResearchPlan } from '../types/research';

interface SourcesPanelProps {
  sources: ResearchSource[];
  plan?: ResearchPlan;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ sources, plan }) => {
  const [filterType, setFilterType] = useState<'all' | 'web' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = sources.filter((s) => {
    const matchesType = filterType === 'all' || s.type === filterType;
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.domain && s.domain.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const webCount = sources.filter((s) => s.type === 'web').length;
  const docCount = sources.filter((s) => s.type === 'document').length;

  return (
    <div className="space-y-6">
      {/* Search Queries Used */}
      {plan?.searchQueries && plan.searchQueries.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            <Search className="w-3.5 h-3.5 text-indigo-600" />
            <span>Search Vectors Dispatched to Google Grounding</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.searchQueries.map((q, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-xs text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md font-mono"
              >
                "{q}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sources Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Evidence & Grounded Citations ({sources.length})
            </h3>
            <p className="text-xs text-slate-500">
              Authoritative web documents and user-provided reference texts indexed in vector RAG.
            </p>
          </div>

          {/* Type filters */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({sources.length})
            </button>
            <button
              onClick={() => setFilterType('web')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'web' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Web Grounding ({webCount})
            </button>
            {docCount > 0 && (
              <button
                onClick={() => setFilterType('document')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterType === 'document' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Custom Docs ({docCount})
              </button>
            )}
          </div>
        </div>

        {/* Search filter */}
        <div className="pt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter sources by title, keyword, or domain..."
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Sources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            No sources matched your filter.
          </div>
        ) : (
          filtered.map((s, idx) => (
            <div
              key={s.id || idx}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    {s.type === 'document' ? (
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{s.domain || (s.type === 'document' ? 'Attached Doc' : 'Web')}</span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    Source #{idx + 1}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-900 line-clamp-2 mb-2 leading-snug">
                  {s.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                  {s.snippet}
                </p>
              </div>

              {s.url && !s.url.startsWith('#') && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <span>Visit Grounded Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
