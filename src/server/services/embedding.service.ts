import { OpenAIEmbeddings } from '@langchain/openai';
import prisma from '@/server/db/client';
import { Document } from '@langchain/core/documents';

export class EmbeddingService {
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const embedding = await this.embeddings.embedQuery(text);
    return embedding;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await this.embeddings.embedDocuments(texts);
    return embeddings;
  }

  async storeDocumentChunks(
    documentId: string,
    chunks: Document[],
  ): Promise<void> {
    // Generate embeddings for all chunks
    const texts = chunks.map((chunk) => chunk.pageContent);
    const embeddings = await this.generateEmbeddings(texts);

    // Store chunks with embeddings in database
    const chunkData = chunks.map((chunk, index) => ({
      documentId,
      content: chunk.pageContent,
      chunkIndex: index,
      tokenCount: this.estimateTokenCount(chunk.pageContent),
      embedding: `[${embeddings[index].join(',')}]`, // pgvector format
    }));

    // Batch insert chunks
    await prisma.$executeRaw`
      INSERT INTO document_chunks (id, document_id, content, chunk_index, token_count, embedding, created_at)
      SELECT 
        gen_random_uuid(),
        ${documentId}::text,
        data.content,
        data.chunk_index,
        data.token_count,
        data.embedding::vector(1536),
        NOW()
      FROM jsonb_to_recordset(${JSON.stringify(chunkData)}::jsonb) 
      AS data(content text, chunk_index int, token_count int, embedding text)
    `;
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}
