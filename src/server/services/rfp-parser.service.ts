import { Document } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const questionSchema = z.object({
  questions: z.array(
    z.object({
      questionText: z.string(),
      sectionName: z.string().optional(),
      questionNumber: z.string().optional(),
      context: z.string().optional(),
    }),
  ),
});

export class RFPParserService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async parseDocument(fileUrl: string, fileType: string): Promise<Document[]> {
    let loader;

    if (fileType.includes('pdf')) {
      loader = new PDFLoader(fileUrl);
    } else if (
      fileType.includes('wordprocessingml') ||
      fileType.includes('docx')
    ) {
      loader = new DocxLoader(fileUrl);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    const docs = await loader.load();
    return docs;
  }

  async extractQuestions(documents: Document[]): Promise<
    Array<{
      questionText: string;
      sectionName?: string;
      questionNumber?: string;
    }>
  > {
    const parser = StructuredOutputParser.fromZodSchema(questionSchema);

    // Combine all document content
    const fullText = documents.map((doc) => doc.pageContent).join('\n\n');

    const prompt = `
You are an expert at analyzing RFP (Request for Proposal) documents and extracting questions that need to be answered.

Extract ALL questions from the following RFP document. For each question:
- Extract the exact question text
- Identify the section name if available
- Identify the question number if available (e.g., "3.1", "Q1", etc.)

Important guidelines:
- Include ALL questions, requirements, and items that need responses
- Preserve the original question wording
- Look for patterns like: "Describe...", "Provide...", "Explain...", "List...", numbered lists, bullet points
- Include both explicit questions (with "?") and implicit questions (requests for information)
- Group related sub-questions if they're clearly part of a larger question

RFP Document:
${fullText}

${parser.getFormatInstructions()}
`;

    const response = await this.model.invoke(prompt);
    const parsed = await parser.parse(response.content as string);

    return parsed.questions;
  }

  async splitIntoChunks(documents: Document[]): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    const chunks = await splitter.splitDocuments(documents);
    return chunks;
  }
}
