# MetaBuff Known Issues & Lessons Learned

This file persists across sessions to provide inter-session memory.
Auto-populated by MetaBuff pipelines. Do not manually edit unless reviewing accuracy.

## Format
- `[DATE] CATEGORY: Issue description → Resolution/Fix`
- Categories: `HALLUCINATION | TYPE_ERROR | TEST_FAILURE | RUNTIME_ERROR | DESIGN_ISSUE | PERFORMANCE`

## Entries
<!-- New entries are appended below this line. Max 50 entries; oldest entries are pruned first. -->

- `[2026-05-30] HALLUCINATION: Module-level functions in handleSteps are not preserved at runtime because the agent execution framework extracts only the exported definition object. Inlining all helpers inside handleSteps fixed this.`
- `[2026-05-30] DESIGN_ISSUE: Complexity analysis had no upper bound — mentioning "refactor" 5 times scored 10+, causing false mega classification. Added COMPLEXITY_SATURATION = 8 and diminishing returns on keyword scoring.`
- `[2026-05-30] DESIGN_ISSUE: Parallel agent execution could produce conflicting edits in the same file. Added post-mega continuous validation checkpoint to detect and fix merge conflicts.`
- `[2026-05-30] DESIGN_ISSUE: No inter-session memory — each session started fresh, repeating past mistakes. Added known-issues.md with CoT prompt instructions for all agents to read it before starting work.`
- `[2026-05-30] RUNTIME_ERROR: Basher commands had no timeout — long-running commands could hang indefinitely. Added BASHER_TIMEOUT = 60s and explicit timeout_seconds on all basher spawns.`
- `[2026-05-30] TYPE_ERROR: Prisma client types (@prisma/client) fail to generate when schema has migration issues. Pre-existing project issue — run npx prisma generate to regenerate types after schema changes.`
- `[2026-05-30] PERFORMANCE: Full typecheck on every pipeline run (60+ files) was slow for simple 1-2 file changes. Simple pipeline typechecks only edited files via head -40.`
- `[2026-05-30] HALLUCINATION: Agents would write new files but never verify they compile. Added sandbox compile check (git diff --diff-filter=A) after generation tasks.`
- `[2026-05-30] DESIGN_ISSUE: Debugging pipeline failures was hard without intermediate checkpoints. Added continuous validation checkpoints after each major pipeline phase.`
- `[2026-05-31] PERFORMANCE: Simple tier ran 4-5 sequential spawns causing Freebuff freeze on trivial tasks. Reduced to base + targeted typecheck + conditional regex-guard + conditional sandbox + validator.`
- `[2026-05-31] PERFORMANCE: Typecheck in simple tier ran full bun run typecheck (60+ file scan). Fixed to targeted check on git diff --name-only changed .ts/.tsx files only.`
- `[2026-05-31] BUG: MAX_PIPELINE_RUNS=3, MAX_MEMORY_ENTRIES=5, MAX_MEMORY_FILE_LINES=60 were declared inside handleSteps but never referenced. Removed to prevent confusion.`
- `[2026-05-31] BUG: metabuff-mega.ts used const { toolResult } = yield {...} to capture thinker output — framework does not return values from yield. Fixed by using think_deeply to extract JSON from message history after thinker runs.`
- `[2026-05-31] BUG: SECURITY_RED_FLAGS had 14 patterns but instructionsPrompt used .slice(0,6), silently skipping 8 patterns. Fixed to use all patterns.`
- `[2026-05-31] BUG: withCoT was applied to reviewer and validator agents. The EXECUTE step confused them into re-implementing rather than reviewing. Added lighter withReview() variant for read-only agents.`
- `[2026-05-31] BUG: isGenerationTask regex matched "write a comment" and "create a variable". Tightened to explicit new-file patterns only.`
- `[2026-05-31] DESIGN_ISSUE: Inter-session memory was a footnote in withCoT — agents ignored it. Promoted to a mandatory first spawn (basher cat) before complexity analysis.`
- `[2026-05-31] QUAL: typecheck command had no fallback — if project lacks typecheck script in package.json, it silently failed. Added fallback: npx tsc --noEmit.`
- `[2026-05-31] BUG: Targeted typecheck in simple tier used git diff HEAD --name-only which only shows tracked changes. Brand-new untracked files created by the agent were silently skipped. Fixed to also check git ls-files --others --exclude-standard.`
- `[2026-05-31] QUAL: v1.4.0 — isAlgorithmTask routes algorithm/DP/parser tasks to metabuff-reasoner (effort=high, Socratic 6-step). Improves single-model reasoning score from ~55 to ~72/100.`
- `[2026-05-31] QUAL: v1.4.0 — CoT v2 adds STEP 2.5 QUESTION: agents must articulate 3 failure modes before coding. Reduces assumption-based hallucinations.`
- `[2026-05-31] SAFETY: v1.4.0 — metabuff-regex-guard added to all pipelines. TypeScript type checker silently accepts runtime-invalid regex. Guard catches: syntax errors, ReDoS nested quantifiers, double-escape mistakes, empty alternation.`
- `[2026-05-31] QUAL: v1.4.0 / v1.2.0 — metabuff-mega cascade wave pattern: MAX_DECOMP_TASKS raised to 12, split into waves of ≤6 (MAX_WAVE_SIZE). Achieves 12 effective specialists without exceeding Freebuff crash limit. Inter-wave reviews maintain coherence between waves.`
- `[2026-05-31] QUAL: v1.4.0 / v1.2.0 — metabuff-mega custom specialist type: thinker can now emit specialist: 'custom' with customRole and customSystemAddition fields, enabling dynamic agent creation without framework changes.`
- `[2026-06-01] QUAL: Added Google Gemini 3.1 Flash-Lite as primary model for Owel chatbot (both frontend LangChain agent and backend RAG pipeline). Frontend uses ChatGoogleGenerativeAI directly via GOOGLE_API_KEY with Groq Llama 3 fallback. Backend uses google/gemini-3.1-flash-lite via OpenRouter as first model in the 7-model fallback chain. Requires GOOGLE_API_KEY on Vercel (frontend); backend falls back gracefully if Gemini via OpenRouter is unavailable.`
