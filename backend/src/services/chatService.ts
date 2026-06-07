import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableWithMessageHistory, RunnablePassthrough } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { searchScholarshipsAsContext } from "./scholarshipSearchService";

// ─── Session store: persists conversation history per session_id ─────────────
const sessionStore = new Map<string, InMemoryChatMessageHistory>();

function getSessionHistory(sessionId: string): InMemoryChatMessageHistory {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, new InMemoryChatMessageHistory());
  }
  return sessionStore.get(sessionId)!;
}

// ─── Shared prompts (used by both Gemini and OpenRouter paths) ───────────────

const condensePrompt = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder("chat_history"),
  [
    "human",
    `Given the conversation above, rephrase the following follow-up question into a single, standalone search query for finding scholarships. 
Output ONLY the search query — do NOT answer the question or add any explanation.
If the question is already standalone (no prior context needed), return it unchanged.

Follow-up question: {question}`,
  ],
]);

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

**⚠️ IMPORTANT — Year Level Wording:**
- Use the student's OWN words when describing their year level. If they say "I'm a 1st year BSCS student", write "You are a 1st year BSCS student" — do NOT add "incoming" or any other qualifier they did not use.
- "Incoming 1st year" means someone who has NOT started college yet (incoming freshmen). A student who says they ARE a 1st year student is currently enrolled — they are NOT incoming.
- If a scholarship's requirements say "Incoming 1st year" but the student is an existing 1st year, match them anyway (most scholarships accept both), but describe the student as a "1st year student" (not "incoming").

---

## CRITICAL: Philippine GWA ↔ Percentage Conversion

PUP and most Philippine universities use a **5.0 grading scale where 1.0 is the HIGHEST and 5.0 is the LOWEST (fail)**. This means a **LOWER number = BETTER grade**. Do NOT confuse this with other grading systems where higher numbers are better.

**Exact conversion table (use this for ALL GWA-to-percentage comparisons):**

| GWA (5.0 scale) | Percentage Equivalent |
|-----------------|----------------------|
| 1.00            | 96–100%              |
| 1.25            | 93–95%               |
| 1.50            | 90–92%               |
| 1.75            | 87–89%               |
| 2.00            | 84–86%               |
| 2.25            | 81–83%               |
| 2.50            | 78–80%               |
| 2.75            | 75–77%               |
| 3.00            | 75% (passing)        |
| 5.00            | Below 75% (fail)     |

**How to compare GWA vs. percentage requirements:**
- To check if a GWA on the 5.0 scale meets a percentage requirement, convert the GWA to its percentage range using the table above, then compare. For example:
  - GWA 1.38 → between 1.25 and 1.50 → ~91–94% → **MEETS a 90% requirement** ✅
  - GWA 1.75 → 87–89% → **does NOT meet a 90% requirement** ❌
  - GWA 2.50 → 78–80% → **does NOT meet an 85% requirement** ❌
- When comparing two GWA values on the 5.0 scale, the LOWER number is better. So GWA 1.50 BEATS GWA 2.00.
- **IMPORTANT:** If a student says their GWA is a number between 1.0 and 5.0 (like 1.38, 1.75, 2.25), assume it is on the 5.0 Philippine scale. A GWA of 1.38 is EXCELLENT and is well above 90% — do NOT treat it as a low number.

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

## Scholarship Context (Retrieved from Database):
{context}`,
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

/**
 * Build and invoke the RAG chain with a given LLM model.
 * Returns the generated answer string, or throws on failure.
 */
async function runRagChain(
  model: ChatOpenAI | ChatGoogleGenerativeAI,
  modelLabel: string,
  question: string,
  sessionId: string
): Promise<string> {
  const condenseChain = condensePrompt
    .pipe(model)
    .pipe(new StringOutputParser());

  const ragChain = RunnablePassthrough.assign({
    context: async (input: {
      question: string;
      chat_history?: BaseMessage[];
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
            console.log(`[Owel DB RAG] Original: "${input.question}" → Condensed: "${searchQuery}"`);
          }
        } catch (err) {
          console.warn(`[Owel DB RAG] [${modelLabel}] Condensation failed, using raw question:`, err);
        }
      }

      const context = await searchScholarshipsAsContext(searchQuery, 8);
      console.log(`[Owel DB RAG] Retrieved context for query: "${searchQuery}"`);
      return context;
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

  return chainWithHistory.invoke(
    { question },
    { configurable: { sessionId } }
  );
}

export async function generateChatResponse(question: string, sessionId: string) {
  // ── TIER 1: Google Gemini 3.1 Flash-Lite (free via GOOGLE_API_KEY) ────────
  const googleApiKey = process.env.GOOGLE_API_KEY;

  if (googleApiKey) {
    try {
      console.log("[Owel RAG] Attempting generation with Gemini 3.1 Flash-Lite (primary)");
      const geminiModel = new ChatGoogleGenerativeAI({
        model: "gemini-3.1-flash-lite",
        apiKey: googleApiKey,
      });

      const answer = await runRagChain(geminiModel, "gemini-3.1-flash-lite", question, sessionId);
      if (answer) {
        console.log("[Owel RAG] Successfully generated response using Gemini 3.1 Flash-Lite");
        return answer;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Owel RAG] Gemini 3.1 Flash-Lite failed: ${errMsg}`);
      console.warn("[Owel RAG] Falling back to OpenRouter free models...");
    }
  } else {
    console.warn("[Owel RAG] GOOGLE_API_KEY not set — skipping Gemini primary, using OpenRouter fallbacks");
  }

  // ── TIER 2: OpenRouter free model fallback chain ───────────────────────────
  const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!openRouterKey) {
    throw new Error("No GOOGLE_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY found in environment variables.");
  }

  const FALLBACK_MODELS = [
    "openrouter/owl-alpha",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "openai/gpt-oss-120b:free",
    "meta-llama/llama-3-8b-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "google/gemma-2-9b-it:free",
  ];

  let lastError: unknown = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      console.log(`[Owel RAG] Attempting generation with OpenRouter model: ${modelName}`);

      const model = new ChatOpenAI({
        modelName,
        apiKey: openRouterKey,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
        temperature: 0.2,
      });

      const answer = await runRagChain(model, modelName, question, sessionId);
      if (answer) {
        console.log(`[Owel RAG] Successfully generated response using OpenRouter model: ${modelName}`);
        return answer;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Owel RAG] OpenRouter model ${modelName} failed: ${errMsg}`);
      lastError = err;
    }
  }

  throw lastError || new Error("All models (Gemini + OpenRouter fallbacks) failed to generate a response.");
}
