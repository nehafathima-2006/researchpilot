# ResearchPilot – AI Research & Analysis Agent

ResearchPilot is an autonomous research and technical analysis agent powered by the **Google Gemini API** (`gemini-3.8-flash` and `gemini-embedding-2-preview`). It executes a structured, multi-stage investigation pipeline that mimics the workflow of senior technical research analysts.

---

## 🚀 Autonomous Multi-Stage Pipeline

ResearchPilot does not generate quick, hallucinated summaries. It executes a rigorous, deterministic multi-step research workflow:

```
User Question
      ↓
01. Query Understanding & Intent Decomposition
      ↓
02. Strategic Research Planning & Hypothesis Generation
      ↓
03. Search & Grounding Retrieval (Google Search)
      ↓
04. Source Processing & Entity Extraction
      ↓
05. Vector RAG Semantic Indexing & Evidence Matching
      ↓
06. Context Engineering & Deduplication
      ↓
07. Deep Analytical Synthesis & Comparative Reasoning
      ↓
08. Claim Verification & Hallucination Audit
      ↓
09. Response Quality & Rubric Evaluation (G-Eval)
      ↓
10. Publication-Grade Final Report Assembly
```

---

## ⚡ Core Features

- **Google Search Grounding**: Leverages live Google Search through Gemini 3.8 Flash to retrieve authoritative web documents, eliminating stale training cutoffs.
- **RAG & Vector Semantic Storage**: Chunks and indexes custom reference documents (RFCs, whitepapers, benchmarks, specifications) using `gemini-embedding-2-preview` with vector similarity search.
- **Claim Verification**: Automatically isolates key empirical and factual assertions from the report and audits them against retrieved evidence (`VERIFIED`, `LIKELY_TRUE`, `INCONCLUSIVE`, `DISPUTED`) with confidence scoring.
- **G-Eval Rubric Scoring**: Peer-reviews the final report across 5 dimensions:
  1. *Depth & Technical Rigor*
  2. *Factual Grounding & Evidence Strength*
  3. *Objectivity & Balance*
  4. *Logical Coherence & Structure*
  5. *Actionability & Practical Decision Utility*
- **Interactive Follow-Up Q&A**: Context-aware drawer allowing users to interrogate the research report further with questions grounded in verified sources.
- **Reference Document Manager**: Upload `.txt`, `.md`, `.json`, `.csv`, or code files or paste technical documentation to enrich the vector RAG index.
- **Export Capabilities**: One-click download as clean GitHub-flavored Markdown (`.md`) or structured JSON evidence bundle (`.json`).
- **Research History**: Automatically persists completed investigations to local storage for instant review.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js & Express with `@google/genai` TypeScript SDK
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **AI Models**:
  - Primary LLM: `gemini-3.8-flash` (Search Grounding & Structured Outputs)
  - Semantic Embeddings: `gemini-embedding-2-preview`
- **Streaming**: Server-Sent Events (SSE) for real-time stage telemetry and progress updates

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on v22)
- A Google Gemini API key (automatically injected in Google AI Studio)

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file (copied from `.env.example`):
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Running the Development Server
```bash
npm run dev
```
The application will be running at [http://localhost:3000](http://localhost:3000).

### 5. Building for Production
```bash
npm run build
npm start
```

---

## 📄 License
Apache-2.0
