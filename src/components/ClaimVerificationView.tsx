import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ExternalLink,
  Search,
} from 'lucide-react';
import { ClaimVerificationItem } from '../types/research';

interface ClaimVerificationViewProps {
  claims: ClaimVerificationItem[];
}

export const ClaimVerificationView: React.FC<ClaimVerificationViewProps> = ({ claims }) => {
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'LIKELY_TRUE' | 'INCONCLUSIVE' | 'DISPUTED'>('ALL');
  const [search, setSearch] = useState('');

  const filteredClaims = claims.filter((c) => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch =
      !search ||
      c.claim.toLowerCase().includes(search.toLowerCase()) ||
      c.evidenceQuote.toLowerCase().includes(search.toLowerCase()) ||
      c.sourceTitle.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const verifiedCount = claims.filter((c) => c.status === 'VERIFIED').length;
  const likelyCount = claims.filter((c) => c.status === 'LIKELY_TRUE').length;
  const inconclusiveCount = claims.filter((c) => c.status === 'INCONCLUSIVE').length;
  const disputedCount = claims.filter((c) => c.status === 'DISPUTED').length;

  return (
    <div className="space-y-6">
      {/* Top Audit Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Hallucination Audit & Empirical Verification</span>
            </div>
            <p className="text-xs text-slate-600">
              Every critical factual claim was isolated and cross-checked against live grounding sources and RAG evidence passages.
            </p>
          </div>

          {/* Verification Summary Stats */}
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500">Verified:</span>{' '}
              <span className="font-semibold text-emerald-700">{verifiedCount}</span>
            </div>
            <div>
              <span className="text-slate-500">Likely True:</span>{' '}
              <span className="font-semibold text-blue-700">{likelyCount}</span>
            </div>
            {inconclusiveCount > 0 && (
              <div>
                <span className="text-slate-500">Inconclusive:</span>{' '}
                <span className="font-semibold text-amber-700">{inconclusiveCount}</span>
              </div>
            )}
            {disputedCount > 0 && (
              <div>
                <span className="text-slate-500">Disputed:</span>{' '}
                <span className="font-semibold text-rose-700">{disputedCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          {/* Segmented Filter Buttons */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({claims.length})
            </button>
            <button
              onClick={() => setFilter('VERIFIED')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'VERIFIED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setFilter('LIKELY_TRUE')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'LIKELY_TRUE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Likely True ({likelyCount})
            </button>
            {inconclusiveCount > 0 && (
              <button
                onClick={() => setFilter('INCONCLUSIVE')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filter === 'INCONCLUSIVE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inconclusive ({inconclusiveCount})
              </button>
            )}
            {disputedCount > 0 && (
              <button
                onClick={() => setFilter('DISPUTED')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filter === 'DISPUTED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disputed ({disputedCount})
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search claims or citations..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            No claims matched your filter.
          </div>
        ) : (
          filteredClaims.map((item, idx) => {
            const isVerified = item.status === 'VERIFIED';
            const isLikely = item.status === 'LIKELY_TRUE';
            const isInconclusive = item.status === 'INCONCLUSIVE';
            const isDisputed = item.status === 'DISPUTED';

            return (
              <div
                key={item.id || idx}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs transition-shadow"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-xs font-mono font-semibold text-slate-400 mt-0.5">
                      #{idx + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                      {item.claim}
                    </h4>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {isVerified && (
                        <span className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified ({item.confidence}%)</span>
                        </span>
                      )}
                      {isLikely && (
                        <span className="flex items-center gap-1 text-blue-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Likely True ({item.confidence}%)</span>
                        </span>
                      )}
                      {isInconclusive && (
                        <span className="flex items-center gap-1 text-amber-700">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Inconclusive ({item.confidence}%)</span>
                        </span>
                      )}
                      {isDisputed && (
                        <span className="flex items-center gap-1 text-rose-700">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Disputed ({item.confidence}%)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence Quote */}
                {item.evidenceQuote && (
                  <div className="bg-slate-50 border-l-2 border-indigo-400 p-3 rounded-r-lg my-3">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Supporting Evidence Passage
                    </div>
                    <blockquote className="text-xs text-slate-700 italic leading-relaxed">
                      "{item.evidenceQuote}"
                    </blockquote>
                  </div>
                )}

                {/* Rationale & Source */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs border-t border-slate-100">
                  <div className="text-slate-600">
                    <span className="font-medium text-slate-700">Rationale: </span>
                    {item.rationale}
                  </div>

                  {item.sourceTitle && (
                    <div className="shrink-0 flex items-center gap-1 text-slate-500">
                      <span>Source:</span>
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline max-w-[200px] truncate"
                        >
                          <span className="truncate">{item.sourceTitle}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-700 font-medium">{item.sourceTitle}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
