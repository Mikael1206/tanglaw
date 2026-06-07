/**
 * MetaBuff Validator — Anti-Hallucination Layer v1.1.0
 * ──────────────────────────────────────────────────────
 * Runs after every MetaBuff pipeline to catch and fix the most common
 * DeepSeek Flash failure modes:
 *
 *   1. Ghost imports       — references to non-existent modules/types
 *   2. Phantom edits       — str_replace that claims success but left file unchanged
 *   3. Broken tests        — changes that silently break existing tests
 *   4. Incomplete TODOs    — placeholder code left in production paths
 *   5. Type drift          — new code inconsistent with existing type contracts
 *   6. [NEW v1.1.0] Regex errors — runtime-invalid patterns TypeScript misses
 *   7. [NEW v1.1.0] Consistency assertions — exports match their declared shapes
 *
 * CHANGES FROM v1.0.0:
 *   • [SAFETY] Regex check added to AUDIT CHECKLIST — flags regex-containing
 *     changed files so metabuff-regex-guard can be spawned if needed.
 *   • [QUAL] Ghost import detection strengthened — now checks both named imports
 *     and default imports via code_searcher before marking clean.
 *   • [QUAL] Consistency assertion: checks that exported function signatures
 *     match any callers that were also modified in this session.
 *   • [QUAL] metabuff-regex-guard added to spawnableAgents — validator can
 *     delegate regex scanning rather than attempting manual pattern analysis.
 */

import { AgentDefinition } from './types/agent-definition'

const FREE_MODEL = 'deepseek/deepseek-v4-pro'  // Primary; falls back to deepseek-v4-flash when unavailable

const VALIDATOR_SYSTEM_PROMPT = `You are MetaBuff's anti-hallucination validator.
Your ONLY job is to audit changes made by other agents and fix any problems.

You are skeptical. You assume errors exist until proven otherwise.

AUDIT CHECKLIST (run every time — check each box explicitly):
  □ Read every modified file in full               — use read_files
  □ Confirm each import statement is valid         — use code_searcher to verify symbols exist
  □ Confirm every function/type called exists      — use code_searcher to look up definitions
  □ Search for "TODO", "FIXME", "placeholder"      — use code_searcher
  □ Check for regex literals or new RegExp() calls — if found, spawn metabuff-regex-guard
  □ Check caller/callee consistency                — if a function signature changed, verify callers match
  □ Run the test suite                             — spawn a basher agent
  □ Run the TypeScript/language compiler           — spawn a basher agent
  □ Check for syntax errors by re-reading with fresh eyes

FIX PROTOCOL:
  • If you find a ghost import → correct it or remove it
  • If you find a TODO/placeholder → implement it or raise an error
  • If tests fail → diagnose the root cause and fix the source, not the test
  • If a type is inconsistent → align it with the existing type contract
  • If regex patterns exist in changed files → spawn metabuff-regex-guard before calling end_turn
  • If a function signature changed → verify ALL callers were updated
  • Never suppress an error — always surface and fix the root cause

OUTPUT FORMAT:
  After your audit, end with one of:
  ✅ VALIDATION PASSED — list what you checked
  ❌ VALIDATION FAILED — list what you found and what you fixed`

const VALIDATOR_INSTRUCTIONS = `
Audit all changes made in this session. Use these tools (all available in toolNames):
  - basher          → run terminal commands (git diff, typecheck, tests)
  - code_searcher   → search for patterns (TODO, FIXME, symbol lookup, regex literals)
  - read_files      → read file contents
  - str_replace     → edit files (prefer this)
  - write_file      → create new files
  - spawn_agents    → spawn codebuff/base for fix passes OR metabuff-regex-guard for regex

STEPS:

1. Use basher to get the git diff of changed files:
   git diff HEAD

2. Use read_files to load the current state of each changed file.

3. Use code_searcher to run the self-consistency checklist from your system prompt:
   a. For every import: verify the imported name exists in that module
   b. For every function call: verify the function exists and its signature matches
   c. Search for TODO/FIXME/placeholder strings
   d. Search for /regex/ literals or new RegExp( in changed files

4. REGEX CHECK (v1.1.0):
   If any changed file contains regex literals (/pattern/flags) or new RegExp() calls,
   spawn metabuff-regex-guard BEFORE calling end_turn:
   spawn_agents([{ agent_type: 'metabuff-regex-guard', prompt: 'Scan changes for regex safety.' }])

5. CONSISTENCY CHECK (v1.1.0):
   If any changed file exports a function/type, check whether callers in other changed
   files still match the updated signature. Use code_searcher to find callers.
   Fix any mismatches with str_replace.

6. If issues are found, fix them using str_replace (prefer) or write_file.

7. Re-run tests and compilation using basher after any fix:
   • TypeScript: (bun run typecheck 2>/dev/null || npx tsc --noEmit 2>&1) | head -50
   • Jest/Vitest: (npx vitest run 2>&1 || npx jest 2>&1) | tail -30
   • Bun: bun test 2>&1 | tail -30
   • Go: go build ./... && go test ./...
   • Python: python -m pytest --tb=short 2>&1 | tail -40

8. Report your findings in the format described in your system prompt.`

const definition: AgentDefinition = {
  id: 'metabuff-validator',
  version: '1.1.0',
  displayName: 'MetaBuff Anti-Hallucination Validator',

  spawnerPrompt:
    'Spawn after any MetaBuff coding pipeline to validate changes, ' +
    'catch ghost imports, phantom edits, broken tests, incomplete TODOs, ' +
    'runtime-invalid regex patterns, and function signature mismatches.',

  model: FREE_MODEL,

  reasoningOptions: {
    enabled: true,
    exclude: false,
    effort: 'low',  // Mechanical verification — low effort is fine
  },

  toolNames: [
    'read_files',
    'code_searcher',
    'str_replace',
    'write_file',
    'spawn_agents',
    'suggest_followups',
    'basher',
  ],

  spawnableAgents: [
    'codebuff/base@0.0.1',       // targeted fix passes
    'codebuff/thinker@0.0.1',    // deep analysis of tricky failures
    'metabuff-regex-guard',      // v1.1.0: regex safety scan
  ],

  includeMessageHistory: true,

  systemPrompt: VALIDATOR_SYSTEM_PROMPT,
  instructionsPrompt: VALIDATOR_INSTRUCTIONS,

  stepPrompt:
    'Continue auditing. ' +
    'If you have found and fixed all issues, output your final VALIDATION PASSED/FAILED summary and call end_turn. ' +
    'Do not call end_turn while there are unresolved issues or while a regex scan is pending.',
}

export default definition
