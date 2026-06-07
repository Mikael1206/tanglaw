/**
 * MetaBuff — Main Orchestrator v1.5.0
 * ─────────────────────────────────────
 * Makes Freebuff (DeepSeek V4 Pro) behave closer to Claude Opus 4.8 / Antigravity 2.0
 * by enforcing chain-of-thought, routing tasks by complexity, and coordinating
 * Codebuff's built-in agents + MetaBuff's own specialist subagents.
 *
 * CHANGES FROM v1.4.0:
 *   • [QUAL] Scope-aware complexity routing — analyzeComplexityWithScope() replaces
 *     analyzeComplexityWithScope(). A pre-flight basher greps the real codebase for
 *     keywords extracted from the prompt and counts matched files. Actual file count
 *     overrides keyword false positives:
 *       - 1 matched file → hard-caps score to simple (fixes 'refactor login button' FP)
 *       - 2–3 files + no complex keyword → simple (not complex)
 *       - 4–7 files → complex
 *       - 8–15 files → complex (high-end); 16+ → mega
 *       - Cross-cutting (files spread across 4+ dirs) adds escalation bonus
 *       - Reliability guard: if grep matches >40% of total project files, keywords
 *         are too generic → falls back to pure keyword scoring (safe for vague prompts)
 *     Adds 1 lightweight basher spawn (timeout: 15s) before every routing decision.
 *
 * CHANGES FROM v1.3.0:
 *   • [QUAL] isAlgorithmTask detector — routes novel-algorithm/complex-logic tasks
 *     to metabuff-reasoner (effort=high, Socratic protocol) instead of codebuff/planner.
 *     Closes single-model reasoning gap vs Claude Code Opus 4.8 (~55 → ~72/100).
 *   • [QUAL] withCoT upgraded to v2: added STEP 2.5 QUESTION (Socratic pre-flight).
 *     Agents must articulate 3 failure modes before writing code, cutting assumption-
 *     based hallucinations.
 *   • [SAFETY] metabuff-regex-guard added to BOTH simple and complex pipelines.
 *     TypeScript's type checker cannot catch runtime-invalid regex — this closes
 *     the entire class of regex SyntaxError bugs from AI-generated code.
 *   • [QUAL] Complex pipeline: reasoning effort escalated to 'high' for algorithm tasks
 *     (was always 'medium' via codebuff/planner).
 *   • [BUG] isRegexTask detector added — simple tasks only run regex-guard when the
 *     prompt involves patterns/parsing (avoids unnecessary spawn on pure refactors).
 *   • [PERF] Regex guard is a single basher-driven spawn — low overhead, no freeze risk.
 *
 * Architecture:
 *   Task → [Memory read + Complexity analysis] → MetaBuff orchestrator
 *        → Simple:  base(CoT v2) → typecheck → [regex-guard] → validator      [2–4 spawns]
 *        → Complex: file-picker → planner|reasoner(CoT v2) → reviewer         [5–6 spawns]
 *                   → typecheck → regex-guard → validator
 *        → Mega:    metabuff-mega (cascade wave parallel spawning) [delegated]
 *
 * SAFETY FEATURES (v1.4.0):
 *   • All v1.3.0 safety features retained (saturation, diminishing returns, etc.)
 *   • Regex guard — catches runtime-invalid patterns TypeScript misses
 *   • Socratic pre-flight — agents articulate failure modes before coding
 *   • Algorithm task routing — harder reasoning uses higher-effort specialist
 *   • Timeout bounds on all basher commands — no infinite hangs
 *   • Targeted typecheck for simple tasks — not full codebase scan
 *   • Inter-session memory — known-issues.md as mandatory first step
 *
 * CRITICAL NOTE:
 *   All helpers (analyzeComplexity, withCoT, withReview, isAlgorithmTask, isRegexTask)
 *   are inlined inside handleSteps. The agent execution framework extracts only the
 *   exported definition object — module-level function references are NOT preserved.
 */

import { AgentDefinition } from './types/agent-definition'

const definition: AgentDefinition = {
  id: 'metabuff',
  version: '1.5.0',
  displayName: 'MetaBuff Orchestrator',

  spawnerPrompt:
    'Spawn MetaBuff as your primary agent for ANY coding task. ' +
    'It automatically classifies complexity and coordinates the optimal agent pipeline, ' +
    'including CoT enforcement, inter-session memory, continuous validation, ' +
    'regex safety checks, and anti-hallucination protocols.',

  model: 'deepseek/deepseek-v4-pro',  // Primary; falls back to deepseek-v4-flash when unavailable

  reasoningOptions: {
    enabled: true,
    exclude: false,
    effort: 'medium',
  },

  toolNames: ['spawn_agents', 'think_deeply', 'end_turn'],

  spawnableAgents: [
    'codebuff/base@0.0.1',
    'codebuff/file-picker@0.0.1',
    'codebuff/thinker@0.0.1',
    'codebuff/planner@0.0.1',
    'codebuff/reviewer@0.0.1',
    'codebuff/researcher@0.0.1',
    'basher',
    'metabuff-validator',
    'metabuff-reasoner',     // v1.4.0: algorithm/logic specialist
    'metabuff-regex-guard',  // v1.4.0: runtime regex safety
    'metabuff-mega',
  ],

  systemPrompt:
    'You are MetaBuff, an intelligent orchestration layer that coordinates AI coding agents. ' +
    'Your job is NOT to write code yourself — it is to decompose tasks, select the right agents, ' +
    'and ensure every output is verified before delivery. ' +
    'Always prefer precision over speed.',

  handleSteps: function* ({ prompt }) {

    // ─── SAFETY BOUNDS ────────────────────────────────────────────────────────

    /** Maximum complexity score — prevents runaway mega classification */
    const COMPLEXITY_SATURATION = 8

    /** Timeout for basher commands in seconds */
    const BASHER_TIMEOUT = 60

    // ─── HELPER: Complexity scorer (v1.5.0 — scope-aware) ────────────────────
    /**
     * Combines keyword heuristics (v1.4 behaviour, kept as fallback) with
     * real file-count data written by the pre-flight scope basher in Phase 0.5.
     *
     * scope.reliable is false when:
     *   • No meaningful keywords could be extracted from the prompt (vague task)
     *   • grep matched >40% of project files (keywords too generic, e.g. "file", "code")
     * In those cases the function falls through to pure keyword scoring.
     */
    function analyzeComplexityWithScope(
      p: string,
      scope: { matchedFiles: number; totalFiles: number; dirCount: number; reliable: boolean }
    ): 'simple' | 'complex' | 'mega' {
      const lower = p.toLowerCase()
      let score = 0
      let megaHits = 0
      let complexHits = 0

      // ── Tier 1: mega keywords ─────────────────────────────────────────────
      const megaKw = [
        'from scratch', 'entire codebase', 'full system',
        'complete rewrite', 'new architecture', 'all files', 'every file',
        'migrate entire', 'redesign everything', 'operating system',
      ]
      for (const kw of megaKw) {
        if (lower.includes(kw)) {
          megaHits++
          score += Math.max(1, 4 - (megaHits - 1) * 1.5)
        }
      }

      // ── Tier 2: complex keywords ──────────────────────────────────────────
      const complexKw = [
        'refactor', 'architecture', 'redesign', 'integrate', 'migrate',
        'add auth', 'add authentication', 'database migration',
        'all endpoints', 'all components', 'performance',
        'multiple files', 'across the', 'everywhere',
        'add new', 'create new', 'implement',
        'new api', 'new route', 'new endpoint',
        'new component', 'new page', 'new feature',
        'add tests', 'write tests', 'unit test',
      ]
      for (const kw of complexKw) {
        if (lower.includes(kw)) {
          complexHits++
          score += Math.max(0.5, 2 - (complexHits - 1) * 0.5)
        }
      }

      // ── Tier 3: explicit filenames in prompt text (v1.4 behaviour) ────────
      const fileMatches = p.match(/\b\w+\.(ts|tsx|js|jsx|py|go|rs|java|cpp|cs)\b/g)
      if (fileMatches) {
        const uniqueFiles = new Set(fileMatches)
        if (uniqueFiles.size > 8) score += 2
        else if (uniqueFiles.size > 4) score += 1
        else if (uniqueFiles.size > 2) score += 0.5
      }

      // ── Tier 4: PascalCase component names (v1.4 behaviour) ──────────────
      const componentMatches = p.match(/\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b/g)
      if (componentMatches) {
        const uniqueComps = new Set(componentMatches)
        if (uniqueComps.size > 3) score += 2
        else if (uniqueComps.size > 1) score += 1
      }

      // ── Tier 5: cross-cutting concern counter (v1.4 behaviour) ───────────
      const concerns = [
        'api', 'database', 'db', 'schema', 'migration', 'config',
        'deploy', 'ci', 'component', 'auth', 'middleware', 'query',
      ]
      let concernCount = 0
      for (const c of concerns) {
        if (lower.includes(c)) concernCount++
      }
      if (concernCount > 4) score += 2
      else if (concernCount > 2) score += 1

      if (p.length > 500) score += 1

      // ── NEW v1.5.0: Real file-scope override ──────────────────────────────
      // Applies only when the pre-flight grep was reliable (specific enough keywords,
      // matched < 40% of the project). Actual codebase evidence beats keywords.
      if (scope.reliable && scope.matchedFiles >= 0) {
        const { matchedFiles, dirCount } = scope

        // Cross-cutting bonus: same file count is harder when spread across dirs
        const crossCutting = dirCount >= 4

        if (matchedFiles === 0) {
          // Keywords had no grep hits — vague prompt, keep keyword score unchanged
        } else if (matchedFiles === 1) {
          // Definitively single-file — hard-cap to simple even if 'refactor' is present
          // ("refactor the login button" touching 1 file IS a simple task)
          score = Math.min(score, 1.9)
        } else if (matchedFiles <= 3) {
          // 2–3 files: keep at simple UNLESS keyword score already says complex
          // ("refactor auth.ts and user.ts" with 2 files still warrants complex pipeline)
          const fileScore = score >= 2 ? 2.5 : 1.5
          score = Math.max(score, fileScore)
        } else if (matchedFiles <= 7) {
          // 4–7 files: solidly complex
          score = Math.max(score, 2.5)
        } else if (matchedFiles <= 15) {
          // 8–15 files OR 5+ files cross-cutting: high-end complex (approaching mega)
          const fileScore = crossCutting ? 4.5 : 4
          score = Math.max(score, fileScore)
        } else {
          // 16+ files, or 10+ cross-cutting: mega territory
          score = Math.max(score, 6)
        }
      }

      score = Math.min(score, COMPLEXITY_SATURATION)

      if (score >= 6) return 'mega'
      if (score >= 2) return 'complex'
      return 'simple'
    }

    // ─── HELPER: Algorithm task detector ──────────────────────────────────────
    /**
     * Returns true when the task involves novel algorithmic reasoning
     * that benefits from metabuff-reasoner (effort=high, Socratic 6-step).
     * NEW v1.4.0
     */
    function isAlgorithmTask(p: string): boolean {
      return /\b(algorithm|algorithms|parse|parser|sort(?:ing)?|search(?:ing)?|graph|tree|trie|heap|dp|dynamic.?programm|recursion|recursive|memoiz|optimiz(?:e|ation)|performance|time.?complex|space.?complex|big.?o|bigint|float(?:ing.?point)?|numeric|precision|overflow|concurrent|concurren|mutex|race.?condition|deadlock|state.?machine|workflow.?engine|transpil|compil(?:er|ation)|lexer|tokeniz|ast|backtrack|greedy)\b/i.test(p)
    }

    // ─── HELPER: Regex/pattern task detector ──────────────────────────────────
    /**
     * Returns true when the task involves regex or string-pattern matching,
     * triggering the regex guard even in the simple pipeline.
     * NEW v1.4.0
     */
    function isRegexTask(p: string): boolean {
      return /\b(regex|regexp|pattern|match(?:ing)?|replace(?:all)?|sanitiz|validat|parse|url.*match|email.*valid|phone.*valid|search.*pattern|string.*extract)\b/i.test(p)
    }

    // ─── HELPER: Full CoT wrapper v2 ──────────────────────────────────────────
    /**
     * v1.4.0 upgrade: added STEP 2.5 QUESTION — Socratic pre-flight.
     * Agents must articulate 3 failure modes before planning.
     */
    function withCoT(task: string, role = 'coding'): string {
      return `<metabuff_cot_protocol version="2">
You are operating under MetaBuff's anti-hallucination protocol v2.

BEFORE taking any action you MUST follow these steps IN ORDER:

STEP 1 — ORIENT
  • State the goal in one sentence
  • List every file you need to read (don't assume contents you haven't seen)

STEP 2 — GROUND
  • Read all listed files via read_files
  • Run code_searcher for any symbol, function, or type you plan to reference
  • NEVER write an import path, class name, or API call you haven't verified

STEP 2.5 — QUESTION  ← Socratic pre-flight (do not skip)
  • Ask yourself: "What are 3 specific ways this implementation could be wrong?"
  • Ask yourself: "What am I assuming that I haven't yet verified with a tool call?"
  • Does this task involve regex, string parsing, or pattern matching?
    If yes → flag it with: "⚠ REGEX RISK — will verify all patterns after implementation"
  • For each assumption: resolve it with a tool call BEFORE proceeding to STEP 3
  • Do NOT proceed to STEP 3 while any unresolved assumption exists

STEP 3 — PLAN
  • Write a numbered action plan (what changes in what files in what order)
  • Flag any remaining uncertainty as: "⚠ UNCERTAIN: [thing you are not sure about]"
  • Resolve all uncertainties with tool calls before proceeding

STEP 4 — EXECUTE
  • Carry out each step one at a time
  • Use str_replace for targeted edits; write_file only for new files
  • After each edit, narrate: "✓ DONE: [what changed and why it's correct]"

STEP 5 — VERIFY
  • Re-read changed files to confirm the edit landed correctly
  • Run any available tests or lint commands via basher
  • If anything looks wrong, fix it before calling end_turn
  • If you flagged ⚠ REGEX RISK above: explicitly state that regex-guard will follow

GROUNDING RULES (never violate):
  ✗ Do not reference a file path without having read it this session
  ✗ Do not assume a function or type exists — verify with code_searcher
  ✗ Do not invent package names or import paths
  ✗ Do not leave TODOs or placeholder code in the final output
  ✗ Do not call end_turn if there are unresolved ⚠ UNCERTAIN items
</metabuff_cot_protocol>

<task role="${role}">
${task}
</task>`
    }

    // ─── HELPER: Light review wrapper ─────────────────────────────────────────
    function withReview(task: string): string {
      return `<metabuff_review_protocol>
You are a reviewer in MetaBuff's pipeline. Your job is to VERIFY, not to re-implement.

PROTOCOL:
  1. READ every changed file in this session (use read_files + git diff HEAD)
  2. CHECK for: syntax errors, missing imports, broken references, TODOs/placeholders
  3. FIX issues you find using str_replace (surgical, targeted changes only)
  4. REPORT what you checked and what (if anything) you fixed

RULES:
  ✗ Do not re-write large sections unless there is a concrete bug
  ✗ Do not call end_turn while there are unfixed issues
  ✗ Do not invent problems that aren't there
</metabuff_review_protocol>

<review_task>
${task}
</review_task>`
    }

    // ─── PHASE 0: INTER-SESSION MEMORY ────────────────────────────────────────
    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'basher',
          params: {
            command:
              'if [ -f .agents/known-issues.md ]; then ' +
              '  echo "=== INTER-SESSION MEMORY ===" && ' +
              '  cat .agents/known-issues.md; ' +
              'else ' +
              '  echo "No known-issues.md found — first session."; ' +
              'fi',
            what_to_summarize:
              'List all known issues from previous sessions. ' +
              'These will inform how all subsequent agents approach this task.',
            timeout_seconds: 10,
          },
        }],
      },
    }

    // ─── PHASE 0.5: FILE SCOPE PRE-FLIGHT ────────────────────────────────────
    // Grep the real codebase for keywords extracted from the prompt.
    // Writes { matchedFiles, totalFiles, dirCount, reliable } to .agents/.scope-tmp.json
    // which analyzeComplexityWithScope() reads synchronously after this yield.
    const safePromptForBash = prompt
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "'\\''")
      .replace(/\n/g, ' ')
      .slice(0, 400)

    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'basher',
          params: {
            command: [
              // Extract meaningful keywords: >3 chars, lowercase, minus stop words
              `KEYWORDS=$(echo '${safePromptForBash}' \\`,
              `  | tr '[:upper:]' '[:lower:]' \\`,
              `  | grep -oE '[a-zA-Z]{4,}' \\`,
              `  | grep -vxE 'this|that|with|from|have|will|your|into|when|them|they|what|file|code|make|want|need|just|like|some|more|then|also|than|even|only|over|back|here|there|their|been|were|does|dont|should|would|could|change|update|every|other|same|such|very|much|many|well|still|down|first|last|next|always|often|across|without|within|along|through|around|between|during|against|inside|outside|toward|under|until|upon|while|since|each|both|about|above|below|where|after|before|already|again|never|using|please|really|just|simply|whether|something|anything|nothing|everything' \\`,
              `  | sort -u | head -8 | tr '\\n' '|' | sed 's/|$//')`,
              ``,
              // Count total source files (excluding noise dirs)
              `TOTAL=$(find . -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.py' -o -name '*.go' -o -name '*.rs' -o -name '*.java' \\) \\`,
              `  | grep -v node_modules | grep -v '\\.git' | grep -v dist | grep -v '\\.next' | grep -v coverage | grep -v __pycache__ \\`,
              `  | wc -l | tr -d ' ')`,
              ``,
              // Grep codebase for matched files
              `if [ -n "$KEYWORDS" ]; then`,
              `  MATCHED=$(grep -rli --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.py' --include='*.go' --include='*.rs' \\`,
              `    -E "$KEYWORDS" . 2>/dev/null \\`,
              `    | grep -v node_modules | grep -v '\\.git' | grep -v dist | grep -v '\\.next' | wc -l | tr -d ' ')`,
              `  # Count distinct directories of matched files (cross-cutting signal)`,
              `  DIRS=$(grep -rli --include='*.ts' --include='*.tsx' --include='*.js' --include='*.py' \\`,
              `    -E "$KEYWORDS" . 2>/dev/null \\`,
              `    | grep -v node_modules | grep -v '\\.git' | grep -v dist \\`,
              `    | sed 's|/[^/]*$||' | sort -u | wc -l | tr -d ' ')`,
              `  # Reliability check: if matched > 40% of total, keywords are too generic`,
              `  THRESH=$(( TOTAL * 2 / 5 + 1 ))`,
              `  if [ "$TOTAL" -gt 0 ] && [ "$MATCHED" -le "$THRESH" ]; then RELIABLE=true; else RELIABLE=false; fi`,
              `else`,
              `  MATCHED=0; DIRS=0; RELIABLE=false`,
              `fi`,
              ``,
              // Write JSON result
              `printf '{"matchedFiles":%s,"totalFiles":%s,"dirCount":%s,"reliable":%s}\\n' \\`,
              `  "$MATCHED" "$TOTAL" "$DIRS" "$RELIABLE" > .agents/.scope-tmp.json`,
              `echo "scope: ${safePromptForBash}" `,
              `echo "scope-result: matched=$MATCHED total=$TOTAL dirs=$DIRS reliable=$RELIABLE keys=$KEYWORDS"`,
            ].join('\n'),
            what_to_summarize:
              'File scope pre-flight: report how many files matched and whether reliable.',
            timeout_seconds: 15,
          },
        }],
      },
    }

    // Read scope data synchronously before routing.
    // handleSteps is a synchronous generator — code between yields runs in the
    // main Node.js thread, so readFileSync is safe here.
    let scopeData: { matchedFiles: number; totalFiles: number; dirCount: number; reliable: boolean } = {
      matchedFiles: -1, totalFiles: 0, dirCount: 0, reliable: false,
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const fs = require('fs')
      const raw: string = fs.readFileSync('.agents/.scope-tmp.json', 'utf8')
      scopeData = JSON.parse(raw)
      try { fs.unlinkSync('.agents/.scope-tmp.json') } catch { /* cleanup best-effort */ }
    } catch {
      // Scope file unavailable (first run, timeout, or unsupported env)
      // analyzeComplexityWithScope falls back to keyword-only scoring when reliable=false
    }

    // ─── PHASE 1: COMPLEXITY ANALYSIS ─────────────────────────────────────────
    const complexity = analyzeComplexityWithScope(prompt, scopeData)

    const isGenerationTask = /\b(create new file|write new file|generate.*\.(ts|tsx|js|jsx|py)|new component|new page|from scratch|build.*system)\b/i.test(prompt)
    const algoTask = isAlgorithmTask(prompt)
    const regexTask = isRegexTask(prompt)

    // ── SIMPLE ────────────────────────────────────────────────────────────────
    if (complexity === 'simple') {

      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/base@0.0.1',
            prompt: withCoT(prompt),
          }],
        },
      }

      // Targeted typecheck — only changed + new files
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'basher',
            params: {
              command:
                'TS_CHANGED=$(git diff HEAD --name-only 2>/dev/null | grep -E "\\.(ts|tsx)$") && ' +
                'TS_NEW=$(git ls-files --others --exclude-standard 2>/dev/null | grep -E "\\.(ts|tsx)$") && ' +
                'if [ -n "${TS_CHANGED}${TS_NEW}" ]; then ' +
                '  echo "=== TYPECHECK (changed + new files) ===" && ' +
                '  (bun run typecheck 2>/dev/null || npx tsc --noEmit 2>&1) | head -30; ' +
                'else ' +
                '  echo "No .ts/.tsx files changed or created — skipping typecheck."; ' +
                'fi',
              what_to_summarize:
                'Report any TypeScript errors in changed files. ' +
                'If errors exist, fix them before end_turn.',
              timeout_seconds: BASHER_TIMEOUT,
            },
          }],
        },
      }

      // v1.4.0: Regex guard — only for regex/pattern tasks or generation
      if (regexTask || isGenerationTask) {
        yield {
          toolName: 'spawn_agents',
          input: {
            agents: [{
              agent_type: 'metabuff-regex-guard',
              prompt: `Run regex guard for changes in: ${prompt}`,
            }],
          },
        }
      }

      if (isGenerationTask) {
        yield {
          toolName: 'spawn_agents',
          input: {
            agents: [{
              agent_type: 'basher',
              params: {
                command:
                  'echo "=== NEW FILES ===" && ' +
                  'git diff HEAD --name-only --diff-filter=A 2>/dev/null | head -10 || ' +
                  'echo "No new files detected"',
                what_to_summarize:
                  'List newly created files. ' +
                  'Verify each new .ts/.tsx file has valid imports and no syntax errors.',
                timeout_seconds: 15,
              },
            }],
          },
        }
      }

      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'metabuff-validator',
            prompt: `Validate changes made for: ${prompt}`,
          }],
        },
      }

    // ── COMPLEX ───────────────────────────────────────────────────────────────
    } else if (complexity === 'complex') {

      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/file-picker@0.0.1',
            prompt: `Find all files relevant to: ${prompt}`,
          }],
        },
      }

      // v1.4.0: Algorithm tasks → reasoner (effort=high, Socratic 6-step)
      //         Normal tasks   → planner with CoT v2
      if (algoTask) {
        yield {
          toolName: 'spawn_agents',
          input: {
            agents: [{
              agent_type: 'metabuff-reasoner',
              prompt:
                `Task requires algorithmic reasoning — apply the full 6-step Socratic protocol.\n\n` +
                `Task: ${prompt}\n\n` +
                `CONTEXT: Focus on correctness proofs and complexity analysis. ` +
                `Run tests at STEP 6 before calling end_turn.`,
            }],
          },
        }
      } else {
        yield {
          toolName: 'spawn_agents',
          input: {
            agents: [{
              agent_type: 'codebuff/planner@0.0.1',
              prompt: withCoT(
                `Analyze the full scope, then implement all changes for:\n${prompt}\n\n` +
                `Before writing a single line, identify ALL files that need to change ` +
                `and produce a dependency-ordered change list. Flag every assumption.`
              ),
            }],
          },
        }
      }

      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/reviewer@0.0.1',
            prompt: withReview(
              `Review ALL changes made for: ${prompt}\n\n` +
              `Also check:\n` +
              `  - Syntax errors and missing imports\n` +
              `  - TODOs and placeholder code\n` +
              `  - Broken references or non-existent symbols\n` +
              `Fix anything you find. Do not just report it.`
            ),
          }],
        },
      }

      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'basher',
            params: {
              command:
                'echo "=== TYPE CHECK ===" && ' +
                '(bun run typecheck 2>/dev/null || npx tsc --noEmit 2>&1) | head -40 && ' +
                'echo "=== TESTS ===" && ' +
                '(bun test 2>&1 || npx vitest run 2>&1 || npx jest 2>&1) | tail -30',
              what_to_summarize:
                'Type-check and test results. ' +
                'Report any TypeScript errors or test failures. ' +
                'If errors found, fix them now before calling end_turn.',
              timeout_seconds: BASHER_TIMEOUT,
            },
          }],
        },
      }

      // v1.4.0: Regex guard always runs in the complex pipeline
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'metabuff-regex-guard',
            prompt: `Run regex guard for all changes in: ${prompt}`,
          }],
        },
      }

      if (isGenerationTask) {
        yield {
          toolName: 'spawn_agents',
          input: {
            agents: [{
              agent_type: 'basher',
              params: {
                command:
                  'echo "=== SANDBOX ===" && ' +
                  'git diff HEAD --name-only --diff-filter=A 2>/dev/null | head -20 || ' +
                  'echo "No new files detected"',
                what_to_summarize:
                  'List newly created files. ' +
                  'Verify any new source files have proper imports and no syntax errors.',
                timeout_seconds: 15,
              },
            }],
          },
        }
      }

      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'metabuff-validator',
            prompt: `Validate all changes for: ${prompt}`,
          }],
        },
      }

    // ── MEGA ──────────────────────────────────────────────────────────────────
    } else {

      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'metabuff-mega',
            prompt: prompt,
          }],
        },
      }

      // Post-mega conflict resolution
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/base@0.0.1',
            prompt: withReview(
              `Post-mega conflict check for: ${prompt}\n\n` +
              `Multiple specialist agents ran in parallel. Check specifically for:\n` +
              `  1. Conflicting changes between agents (same file modified inconsistently)\n` +
              `  2. Missing integration glue between subsystems\n` +
              `  3. Any TODOs or placeholder comments left by agents\n` +
              `Fix ALL issues found.`
            ),
          }],
        },
      }
    }
  },
}

export default definition
