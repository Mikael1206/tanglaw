/**
 * MetaBuff Mega — Antigravity 2.0-Style Parallel Agent Spawner v1.2.0
 * ─────────────────────────────────────────────────────────────────────
 * For large-scale tasks (full-system refactors, new features spanning many
 * subsystems, or anything the complexity analyzer scored 6+).
 *
 * CHANGES FROM v1.1.0:
 *   • [QUAL] Cascade wave pattern: MAX_DECOMP_TASKS raised from 6 to 12.
 *     Subtasks are split into sequential waves of ≤ MAX_WAVE_SIZE (6).
 *     Closes scale gap vs Antigravity 2.0 — 12 effective specialist agents
 *     without exceeding the Freebuff 6-concurrent freeze limit.
 *     Between waves, a lightweight integration review ensures wave 2 agents
 *     have accurate context from wave 1 changes.
 *   • [QUAL] Dynamic specialist type: thinker can now output specialist: 'custom'
 *     with customRole + customSystemAddition fields to create purpose-built
 *     agents for novel task categories (e.g., 'i18n-specialist', 'migration-specialist').
 *     Closes the static-pool gap vs Antigravity 2.0's fully dynamic agent creation.
 *   • [QUAL] Algorithm routing: 'reason' specialist type added → routes to
 *     metabuff-reasoner (effort=high, Socratic 6-step) for algorithmically complex
 *     subtasks.
 *   • [SAFETY] metabuff-regex-guard added after synthesis review.
 *     All generated code in mega tasks is now scanned for runtime-invalid regex.
 *   • [QUAL] Thinker prompt updated: documents new specialists + cascade awareness.
 *   • [QUAL] parseDecomposition handles new fields (customRole, customSystemAddition).
 *
 * FLOW:
 *   1. File-picker maps relevant codebase structure
 *   2. Thinker decomposes into 3–12 subtasks (JSON), including optional 'custom' types
 *   3. think_deeply extracts the JSON from thinker's response
 *   4. Subtasks split into waves of ≤ MAX_WAVE_SIZE (6) — Freebuff stability limit
 *   5. Wave 1 runs in parallel; inter-wave review if Wave 2+ exists
 *   6. Wave 2+ runs in parallel (building on wave 1 context)
 *   7. Synthesis reviewer integrates all parallel outputs
 *   8. Regex guard scans all generated code
 *   9. Basher runs full typecheck + tests
 *  10. Validator does final anti-hallucination pass
 *
 * PERFORMANCE CONSTRAINTS (NEVER VIOLATE):
 *   • MAX_WAVE_SIZE = 6 — hard limit for Freebuff concurrent spawn stability.
 *     More than 6 simultaneous spawns cause Freebuff to freeze or crash.
 *   • MAX_DECOMP_TASKS = 12 — thinker soft limit (2 waves of 6 max).
 *     Increase only if cascade waves are proven stable in your environment.
 *
 * CRITICAL NOTE:
 *   All helpers inlined inside handleSteps — module-level functions are NOT
 *   preserved by the agent execution framework (see README.md for details).
 */

import { AgentDefinition } from './types/agent-definition'

const definition: AgentDefinition = {
  id: 'metabuff-mega',
  version: '1.2.0',
  displayName: 'MetaBuff Mega (Cascade Parallel Spawner)',

  spawnerPrompt:
    'Spawn for large-scale tasks: full-system refactors, new features spanning many files, ' +
    'architectural changes, or anything requiring more than 5 files to change. ' +
    'MetaBuff Mega decomposes the task into up to 12 subtasks and runs them in ' +
    'cascade waves of ≤6 parallel agents (Antigravity 2.0 pattern, Freebuff-safe).',

  model: 'deepseek/deepseek-v4-pro',  // Primary; falls back to deepseek-v4-flash when unavailable

  reasoningOptions: {
    enabled: true,
    exclude: false,
    effort: 'high',
  },

  toolNames: ['spawn_agents', 'think_deeply', 'end_turn'],

  spawnableAgents: [
    'codebuff/base@0.0.1',
    'codebuff/thinker@0.0.1',
    'codebuff/reviewer@0.0.1',
    'codebuff/researcher@0.0.1',
    'codebuff/file-picker@0.0.1',
    'basher',
    'metabuff-arch',
    'metabuff-security',
    'metabuff-testgen',
    'metabuff-reasoner',     // v1.2.0: algorithm specialist
    'metabuff-regex-guard',  // v1.2.0: runtime regex safety
    'metabuff-validator',
  ],

  systemPrompt:
    'You are the MetaBuff Mega orchestrator. ' +
    'You never write code directly. ' +
    'Your job is to decompose large tasks into parallel subtasks and coordinate specialist agents ' +
    'in cascade waves (never more than 6 concurrent spawns). ' +
    'Think of yourself as the Technical Director for a parallel coding team.',

  handleSteps: function* ({ prompt }) {

    /**
     * Hard limit: concurrent spawns that won't freeze Freebuff.
     * NEVER increase this without testing Freebuff stability.
     */
    const MAX_WAVE_SIZE = 6

    /**
     * Soft limit: maximum subtasks the thinker can create.
     * At 12 tasks and wave size 6 → 2 waves = 12 effective specialists total.
     */
    const MAX_DECOMP_TASKS = 12

    /** Timeout for typecheck/test basher commands */
    const BASHER_TIMEOUT = 120

    // ─── HELPER: Resolve specialist tag → agent type string ───────────────────
    function resolveAgent(specialist: string): string {
      const map: Record<string, string> = {
        arch:     'metabuff-arch',
        security: 'metabuff-security',
        testgen:  'metabuff-testgen',
        base:     'codebuff/base@0.0.1',
        research: 'codebuff/researcher@0.0.1',
        review:   'codebuff/reviewer@0.0.1',
        reason:   'metabuff-reasoner',     // v1.2.0
        custom:   'codebuff/base@0.0.1',   // v1.2.0: dynamic via custom prompt
      }
      return map[specialist] ?? 'codebuff/base@0.0.1'
    }

    // ─── HELPER: Split array into waves ───────────────────────────────────────
    function splitIntoWaves<T>(items: T[], waveSize: number): T[][] {
      const waves: T[][] = []
      for (let i = 0; i < items.length; i += waveSize) {
        waves.push(items.slice(i, i + waveSize))
      }
      return waves
    }

    // ─── HELPER: Parse decomposition ──────────────────────────────────────────
    function parseDecomposition(
      raw: string | undefined,
      fallbackPrompt: string,
    ): Array<{
      subtask: string
      specialist: string
      focus: string
      customRole?: string
      customSystemAddition?: string
    }> {
      if (!raw) return [{
        subtask: fallbackPrompt,
        specialist: 'base',
        focus: 'full implementation',
      }]

      const jsonMatch = raw.match(/\[[\s\S]*?\]/s)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]) as unknown[]
          if (Array.isArray(parsed) && parsed.length > 0) {
            return (parsed as Array<{
              subtask: string
              specialist: string
              focus: string
              customRole?: string
              customSystemAddition?: string
            }>)
              .slice(0, MAX_DECOMP_TASKS)
              .filter(s => typeof s.subtask === 'string' && typeof s.specialist === 'string')
          }
        } catch {
          // fall through to bullet-list fallback
        }
      }

      const lines = raw.split('\n').filter(l => /^\s*[-\d*•]/.test(l)).slice(0, MAX_DECOMP_TASKS)
      if (lines.length > 1) {
        return lines.map((line, i) => ({
          subtask: line.replace(/^\s*[-\d.*•]+\s*/, ''),
          specialist: i === 0 ? 'arch' : i === lines.length - 1 ? 'testgen' : 'base',
          focus: `part ${i + 1} of ${lines.length}`,
        }))
      }

      return [{ subtask: fallbackPrompt, specialist: 'base', focus: 'full implementation' }]
    }

    // ─── COT prefix for all specialist agents ─────────────────────────────────
    const COT_SYSTEM_PREFIX = `You are a specialist agent in MetaBuff's parallel execution pipeline.
You are responsible for ONE specific subtask of a larger system.

PROTOCOL:
  1. Read every file relevant to your subtask before touching anything
  2. Verify all symbols, imports, and types you plan to use via code_searcher
  3. Make your changes with surgical str_replace operations
  4. Leave a brief comment in each changed file: // [MetaBuff Mega: <focus>]
  5. Do NOT attempt to handle subtasks assigned to other specialist agents
  6. Call end_turn only when your subtask is complete and verified

ANTI-HALLUCINATION (non-negotiable):
  ✗ Do not reference a file path without having read it this session
  ✗ Do not assume a function or type exists — verify with code_searcher
  ✗ Do not invent package names or import paths
  ✗ Do not leave TODOs or placeholder code
  ✗ Do not call end_turn if there are unresolved ⚠ UNCERTAIN items

`

    // ── Phase 0: Codebase mapping ──────────────────────────────────────────────
    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'codebuff/file-picker@0.0.1',
          prompt:
            `Map the entire codebase structure relevant to this task.\n` +
            `List key files, their roles, and how they interconnect.\n` +
            `Task: ${prompt}`,
        }],
      },
    }

    // ── Phase 1: Task decomposition ───────────────────────────────────────────
    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'codebuff/thinker@0.0.1',
          prompt:
            `You are decomposing a large coding task for parallel cascade execution.\n\n` +
            `Task: ${prompt}\n\n` +
            `Output ONLY a JSON array (no markdown, no explanation) of 3–${MAX_DECOMP_TASKS} subtasks.\n` +
            `Each element:\n` +
            `  {\n` +
            `    "subtask": "Detailed description of what to implement",\n` +
            `    "specialist": "arch|security|testgen|base|research|reason|custom",\n` +
            `    "focus": "one-line display name",\n` +
            `    "customRole": "(only when specialist=custom) short role title",\n` +
            `    "customSystemAddition": "(only when specialist=custom) extra system prompt text"\n` +
            `  }\n\n` +
            `Specialist guide:\n` +
            `  arch     → system design, component structure, data models, API contracts\n` +
            `  security → auth flows, input validation, secrets, access control\n` +
            `  testgen  → unit + integration tests for changed code\n` +
            `  base     → general implementation: business logic, UI, utilities\n` +
            `  research → documentation, README, changelog, ADRs\n` +
            `  reason   → algorithm design, state machines, performance optimization,\n` +
            `             parsers, numerical computation — anything requiring proof-level thinking\n` +
            `  custom   → novel task-specific roles not covered above.\n` +
            `             Set customRole = "short-role-name" (e.g., "migration-specialist")\n` +
            `             Set customSystemAddition = "You focus exclusively on [specific aspect]..."\n\n` +
            `Cascade wave rules:\n` +
            `  - Subtasks run in waves of ${MAX_WAVE_SIZE} concurrent agents\n` +
            `  - Order subtasks so FOUNDATION work (arch, data models) appears first\n` +
            `  - Implementation subtasks that depend on the schema come in wave 2\n` +
            `  - testgen + research always go in the LAST wave\n` +
            `  - Always include at least one testgen subtask\n` +
            `  - Always include arch if the task touches data models or APIs\n` +
            `  - Each file should appear in at most one subtask\n` +
            `  - Respect the ${MAX_DECOMP_TASKS}-subtask maximum`,
        }],
      },
    }

    // Extract decomposition JSON from thinker's response
    const decompositionRaw: string = yield {
      toolName: 'think_deeply',
      input: {
        prompt:
          'Look at the thinker agent\'s most recent response in this session. ' +
          'Extract ONLY the JSON array of subtasks it produced. ' +
          'Return just the raw JSON array, nothing else. ' +
          'If no valid JSON array is found, return an empty string.',
      },
    } as unknown as string

    const subtasks = parseDecomposition(decompositionRaw, prompt)

    // ── Phase 2: Cascade wave execution ───────────────────────────────────────
    const agentConfigs = subtasks.map(st => {
      let customPrefix = ''
      if (st.specialist === 'custom') {
        customPrefix =
          `DYNAMIC SPECIALIST ROLE: ${st.customRole ?? 'Custom Specialist'}\n` +
          `${st.customSystemAddition ?? ''}\n\n`
      }

      return {
        agent_type: resolveAgent(st.specialist),
        prompt:
          customPrefix +
          COT_SYSTEM_PREFIX +
          `SUBTASK [${st.focus}]:\n${st.subtask}\n\n` +
          `FULL TASK CONTEXT (for reference only — implement only your subtask):\n${prompt}`,
      }
    })

    const waves = splitIntoWaves(agentConfigs, MAX_WAVE_SIZE)

    for (let waveIdx = 0; waveIdx < waves.length; waveIdx++) {
      const wave = waves[waveIdx]

      yield {
        toolName: 'spawn_agents',
        input: { agents: wave },
      }

      // Inter-wave integration review (not after the final wave)
      if (waveIdx < waves.length - 1) {
        yield {
          toolName: 'spawn_agents',
          input: {
            agents: [{
              agent_type: 'codebuff/reviewer@0.0.1',
              prompt:
                `Inter-wave integration review (after Wave ${waveIdx + 1} of ${waves.length}).\n\n` +
                `${wave.length} agents just completed work on: ${prompt}\n\n` +
                `Before Wave ${waveIdx + 2} begins, check for:\n` +
                `  1. Conflicting changes that would break Wave ${waveIdx + 2} agents' work\n` +
                `  2. Exported symbols that Wave ${waveIdx + 2} agents will depend on\n` +
                `  3. Type mismatches or interface changes that need propagating\n` +
                `  4. Any incomplete implementations that would block the next wave\n` +
                `Fix blockers now. Do not refactor style or non-blocking issues.`,
            }],
          },
        }
      }
    }

    // ── Phase 3: Final synthesis review ───────────────────────────────────────
    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'codebuff/reviewer@0.0.1',
          prompt:
            `Final synthesis review for a ${waves.length}-wave parallel cascade session.\n\n` +
            `${subtasks.length} specialist agents completed work on:\n${prompt}\n\n` +
            `Check specifically for:\n` +
            `  1. Conflicting changes between agents (same file edited inconsistently)\n` +
            `  2. Naming/interface inconsistencies across the codebase\n` +
            `  3. Missing integration glue between subsystems\n` +
            `  4. Any subtask that appears incomplete\n` +
            `  5. TODOs or placeholder comments left by any agent\n` +
            `Fix all issues found — do not just report them.`,
        }],
      },
    }

    // ── Phase 4: Regex guard ───────────────────────────────────────────────────
    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'metabuff-regex-guard',
          prompt: `Run regex guard for all code generated in the mega task: ${prompt}`,
        }],
      },
    }

    // ── Phase 5: Full typecheck + tests ────────────────────────────────────────
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
              'If errors found, describe them so the validator can fix them.',
            timeout_seconds: BASHER_TIMEOUT,
          },
        }],
      },
    }

    // ── Phase 6: Final validation ──────────────────────────────────────────────
    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'metabuff-validator',
          prompt:
            `Final validation pass for mega cascade task (${waves.length} waves, ` +
            `${subtasks.length} specialists): ${prompt}`,
        }],
      },
    }
  },
}

export default definition
