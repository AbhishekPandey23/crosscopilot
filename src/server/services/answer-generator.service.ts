// server/services/answer-generator.service.ts
import { ChatOpenAI } from '@langchain/openai';
import { RAGService, RelevantChunk } from './rag.service';
import { PromptTemplate } from '@langchain/core/prompts';

export interface GeneratedAnswer {
  answer: string;
  sources: Array<{
    documentId: string;
    documentTitle: string;
    sourceType: string;
    excerpt: string;
  }>;
  confidence: number;
}

export class AnswerGeneratorService {
  private model: ChatOpenAI;
  private ragService: RAGService;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    this.ragService = new RAGService();
  }

  async generateAnswer(
    question: string,
    organizationId: string,
    options: {
      toneStyle?: string;
      targetLength?: string;
      clientIndustry?: string;
    } = {},
  ): Promise<GeneratedAnswer> {
    const {
      toneStyle = 'professional',
      targetLength = 'medium',
      clientIndustry,
    } = options;

    // Step 1: Find relevant content
    const relevantChunks = await this.ragService.findRelevantChunks(
      question,
      organizationId,
      { limit: 15, similarityThreshold: 0.65 },
    );

    if (relevantChunks.length === 0) {
      return {
        answer:
          'No relevant information found in knowledge base. Please add relevant content or answer manually.',
        sources: [],
        confidence: 0,
      };
    }

    // Step 2: Rerank for better relevance
    const rerankedChunks = await this.ragService.rerankChunks(
      question,
      relevantChunks,
    );
    const topChunks = rerankedChunks.slice(0, 8);

    // Step 3: Build context from chunks
    const context = topChunks
      .map(
        (chunk, i) =>
          `[Source ${i + 1}: ${chunk.documentTitle}]\n${chunk.content}`,
      )
      .join('\n\n');

    // Step 4: Generate answer using LLM
    const prompt = this.buildPrompt(
      question,
      context,
      toneStyle,
      targetLength,
      clientIndustry,
    );
    const response = await this.model.invoke(prompt);
    const answer = response.content as string;

    // Step 5: Calculate confidence based on similarity scores
    const avgSimilarity =
      topChunks.reduce((sum, chunk) => sum + chunk.similarity, 0) /
      topChunks.length;
    const confidence = Math.min(avgSimilarity * 1.2, 1); // Boost slightly but cap at 1

    // Step 6: Format sources
    const sources = topChunks.slice(0, 5).map((chunk) => ({
      documentId: chunk.documentId,
      documentTitle: chunk.documentTitle,
      sourceType: chunk.sourceType,
      excerpt: chunk.content.substring(0, 200) + '...',
    }));

    return {
      answer,
      sources,
      confidence,
    };
  }

  private buildPrompt(
    question: string,
    context: string,
    toneStyle: string,
    targetLength: string,
    clientIndustry?: string,
  ): string {
    const toneInstructions =
      {
        professional:
          'Use a professional, formal tone appropriate for business proposals.',
        casual:
          'Use a friendly, conversational tone while remaining professional.',
        technical:
          'Use technical language and industry terminology appropriate for expert audiences.',
        corporate:
          'Use corporate language with emphasis on business value and ROI.',
      }[toneStyle] || 'Use a professional tone.';

    const lengthInstructions =
      {
        concise:
          'Keep the answer brief and to the point (2-3 paragraphs maximum).',
        medium:
          'Provide a balanced answer with sufficient detail (3-5 paragraphs).',
        comprehensive:
          'Provide a thorough, detailed answer covering all aspects (5+ paragraphs).',
      }[targetLength] || 'Provide a balanced answer.';

    const industryContext =
      clientIndustry ?
        `The client is in the ${clientIndustry} industry. Tailor your language and examples accordingly.`
      : '';

    return `You are an expert RFP response writer helping to create winning proposals.

CONTEXT FROM KNOWLEDGE BASE:
${context}

QUESTION TO ANSWER:
${question}

INSTRUCTIONS:
- Answer the question comprehensively using ONLY the information from the provided context
- ${toneInstructions}
- ${lengthInstructions}
- ${industryContext}
- Structure your answer with clear paragraphs
- Use specific examples and data from the context when available
- If the context doesn't contain enough information to fully answer the question, acknowledge this and provide what information is available
- Do not make up information - only use what's provided in the context
- Include specific details, metrics, and examples where possible
- Make the answer compelling and persuasive

ANSWER:`;
  }
}
