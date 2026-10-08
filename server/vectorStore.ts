import { ai, MODEL_EMBEDDING } from './geminiClient.js';

export interface VectorChunk {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceType: 'web' | 'document';
  text: string;
  embedding?: number[];
  relevanceScore?: number;
}

export class InMemoryVectorStore {
  private chunks: VectorChunk[] = [];

  constructor() {}

  public getChunkCount(): number {
    return this.chunks.length;
  }

  public clear(): void {
    this.chunks = [];
  }

  /**
   * Split long text into overlapping chunks
   */
  public chunkText(
    text: string,
    sourceId: string,
    sourceTitle: string,
    sourceType: 'web' | 'document',
    chunkSize = 600,
    overlap = 100
  ): VectorChunk[] {
    const cleaned = text.replace(/\r\n/g, '\n').trim();
    if (!cleaned) return [];

    const paragraphs = cleaned.split(/\n\s*\n/);
    const result: VectorChunk[] = [];
    let currentBlock = '';
    let chunkIndex = 0;

    for (const para of paragraphs) {
      if ((currentBlock + '\n\n' + para).length > chunkSize && currentBlock.length > 0) {
        result.push({
          id: `${sourceId}_chunk_${chunkIndex++}`,
          sourceId,
          sourceTitle,
          sourceType,
          text: currentBlock.trim(),
        });
        // Retain overlap from end of previous block
        currentBlock = currentBlock.slice(-overlap) + '\n\n' + para;
      } else {
        currentBlock = currentBlock ? currentBlock + '\n\n' + para : para;
      }
    }

    if (currentBlock.trim().length > 0) {
      result.push({
        id: `${sourceId}_chunk_${chunkIndex++}`,
        sourceId,
        sourceTitle,
        sourceType,
        text: currentBlock.trim(),
      });
    }

    return result;
  }

  /**
   * Embed chunks using gemini-embedding-2-preview
   */
  public async addChunks(chunks: VectorChunk[]): Promise<void> {
    if (!chunks.length) return;

    // Try batch embedding via gemini-embedding-2-preview in chunks of 5
    for (let i = 0; i < chunks.length; i += 5) {
      const slice = chunks.slice(i, i + 5);
      try {
        await Promise.all(
          slice.map(async (c) => {
            try {
              const res = await ai.models.embedContent({
                model: MODEL_EMBEDDING,
                contents: [c.text],
              });
              const values = res.embeddings?.[0]?.values;
              if (values && values.length > 0) {
                c.embedding = values;
              }
            } catch (err) {
              // Non-fatal: will use lexical fallback
              console.warn(`[VectorStore] Embedding chunk ${c.id} skipped, using fallback semantic index:`, (err as Error)?.message);
            }
          })
        );
      } catch (batchErr) {
        console.warn('[VectorStore] Batch embedding warning:', (batchErr as Error)?.message);
      }
    }

    this.chunks.push(...chunks);
  }

  /**
   * Search vector store for top-K most relevant chunks
   */
  public async search(query: string, topK = 6): Promise<VectorChunk[]> {
    if (this.chunks.length === 0) return [];

    let queryEmbedding: number[] | null = null;
    try {
      const res = await ai.models.embedContent({
        model: MODEL_EMBEDDING,
        contents: [query],
      });
      if (res.embeddings?.[0]?.values?.length) {
        queryEmbedding = res.embeddings[0].values;
      }
    } catch {
      // lexical fallback
    }

    const scored = this.chunks.map((chunk) => {
      let score = 0;
      if (queryEmbedding && chunk.embedding && chunk.embedding.length === queryEmbedding.length) {
        score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      } else {
        score = this.lexicalSimilarity(query, chunk.text);
      }
      return {
        ...chunk,
        relevanceScore: Math.round(score * 100) / 100,
      };
    });

    scored.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    return scored.slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  private lexicalSimilarity(query: string, text: string): number {
    const qWords = query.toLowerCase().match(/\b[a-z0-9_-]{3,}\b/g) || [];
    const tWords = new Set(text.toLowerCase().match(/\b[a-z0-9_-]{3,}\b/g) || []);
    if (qWords.length === 0 || tWords.size === 0) return 0.1;

    let hits = 0;
    for (const w of qWords) {
      if (tWords.has(w)) hits++;
    }
    return Math.min(1.0, hits / Math.max(qWords.length, 1));
  }
}
