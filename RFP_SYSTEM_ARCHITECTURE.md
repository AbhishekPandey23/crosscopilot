# RFP AI SaaS - Complete System Architecture

This document outlines the complete RFP processing system that was implemented.

## 🎯 System Flow

```
User Uploads RFP
    ↓
Next.js Upload Page → ORPC API → Prisma Database
    ↓
Inngest Background Job: Parse Document
    ↓
LangChain Document Loaders → Extract Questions
    ↓
Store Questions in Database
    ↓
Generate Embeddings (OpenAI) → Store in pgvector
    ↓
User Clicks "Generate Answer"
    ↓
RAG Service: Semantic Search → Find Relevant Chunks
    ↓
LangChain + GPT-4 → Generate Answer with Citations
    ↓
Store Answer → Display to User
```

## 📁 Project Structure

```
src/
├── server/
│   ├── api/
│   │   ├── index.ts                 # Main router combining all procedures
│   │   ├── middlewares/
│   │   │   └── auth.ts              # ✅ Already existed - Kinde auth middleware
│   │   ├── orpc.server.ts           # ORPC server client
│   │   └── routers/
│   │       └── rfps/
│   │           ├── index.ts         # RFP router exports
│   │           ├── createRfps.ts    # Create RFP + trigger Inngest
│   │           ├── getRfps.ts       # Get, List, Update, Delete RFP
│   │           └── questions.ts     # Question management + answer generation
│   │
│   ├── inngest/
│   │   ├── client.ts                # Inngest client with typed events
│   │   └── functions/
│   │       ├── index.ts             # Export all functions
│   │       ├── parse-rfp-document.ts    # Parse uploaded RFP
│   │       ├── generate-embeddings.ts   # Generate vector embeddings
│   │       └── generate-answer.ts       # Generate AI answers
│   │
│   ├── services/
│   │   ├── document-parser.ts       # PDF/DOCX/TXT parsing + chunking
│   │   ├── embedding-service.ts     # Store/search vectors in pgvector
│   │   └── rag-service.ts           # RAG answer generation with citations
│   │
│   └── db/
│       └── client.ts                # Prisma client
│
├── lib/
│   ├── openai.ts                    # OpenAI embeddings + chat model
│   └── orpc-client.ts               # ORPC React client hooks
│
└── features/
    └── rfps/
        └── components/
            ├── upload-rfp-modal.tsx     # Updated with real API calls
            └── rfp-detail-content.tsx   # Updated with answer generation

app/
├── api/
│   ├── rpc/[[...rest]]/route.ts    # ORPC API handler
│   ├── inngest/route.ts            # Inngest webhook handler
│   └── upload/route.ts             # File upload to Supabase
```

## 🔐 Authentication

**You already have `auth.ts`** in `src/server/api/middlewares/auth.ts`!

The existing implementation:
- Uses `@kinde-oss/kinde-auth-nextjs/server` for authentication
- Provides a `requireAuthMiddleware` that validates users
- Exports an `authed` procedure base for all authenticated routes

**No additional auth.ts file is needed.**

## 🔧 Key Components

### 1. Inngest Background Jobs

Three functions handle the processing pipeline:
- `parse-rfp-document`: Downloads, parses, and extracts questions
- `generate-embeddings`: Creates OpenAI embeddings for semantic search
- `generate-answer`: Generates AI answers using RAG

### 2. RAG Service

The RAG (Retrieval-Augmented Generation) service:
- Uses `text-embedding-3-small` for 1536-dimension embeddings
- Performs semantic search using pgvector's `<=>` operator
- Generates answers with `gpt-4-turbo-preview`
- Includes source citations with similarity scores

### 3. Document Parser

Supports:
- PDF files (using `pdf-parse`)
- DOCX files (using `mammoth`)
- TXT files (native fs)

Extracts questions using pattern matching for:
- Lines ending with `?`
- Numbered items with question-like content
- Section requirements

### 4. API Routes

| Procedure | Description |
|-----------|-------------|
| `rfps.create` | Create RFP + trigger processing |
| `rfps.get` | Get RFP with all questions |
| `rfps.list` | List RFPs with filtering |
| `rfps.update` | Update RFP details |
| `rfps.delete` | Delete RFP |
| `rfps.questions.list` | List questions for RFP |
| `rfps.questions.generateAnswer` | Generate AI answer |
| `rfps.questions.generateAll` | Generate all pending answers |
| `rfps.questions.regenerate` | Regenerate with feedback |
| `rfps.questions.update` | Manual edit |
| `rfps.questions.approve` | Approve answer |

## 🚀 Getting Started

### 1. Install Dependencies

Already installed via pnpm:
```bash
pnpm install langchain @langchain/openai @langchain/core @langchain/community @langchain/textsplitters pdf-parse cheerio axios @orpc/react
```

### 2. Environment Variables

See `ENV_TEMPLATE.md` for required variables:
- `DATABASE_URL` / `DIRECT_URL` - PostgreSQL connection
- `OPENAI_API_KEY` - For embeddings and chat
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` - File storage
- `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` - Background jobs
- Kinde auth variables (already configured)

### 3. Database Setup

Run pgvector extension in your database:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

Then push schema:
```bash
npx prisma db push
npx prisma generate
```

### 4. Run Inngest Dev Server

For local development:
```bash
npx inngest-cli@latest dev
```

### 5. Start Development Server

```bash
pnpm run dev
```

## 📝 Usage Flow

1. **Upload RFP**: Use the upload modal on `/dashboard/rfps`
2. **Processing**: Inngest automatically parses and extracts questions
3. **View Questions**: Click on the RFP to see extracted questions
4. **Generate Answers**: Click "Generate Answer" or "Generate All Pending"
5. **Edit/Review**: Edit, regenerate with feedback, or approve answers
6. **Export**: Export completed answers for submission

## 🎨 UI Features

The updated components include:
- Drag-and-drop file upload
- Processing progress indicators
- Tone and length customization for answers
- Confidence scores with progress bars
- Source citations display
- Edit/regenerate/approve workflow
- Real-time status updates

## ⚡ Performance Considerations

- Inngest concurrency limits prevent OpenAI rate limiting
- Embeddings processed in batches of 10
- Document chunks sized at 1000 chars with 200 overlap
- pgvector IVFFlat index for fast similarity search
