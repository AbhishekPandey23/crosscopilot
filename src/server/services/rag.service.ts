// server/services/rag.service.ts
import { OpenAIEmbeddings } from '@langchain/openai';
import prisma from '@/server/db/client';
import { Prisma } from '@prisma/client';

export interface RelevantChunk {
  content: string;
  documentId: string;
  documentTitle: string;
  sourceType: string;
  similarity: number;
  metadata?: any;
}

export class RAGService {
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async findRelevantChunks(
    query: string,
    organizationId: string,
    options: {
      limit?: number;
      similarityThreshold?: number;
      sourceTypes?: string[];
    } = {},
  ): Promise<RelevantChunk[]> {
    const { limit = 10, similarityThreshold = 0.7, sourceTypes } = options;

    // Generate embedding for query
    const queryEmbedding = await this.embeddings.embedQuery(query);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // Build WHERE clause for source types
    const sourceTypeFilter =
      sourceTypes && sourceTypes.length > 0 ?
        Prisma.sql`AND s.type = ANY(${sourceTypes})`
      : Prisma.empty;

    // Perform similarity search using pgvector
    const chunks = await prisma.$queryRaw<
      Array<{
        chunk_id: string;
        content: string;
        document_id: string;
        document_title: string;
        source_type: string;
        source_name: string;
        similarity: number;
      }>
    >`
      SELECT 
        c.id as chunk_id,
        c.content,
        d.id as document_id,
        d.title as document_title,
        s.type as source_type,
        s.name as source_name,
        1 - (c.embedding <=> ${embeddingString}::vector) as similarity
      FROM document_chunks c
      JOIN documents d ON c.document_id = d.id
      JOIN knowledge_sources s ON d.source_id = s.id
      WHERE s.organization_id = ${organizationId}
        AND s.is_active = true
        AND d.freshness_status != 'ARCHIVED'
        ${sourceTypeFilter}
        AND 1 - (c.embedding <=> ${embeddingString}::vector) > ${similarityThreshold}
      ORDER BY c.embedding <=> ${embeddingString}::vector
      LIMIT ${limit}
    `;

    return chunks.map((chunk) => ({
      content: chunk.content,
      documentId: chunk.document_id,
      documentTitle: chunk.document_title,
      sourceType: chunk.source_type,
      similarity: chunk.similarity,
      metadata: {
        sourceName: chunk.source_name,
      },
    }));
  }

  async rerankChunks(
    query: string,
    chunks: RelevantChunk[],
  ): Promise<RelevantChunk[]> {
    // Simple reranking based on keyword matching
    // In production, you might want to use a reranking model like Cohere

    const queryTerms = query.toLowerCase().split(/\s+/);

    return chunks
      .map((chunk) => {
        const content = chunk.content.toLowerCase();
        const termMatches = queryTerms.filter((term) =>
          content.includes(term),
        ).length;
        const boostedSimilarity = chunk.similarity + termMatches * 0.01;

        return {
          ...chunk,
          similarity: Math.min(boostedSimilarity, 1),
        };
      })
      .sort((a, b) => b.similarity - a.similarity);
  }
}
