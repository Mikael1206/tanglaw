/**
 * MetaBuff Regex Guard — Pattern Safety Validator v1.0.0
 * ───────────────────────────────────────────────────────
 * Catches an entire class of bugs that TypeScript's type checker CANNOT:
 * runtime-invalid regex patterns embedded in syntactically valid TS/JS code.
 *
 * Example: `new RegExp('\\d+{,3}')` compiles fine in TypeScript but throws
 * `SyntaxError: Invalid regular expression` at runtime.
 *
 * WHAT IT CATCHES:
 *   1. Invalid regex syntax      — patterns that throw SyntaxError at runtime
 *   2. Unclosed groups/classes   — missing ) ] } in regex literals
 *   3. Invalid flags             — flag characters outside [gimsuy] in TS/JS
 *   4. ReDoS patterns            — nested quantifiers like (a+)+ causing catastrophic backtracking
 *   5. Bad string-based regexes  — incorrect double-escaping in new RegExp('...')
 *   6. Empty alternation         — (a||b) unintentionally matches empty string
 *   7. Unanchored validators     — forgot ^ or $ in patterns meant to validate full strings
 *
 * WHERE SPAWNED:
 *   • metabuff.ts       — after basher typecheck in both simple and complex pipelines
 *   • metabuff-mega.ts  — after synthesis review in the mega pipeline
 *   • metabuff-validator.ts — as an additional spawn when regex-adjacent patterns found
 *
 * SAFETY GUARANTEE:
 *   AI agents (including DeepSeek V4 Flash) frequently generate regex patterns that are
 *   syntactically plausible but semantically broken. This guard runs independently of
 *   the TypeScript compiler and catches issues the compiler misses.
 *
 * INLINING NOTE:
 *   REGEX_SCAN_COMMAND and REDOS_CHECK_PATTERNS are module-level constants
 *   used in SYSTEM/INSTRUCTIONS props (evaluated at import time) — safe.
 *   No handleSteps — behaviour driven entirely by systemPrompt + instructionsPrompt.
 */

import { AgentDefinition } from './types/agent-definition'

const FREE_MODEL = 'deepseek/deepseek-v4-pro'  // Primary; falls back to deepseek-v4-flash when unavailable

/**
 * Shell script that validates regex patterns in all changed .ts/.tsx/.js files.
 *
 * Strategy:
 *   1. Collect changed (tracked) + new (untracked) .ts/.tsx/.js files
 *   2. Extract regex literals with grep (handles /pattern/flags syntax)
 *   3. Validate each via Node.js new RegExp() — the same engine JS uses at runtime
 *   4. Check for ReDoS-prone nested quantifiers
 *   5. Check for new RegExp(string) calls with suspicious escape sequences
 *
 * NOTE: The grep pattern captures most literal regexes but not dynamic regexes
 * built via string concatenation. Those require code_searcher inspection.
 */
const REGEX_SCAN_COMMAND = [
  // Collect files
  'TS_CHANGED=$(git diff HEAD --name-only 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$")',
  'TS_NEW=$(git ls-files --others --exclude-standard 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$")',
  'ALL_FILES=$(printf "%s\\n%s" "$TS_CHANGED" "$TS_NEW" | grep -v "^$" | sort -u)',
  'if [ -z "$ALL_FILES" ]; then echo "REGEX GUARD: No JS/TS files changed."; exit 0; fi',
  'echo "=== REGEX GUARD v1.0.0: Scanning changed files ==="',
  'GUARD_ERRORS=0',

  // Phase 1: Validate regex literal syntax via Node
  'echo "--- Phase 1: Regex literal syntax ---"',
  'for FILE in $ALL_FILES; do',
  '  [ -f "$FILE" ] || continue',
  '  PATTERNS=$(grep -oP "(?<![\'\"\\\\=!<>])\/(?:[^\\/\\n\\r]|\\\\.)+\/[gimsuy]*(?=[^a-zA-Z]|$)" "$FILE" 2>/dev/null | head -50 || true)',
  '  [ -z "$PATTERNS" ] && continue',
  '  while IFS= read -r PAT; do',
  '    [ -z "$PAT" ] && continue',
  '    INNER=$(echo "$PAT" | sed -E "s|^/(.+)/[gimsuy]*$|\\1|")',
  '    RESULT=$(node -e "try{new RegExp(String.raw\\`$INNER\\`);process.exit(0)}catch(e){console.log(\\"❌ INVALID in $FILE: $PAT → \\"+e.message);process.exit(1)}" 2>&1)',
  '    if [ $? -ne 0 ]; then echo "$RESULT"; GUARD_ERRORS=$((GUARD_ERRORS+1)); fi',
  '  done <<< "$PATTERNS"',
  'done',

  // Phase 2: ReDoS detection — nested quantifiers
  'echo "--- Phase 2: ReDoS pattern check ---"',
  'for FILE in $ALL_FILES; do',
  '  [ -f "$FILE" ] || continue',
  '  REDOS=$(grep -nP "\\([^)]+[+*]\\)[+*{]|\\([^)]+\\)\\{[0-9]+," "$FILE" 2>/dev/null || true)',
  '  if [ -n "$REDOS" ]; then',
  '    echo "⚠️  POTENTIAL ReDoS in $FILE (nested quantifiers):"',
  '    echo "$REDOS" | head -5',
  '    GUARD_ERRORS=$((GUARD_ERRORS+1))',
  '  fi',
  'done',

  // Phase 3: new RegExp(string) double-escape inspection
  'echo "--- Phase 3: new RegExp(string) escape check ---"',
  'for FILE in $ALL_FILES; do',
  '  [ -f "$FILE" ] || continue',
  '  BAD_ESC=$(grep -nP "new RegExp\\([\'\"]\\\\" "$FILE" 2>/dev/null | grep -vP "new RegExp\\([\'\"](\\\\\\\\[dwsWDS\\^$.|?*+()\\[\\]{}ntrbBfvuU0])" || true)',
  '  if [ -n "$BAD_ESC" ]; then',
  '    echo "⚠️  Suspicious single-backslash in new RegExp() in $FILE:"',
  '    echo "$BAD_ESC" | head -5',
  '    echo "  Hint: In new RegExp strings, \\\\d must be written as \\\\\\\\d"',
  '  fi',
  'done',

  // Phase 4: Empty alternation check
  'echo "--- Phase 4: Empty alternation check ---"',
  'for FILE in $ALL_FILES; do',
  '  [ -f "$FILE" ] || continue',
  '  EMPTY_ALT=$(grep -nP "/[^/]*\\|\\|[^/]*/" "$FILE" 2>/dev/null || true)',
  '  if [ -n "$EMPTY_ALT" ]; then',
  '    echo "⚠️  Empty alternation (||) in regex in $FILE — matches empty string:"',
  '    echo "$EMPTY_ALT" | head -3',
  '  fi',
  'done',

  // Summary
  'echo "=== REGEX GUARD: Complete ==="',
  'if [ "$GUARD_ERRORS" -gt 0 ]; then',
  '  echo "❌ REGEX GUARD FAILED — $GUARD_ERRORS error(s) need fixing"',
  '  exit 1',
  'else',
  '  echo "✅ REGEX GUARD PASSED — no syntax errors detected"',
  'fi',
].join('\n')

const REGEX_GUARD_SYSTEM = `You are MetaBuff's regex safety specialist.
You close the gap between TypeScript type safety and runtime regex correctness.

TypeScript will NOT catch these. You will:
  1. SyntaxError patterns — new RegExp('\\d+{,3}') compiles; throws at runtime
  2. ReDoS patterns       — (email+)+ is valid syntax; O(2^n) matching time
  3. Escape mismatches    — \\d in a RegExp string needs \\\\d; one backslash is wrong
  4. Empty alternation    — /foo||bar/ accidentally matches empty string
  5. Missing anchors      — /\\d+/ used as a full-string validator matches partial strings

SCOPE:
  • TypeScript regex literals: /pattern/flags
  • RegExp constructor calls: new RegExp('pattern', 'flags')
  • String.prototype methods with regex args: .match() .replace() .search() .split() .replaceAll()
  • Dynamic regexes: new RegExp(variable + suffix)  ← flag for human review

FIX PROTOCOL:
  1. Run the REGEX_SCAN_COMMAND via basher to get all issues
  2. For each issue: read the file, understand the intent, fix the pattern
  3. Use str_replace — surgical, targeted changes only
  4. Add a comment: // REGEX: [what this pattern does and why the fix is correct]
  5. Re-run the scan on the fixed file to confirm the error is gone

NEVER:
  ✗ Change the INTENT of a regex — only fix syntax/safety issues
  ✗ Silently skip a ReDoS warning without either fixing or documenting it
  ✗ Leave a partially-fixed regex — verify it still matches what it's supposed to`

const REGEX_GUARD_INSTRUCTIONS = `
For your regex guard pass:

1. Run the full scan via basher:
   (The full shell script is included in your BASHER_SCAN section below)

2. Triage each finding:
   A. INVALID REGEX (❌) — must fix before end_turn
      • Read the file to understand the intended pattern
      • Fix the syntax error (unclosed group, bad escape, invalid quantifier)
      • Re-run scan after fix to confirm ✅

   B. ReDoS (⚠️) — must fix or document
      • Determine if the pattern is genuinely catastrophic or a false positive
      • If catastrophic: rewrite using non-backtracking equivalent or possessive quantifier
      • If false positive: add // REGEX: ReDoS-safe because [explanation]

   C. Suspicious escape (⚠️) — investigate and fix if wrong
      • Check if the pattern produces the intended matches via node -e
      • Fix double-escape issues: '\\d' → '\\\\d' in new RegExp() strings

   D. Empty alternation (⚠️) — investigate and fix if unintentional
      • Check if the empty match case is intentional
      • If unintentional: remove one pipe character

3. For each fix: narrate the change:
   "✓ FIXED: [file]:[line] — [what was wrong] → [what the correct form is]"

4. Final summary:
   REGEX GUARD PASSED — [N patterns scanned, N issues fixed, 0 remaining]
   OR
   REGEX GUARD NEEDS HUMAN REVIEW — [list patterns too complex to auto-fix]

──── BASHER_SCAN ────────────────────────────────────────────────
Run this exact command via basher:

${REGEX_SCAN_COMMAND}
────────────────────────────────────────────────────────────────`

const definition: AgentDefinition = {
  id: 'metabuff-regex-guard',
  version: '1.0.0',
  displayName: 'MetaBuff Regex Guard',

  spawnerPrompt:
    'Spawn after any code change involving regex patterns, string validation, ' +
    'URL matching, input parsing, or any feature where incorrect regex causes a ' +
    'runtime exception or security gap. ' +
    'ALSO spawn proactively on ALL AI-generated code — LLMs frequently produce ' +
    'runtime-invalid regex that TypeScript\'s type checker silently accepts.',

  model: FREE_MODEL,

  reasoningOptions: {
    enabled: true,
    exclude: false,
    effort: 'medium',  // Regex analysis is mechanical — medium effort sufficient
  },

  toolNames: [
    'read_files',
    'code_searcher',
    'str_replace',
    'write_file',
    'basher',
    'glob',
    'end_turn',
  ],

  spawnableAgents: [],  // Standalone — no sub-agents needed

  includeMessageHistory: true,

  systemPrompt: REGEX_GUARD_SYSTEM,
  instructionsPrompt: REGEX_GUARD_INSTRUCTIONS,

  stepPrompt:
    'Continue the regex audit. Fix all ❌ errors and ⚠️ ReDoS warnings. ' +
    'Call end_turn only when the basher scan reports REGEX GUARD PASSED ' +
    'with 0 errors remaining.',
}

export default definition
