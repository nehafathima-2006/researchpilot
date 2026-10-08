import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ShieldCheck,
  Award,
  Globe,
  Compass,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { Header } from './components/Header';
import { ResearchForm } from './components/ResearchForm';
import { WorkflowTracker } from './components/WorkflowTracker';
import { ReportViewer } from './components/ReportViewer';
import { ClaimVerificationView } from './components/ClaimVerificationView';
import { EvaluationRadar } from './components/EvaluationRadar';
import { SourcesPanel } from './components/SourcesPanel';
import { PlanInspector } from './components/PlanInspector';
import { FollowUpChat } from './components/FollowUpChat';
import { DocumentManagerModal } from './components/DocumentManagerModal';
import { ResearchHistoryDrawer } from './components/ResearchHistoryDrawer';
import {
  ResearchReport,
  ResearchDepth,
  ResearchStageId,
  StageProgress,
  UploadedDocument,
} from './types/research';

const INITIAL_STAGES: Record<ResearchStageId, StageProgress> = {
  query_understanding: {
    stageId: 'query_understanding',
    label: 'Query Understanding',
    status: 'pending',
    logs: [],
  },
  research_planning: {
    stageId: 'research_planning',
    label: 'Strategic Planning',
    status: 'pending',
    logs: [],
  },
  search_retrieval: {
    stageId: 'search_retrieval',
    label: 'Search & Grounding',
    status: 'pending',
    logs: [],
  },
  source_processing: {
    stageId: 'source_processing',
    label: 'Source Processing',
    status: 'pending',
    logs: [],
  },
  rag_indexing: {
    stageId: 'rag_indexing',
    label: 'Vector RAG Indexing',
    status: 'pending',
    logs: [],
  },
  context_management: {
    stageId: 'context_management',
    label: 'Context Engineering',
    status: 'pending',
    logs: [],
  },
  deep_analysis: {
    stageId: 'deep_analysis',
    label: 'Deep Analytical Synthesis',
    status: 'pending',
    logs: [],
  },
  claim_verification: {
    stageId: 'claim_verification',
    label: 'Claim Verification',
    status: 'pending',
    logs: [],
  },
  response_evaluation: {
    stageId: 'response_evaluation',
    label: 'Response Evaluation',
    status: 'pending',
    logs: [],
  },
  final_report: {
    stageId: 'final_report',
    label: 'Final Report Assembly',
    status: 'pending',
    logs: [],
  },
};

type WorkspaceTab = 'report' | 'claims' | 'evaluation' | 'sources' | 'plan';

export default function App() {
  const [currentReport, setCurrentReport] = useState<ResearchReport | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [currentStageId, setCurrentStageId] = useState<ResearchStageId | null>(null);
  const [stages, setStages] = useState<Record<ResearchStageId, StageProgress>>(INITIAL_STAGES);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('report');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reference Documents for RAG
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  // History & Drawer States
  const [history, setHistory] = useState<ResearchReport[]>([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [pendingFollowUpQuestion, setPendingFollowUpQuestion] = useState<string | undefined>();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('researchpilot_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save history on changes
  const saveToHistory = (newReport: ResearchReport) => {
    setHistory((prev) => {
      const updated = [newReport, ...prev.filter((item) => item.id !== newReport.id)].slice(0, 30);
      try {
        localStorage.setItem('researchpilot_history', JSON.stringify(updated));
      } catch {
        // storage quota fallback
      }
      return updated;
    });
  };

  const startTimer = () => {
    setElapsedSeconds(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - start) / 100) / 10);
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleLaunchResearch = async (query: string, depth: ResearchDepth) => {
    setIsResearching(true);
    setErrorMessage(null);
    setCurrentReport(null);
    setStages(INITIAL_STAGES);
    setCurrentStageId('query_understanding');
    startTimer();

    try {
      // Use SSE streaming endpoint
      const response = await fetch('/api/research/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          depth,
          uploadedDocuments: uploadedDocs.map((d) => ({
            id: d.id,
            name: d.name,
            content: d.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Streaming response body unavailable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const rawEvent of events) {
          if (!rawEvent.trim()) continue;

          let eventName = 'message';
          let dataStr = '';

          const lines = rawEvent.split('\n');
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventName = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6).trim();
            }
          }

          if (eventName === 'progress' && dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.stage) {
                const stage: StageProgress = parsed.stage;
                setCurrentStageId(stage.stageId);
                setStages((prev) => ({
                  ...prev,
                  [stage.stageId]: {
                    ...prev[stage.stageId],
                    ...stage,
                    logs: [...(prev[stage.stageId]?.logs || []), ...(stage.logs || [])],
                  },
                }));
              }
            } catch (err) {
              console.warn('SSE parse error:', err);
            }
          } else if (eventName === 'complete' && dataStr) {
            try {
              const completedReport: ResearchReport = JSON.parse(dataStr);
              setCurrentReport(completedReport);
              saveToHistory(completedReport);
              setActiveTab('report');
            } catch (err) {
              console.error('SSE complete parse error:', err);
            }
          } else if (eventName === 'error' && dataStr) {
            try {
              const errPayload = JSON.parse(dataStr);
              setErrorMessage(errPayload.message || 'Error executing research workflow');
            } catch {
              setErrorMessage('An error occurred during workflow execution');
            }
          }
        }
      }
    } catch (streamErr) {
      console.warn('SSE streaming encountered an issue, trying fallback endpoint...', streamErr);
      // Fallback to standard POST
      try {
        const fallbackRes = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            depth,
            uploadedDocuments: uploadedDocs.map((d) => ({
              id: d.id,
              name: d.name,
              content: d.content,
            })),
          }),
        });

        if (!fallbackRes.ok) {
          throw new Error(`Fallback HTTP ${fallbackRes.status}`);
        }

        const data: ResearchReport = await fallbackRes.json();
        setCurrentReport(data);
        saveToHistory(data);
        setActiveTab('report');
      } catch (fbErr) {
        setErrorMessage((fbErr as Error)?.message || 'Failed to complete research execution');
      }
    } finally {
      stopTimer();
      setIsResearching(false);
      setCurrentStageId(null);
    }
  };

  const handleExportMarkdown = () => {
    if (!currentReport) return;
    const blob = new Blob([currentReport.markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ResearchPilot_${currentReport.query.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!currentReport) return;
    const blob = new Blob([JSON.stringify(currentReport, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ResearchPilot_Evidence_${currentReport.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAskFollowUp = (q: string) => {
    setPendingFollowUpQuestion(q);
    setIsFollowUpOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <Header
        currentReport={currentReport}
        isResearching={isResearching}
        historyCount={history.length}
        uploadedDocsCount={uploadedDocs.length}
        onNewResearch={() => {
          setCurrentReport(null);
          setErrorMessage(null);
        }}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onOpenDocuments={() => setIsDocsModalOpen(true)}
        onExportMarkdown={handleExportMarkdown}
        onExportJson={handleExportJson}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-0.5">Research Execution Notice</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        {/* State 1: No active report & not researching -> Show Input Hero */}
        {!currentReport && !isResearching && (
          <ResearchForm
            onSubmit={handleLaunchResearch}
            isResearching={isResearching}
            uploadedDocs={uploadedDocs}
            onOpenDocumentsModal={() => setIsDocsModalOpen(true)}
          />
        )}

        {/* State 2: Research in progress */}
        {isResearching && (
          <div className="max-w-4xl mx-auto py-6">
            <WorkflowTracker
              stages={stages}
              currentStageId={currentStageId}
              elapsedSeconds={elapsedSeconds}
              isComplete={false}
            />
          </div>
        )}

        {/* State 3: Report ready */}
        {currentReport && !isResearching && (
          <div className="space-y-6">
            {/* Top Workspace Navigation Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'report'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Research Report</span>
                </button>

                <button
                  onClick={() => setActiveTab('claims')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'claims'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    Claim Verification ({currentReport.claims.length})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('evaluation')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'evaluation'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>
                    Rubric Evaluation ({currentReport.evaluation.overallScore}/10)
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('sources')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'sources'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>
                    Evidence & Sources ({currentReport.sources.length})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('plan')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'plan'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Plan & Hypotheses</span>
                </button>
              </div>

              {/* Follow-up Drawer Trigger */}
              <button
                onClick={() => setIsFollowUpOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-lg transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Follow-Up</span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'report' && (
              <ReportViewer
                report={currentReport}
                onExportMarkdown={handleExportMarkdown}
                onExportJson={handleExportJson}
                onAskFollowUp={handleAskFollowUp}
              />
            )}

            {activeTab === 'claims' && (
              <ClaimVerificationView claims={currentReport.claims} />
            )}

            {activeTab === 'evaluation' && (
              <EvaluationRadar
                evaluation={currentReport.evaluation}
                onAskFollowUp={handleAskFollowUp}
              />
            )}

            {activeTab === 'sources' && (
              <SourcesPanel
                sources={currentReport.sources}
                plan={currentReport.plan}
              />
            )}

            {activeTab === 'plan' && (
              <PlanInspector plan={currentReport.plan} />
            )}
          </div>
        )}
      </main>

      {/* Floating Follow-Up Q&A Assistant */}
      {currentReport && (
        <FollowUpChat
          report={currentReport}
          isOpen={isFollowUpOpen}
          onClose={() => {
            setIsFollowUpOpen(false);
            setPendingFollowUpQuestion(undefined);
          }}
          initialQuestion={pendingFollowUpQuestion}
        />
      )}

      {/* Reference Documents Modal */}
      <DocumentManagerModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        documents={uploadedDocs}
        onAddDocument={(doc) => setUploadedDocs((prev) => [...prev, doc])}
        onRemoveDocument={(id) =>
          setUploadedDocs((prev) => prev.filter((d) => d.id !== id))
        }
      />

      {/* Research History Drawer */}
      <ResearchHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        currentReportId={currentReport?.id || null}
        onSelectReport={(selected) => {
          setCurrentReport(selected);
          setActiveTab('report');
        }}
        onDeleteReport={(id) => {
          setHistory((prev) => {
            const next = prev.filter((h) => h.id !== id);
            localStorage.setItem('researchpilot_history', JSON.stringify(next));
            return next;
          });
          if (currentReport?.id === id) {
            setCurrentReport(null);
          }
        }}
        onClearHistory={() => {
          setHistory([]);
          localStorage.removeItem('researchpilot_history');
        }}
      />
    </div>
  );
}
