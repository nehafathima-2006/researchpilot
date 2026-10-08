import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { runResearchWorkflow, answerFollowUpQuestion } from './server/agentWorkflow.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();

  // Allow larger JSON payloads for document uploads (up to 50MB)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Download complete project ZIP for GitHub
  app.get('/api/download-zip', (_req: Request, res: Response) => {
    const zipPath = path.resolve(__dirname, 'researchpilot.zip');
    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="researchpilot.zip"');
      res.sendFile(zipPath);
    } else {
      res.status(404).json({ error: 'ZIP file not found.' });
    }
  });

  // Streaming SSE endpoint for real-time stage progress
  app.post('/api/research/stream', async (req: Request, res: Response) => {
    const { query, depth, uploadedDocuments } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required and must be a string.' });
      return;
    }

    // Configure SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendEvent('init', { query, depth: depth || 'comprehensive' });

      const report = await runResearchWorkflow({
        query,
        depth: depth || 'comprehensive',
        uploadedDocuments: uploadedDocuments || [],
        onProgress: (progressEvent) => {
          sendEvent('progress', progressEvent);
        },
      });

      sendEvent('complete', report);
      res.write('event: end\ndata: {}\n\n');
      res.end();
    } catch (err) {
      console.error('[API /research/stream] Workflow failure:', err);
      sendEvent('error', {
        message: (err as Error)?.message || 'An error occurred during research execution.',
      });
      res.end();
    }
  });

  // Non-streaming fallback endpoint
  app.post('/api/research', async (req: Request, res: Response) => {
    const { query, depth, uploadedDocuments } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required and must be a string.' });
      return;
    }

    try {
      const report = await runResearchWorkflow({
        query,
        depth: depth || 'comprehensive',
        uploadedDocuments: uploadedDocuments || [],
      });
      res.json(report);
    } catch (err) {
      console.error('[API /research] Error:', err);
      res.status(500).json({
        error: (err as Error)?.message || 'Internal research execution error.',
      });
    }
  });

  // Follow-up Q&A endpoint
  app.post('/api/follow-up', async (req: Request, res: Response) => {
    const { report, question, history } = req.body;

    if (!report || !question) {
      res.status(400).json({ error: 'Report and question are required.' });
      return;
    }

    try {
      const result = await answerFollowUpQuestion(report, question, history || []);
      res.json(result);
    } catch (err) {
      console.error('[API /follow-up] Error:', err);
      res.status(500).json({
        error: (err as Error)?.message || 'Failed to process follow-up question.',
      });
    }
  });

  // Document upload helper
  app.post('/api/upload-document', (req: Request, res: Response) => {
    const { name, content, type } = req.body;
    if (!name || !content) {
      res.status(400).json({ error: 'Document name and content are required.' });
      return;
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    res.json({
      id: docId,
      name,
      size: Buffer.byteLength(content, 'utf8'),
      type: type || 'text/plain',
      content,
      uploadedAt: new Date().toISOString(),
    });
  });

  // Dev vs Prod Vite Mounting
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      // Fallback if dist hasn't been built yet
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ResearchPilot Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ResearchPilot Server] Fatal startup error:', err);
});
