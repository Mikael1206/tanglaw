import { ChatOpenAI } from "@langchain/openai";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableWithMessageHistory, RunnablePassthrough } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { StringOutputParser } from "@langchain/core/output_parsers";
import path from "path";
import fs from "fs";

// ─── Module-level cache: load once per server instance ──────────────────────
let cachedVectorStore: MemoryVectorStore | null = null;
let cachedEmbeddings: HuggingFaceTransformersEmbeddings | null = null;

// ─── Session store: persists conversation history per session_id ─────────────
const sessionStore = new Map<string, InMemoryChatMessageHistory>();

function getSessionHistory(sessionId: string): InMemoryChatMessageHistory {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, new InMemoryChatMessageHistory());
  }
  return sessionStore.get(sessionId)!;
}

// ─── Load pre-computed MemoryVectorStore from JSON (no native modules) ────────
async function getVectorStore(): Promise<MemoryVectorStore> {
  if (cachedVectorStore) return cachedVectorStore;

  const storePath = path.join(process.cwd(), "data", "vector_store.json");
  if (!fs.existsSync(storePath)) {
    throw new Error(
      "vector_store.json not found in data/. Run: npx tsx scripts/ingest-memory.ts"
    );
  }

  // Re-use or create the embeddings model (needed only for query-time embedding)
  if (!cachedEmbeddings) {
    cachedEmbeddings = new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2",
    });
  }

  // Load pre-computed vectors from JSON → reconstruct MemoryVectorStore in-place
  const raw = fs.readFileSync(storePath, "utf-8");
  const precomputedVectors = JSON.parse(raw) as Array<{
    content: string;
    embedding: number[];
    metadata: Record<string, unknown>;
  }>;

  // Build store with the embeddings model (used only for query embedding at search time)
  const store = new MemoryVectorStore(cachedEmbeddings);

  // Inject pre-computed document vectors directly — no re-embedding of documents
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (store as any).memoryVectors = precomputedVectors;

  cachedVectorStore = store;
  console.log(
    `[Owel RAG] Loaded ${precomputedVectors.length} pre-computed vectors from vector_store.json`
  );

  return store;
}

export async function generateChatResponse(question: string, sessionId: string) {
  // ── 1. Load vector store (cached after first request) ─────────────────────
  const vectorStore = await getVectorStore();
  const retriever = vectorStore.asRetriever(4); // retrieve top-4 most relevant chunks

  // ── 2. Initialize LLM (OpenRouter – free owl-alpha model) ─────────────────
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("No OPENROUTER_API_KEY or OPENAI_API_KEY found in environment variables.");
  }

  // ── 3. Query Condensation Prompt ─────────────────────────────────────────
  const condensePrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder("chat_history"),
    [
      "human",
      `Given the conversation above, rephrase the following follow-up question into a single, standalone search query in English suitable for retrieving scholarship documents. 
Output ONLY the search query — do NOT answer the question or add any explanation.
If the question is already standalone (no prior context needed), return it unchanged.

Follow-up question: {question}`,
    ],
  ]);

  // ── 4. Main System Prompt ─────────────────────────────────────────────────
  const answerPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are **Owel** 🦉, the intelligent scholarship navigation assistant for TANGLAW — a platform helping Filipino tertiary students find scholarships at Polytechnic University of the Philippines (PUP Manila).

You MUST follow ALL directives below without exception:

---

## DIRECTIVE 1: ANTI-HALLUCINATION (Highest Priority)
- Your answers must be grounded **exclusively** in the Scholarship Context provided below.
- If the answer is not in the context, respond: "Hoot! I don't have that specific information in my scholarship database yet. Please check with the PUP Office of Student Financial Assistance (OSFA) or the scholarship's official page for the most up-to-date details."
- NEVER invent GWA thresholds, income limits, deadlines, or requirements that are not explicitly stated in the context.
- If a field (e.g., deadline) is not mentioned, say "Not specified in the database."

---

## DIRECTIVE 2: SCHOLARSHIP MATCHMAKING (Profile-Based)
When the student provides profile information (year level, program/course, GWA/grades, or family income), perform a structured match:

**Step-by-step reasoning:**
1. Parse the student's profile: Year Level, Program, GWA (on 5.0 scale where 1.0 is highest, or percentage), Family Income.
2. Review each scholarship's eligibility: minimum GWA, priority programs, income cap, year level requirement, public/private university status.
3. For each scholarship in the context, decide: QUALIFY ✅ or DOES NOT QUALIFY ❌ — explain briefly why.
4. Present ONLY the qualifying scholarships in a clean, organized list.
5. For each match, cite the specific eligibility rule that was satisfied (e.g., "Your GWA of 1.75 meets the minimum of 2.00").

**Note on GWA:** PUP uses a 5.0 scale (1.0 = best). Some scholarships use percentages (85% = GWA 2.00 approximately). Clarify when needed.

---

## DIRECTIVE 3: DETAILED SCHOLARSHIP Q&A
For questions about specific scholarships (requirements, benefits, deadlines, etc.):
- Use **bold** headings and organized bullet points.
- Structure answers with clear sections: **Overview**, **Coverage/Benefits**, **Eligibility**, **Requirements**, **Exam/Process**, **Deadline**, **More Info**.
- When return-of-service (ROS) applies, highlight it prominently with a note about its importance.
- Include the application URL if present in the context.

---

## DIRECTIVE 4: TONE & PERSONALITY
- Be warm, encouraging, and professional — like a knowledgeable kuya/ate helping a classmate.
- Use friendly Filipino-student-appropriate language (occasional "Hoot!", encouragement).
- Keep responses concise but complete. Avoid unnecessary filler.
- Use markdown formatting (bold, bullets, headers) for readability in the chat UI.

---

## Scholarship Context (Retrieved from Knowledge Base):
{context}`,
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
  ]);

  // ── 5. Run with Multiple Fallback Models ──────────────────────────────────
  const MODELS = [
    "nvidia/nemotron-3-super-120b-a12b:free",
    "openai/gpt-oss-120b:free",
    "openrouter/owl-alpha",
    "meta-llama/llama-3-8b-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "google/gemma-2-9b-it:free",
  ];

  let lastError: unknown = null;

  for (const modelName of MODELS) {
    try {
      console.log(`[Owel RAG] Attempting generation with model: ${modelName}`);

      const model = new ChatOpenAI({
        modelName,
        apiKey,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
        temperature: 0.2,
      });

      const condenseChain = condensePrompt
        .pipe(model)
        .pipe(new StringOutputParser());

      const ragChain = RunnablePassthrough.assign({
        context: async (input: {
          question: string;
          chat_history?: any[];
        }) => {
          let searchQuery = input.question;

          if (input.chat_history && input.chat_history.length > 0) {
            try {
              const condensed = await condenseChain.invoke({
                question: input.question,
                chat_history: input.chat_history,
              });
              if (condensed?.trim()) {
                searchQuery = condensed.trim();
                console.log(`[Owel RAG] Original: "${input.question}" → Condensed: "${searchQuery}"`);
              }
            } catch (err) {
              console.warn(`[Owel RAG] [${modelName}] Condensation failed, using raw question:`, err);
            }
          }

          const docs = await retriever.invoke(searchQuery);
          return docs.map((d) => d.pageContent).join("\n\n---\n\n");
        },
      })
        .pipe(answerPrompt)
        .pipe(model)
        .pipe(new StringOutputParser());

      const chainWithHistory = new RunnableWithMessageHistory({
        runnable: ragChain,
        getMessageHistory: getSessionHistory,
        inputMessagesKey: "question",
        historyMessagesKey: "chat_history",
      });

      const answer = await chainWithHistory.invoke(
        { question },
        { configurable: { sessionId } }
      );

      if (answer) {
        console.log(`[Owel RAG] Successfully generated response using model: ${modelName}`);
        return answer;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Owel RAG] Model ${modelName} failed: ${errMsg}`);
      lastError = err;
    }
  }

  throw lastError || new Error("All fallback models failed to generate a response.");
}
