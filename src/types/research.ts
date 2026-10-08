export type ResearchStageId =
  | 'query_understanding'
  | 'research_planning'
  | 'search_retrieval'
  | 'source_processing'
  | 'rag_indexing'
  | 'context_management'
  | 'deep_analysis'
  | 'claim_verification'
  | 'response_evaluation'
  | 'final_report';

export type ResearchDepth = 'brief' | 'comprehensive' | 'academic';

export interface ResearchPlan {
  domain: string;
  coreHypotheses: string[];
  subQuestions: string[];
  searchQueries: string[];
  evidenceCriteria: string[];
  targetDimensions: string[];
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  domain?: string;
  type: 'web' | 'document';
  relevanceScore?: number;
}

export interface GroundingMetadata {
  searchQueries: string[];
  webSources: ResearchSource[];
}

export interface ClaimVerificationItem {
  id: string;
  claim: string;
  status: 'VERIFIED' | 'LIKELY_TRUE' | 'INCONCLUSIVE' | 'DISPUTED';
  confidence: number; // 0 - 100
  evidenceQuote: string;
  sourceTitle: string;
  sourceUrl?: string;
  rationale: string;
}

export interface EvaluationDimension {
  name: string;
  score: number; // 1-10
  description: string;
  critique: string;
}

export interface ResponseEvaluation {
  overallScore: number; // 1-10
  dimensions: EvaluationDimension[];
  hallucinationRisk: 'Low' | 'Moderate' | 'High';
  keyStrengths: string[];
  limitations: string[];
  suggestedFollowUps: string[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  chunkCount: number;
  uploadedAt: string;
}

export interface ResearchReport {
  id: string;
  query: string;
  depth: ResearchDepth;
  createdAt: string;
  completedAt?: string;
  elapsedSeconds?: number;
  executiveSummary: string;
  markdownContent: string;
  plan: ResearchPlan;
  sources: ResearchSource[];
  claims: ClaimVerificationItem[];
  evaluation: ResponseEvaluation;
  uploadedDocsUsed: string[];
}

export interface StageProgress {
  stageId: ResearchStageId;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  detail?: string;
  logs: string[];
  startedAt?: number;
  completedAt?: number;
}

export interface FollowUpMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: { title: string; url?: string }[];
}
