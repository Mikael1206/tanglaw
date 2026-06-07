/**
 * MetaBuff Security — Security Analyst Specialist
 * ─────────────────────────────────────────────────
 * Handles security-critical aspects of complex tasks:
 *   • Authentication and authorization flows
 *   • Input validation and sanitization
 *   • Secrets management (never hardcoded, always env vars)
 *   • SQL injection, XSS, and injection attack surfaces
 *   • Rate limiting and abuse prevention
 *   • Access control (who can see/do what)
 *
 * Spawned by metabuff-mega for the 'security' subtask category.
 * Can also be spawned directly for security audits.
 */

import { AgentDefinition } from './types/agent-definition'

const FREE_MODEL = 'deepseek/deepseek-v4-pro'  // Primary; falls back to deepseek-v4-flash when unavailable

/** Common insecure patterns to search for and eliminate */
const SECURITY_RED_FLAGS = [
  // Hardcoded secrets
  'password.*=.*["\'][^"\']+["\']',
  'secret.*=.*["\'][^"\']+["\']',
  'api_key.*=.*["\'][^"\']+["\']',
  'token.*=.*["\'][^"\']+["\']',

  // Dangerous operations
  'eval\\(',
  'innerHTML.*=',
  'dangerouslySetInnerHTML',
  'exec\\(',

  // SQL injection surfaces
  '\\$\\{.*\\}.*WHERE',
  'query.*\\+.*req\\.',

  // Weak crypto
  'md5', 'sha1', 'Math.random.*token', 'Math.random.*secret',
]

const definition: AgentDefinition = {
  id: 'metabuff-security',
  version: '1.0.0',
  displayName: 'MetaBuff Security Analyst',

  spawnerPrompt:
    'Spawn for security-critical work: authentication, authorization, input validation, ' +
    'secrets management, SQL injection prevention, or any feature touching user data.',

  model: FREE_MODEL,

  reasoningOptions: {
    enabled: true,
    exclude: false,
    effort: 'high',  // security mistakes are expensive — always think hard
  },

  toolNames: [
    'read_files',
    'code_searcher',
    'file_picker',
    'str_replace',
    'write_file',
    'basher',
    'spawn_agents',
    'think_deeply',
    'glob',
    'end_turn',
  ],

  spawnableAgents: [
    'codebuff/thinker@0.0.1',
  ],

  systemPrompt: `You are MetaBuff's security specialist.
You treat every user input as potentially malicious until proven otherwise.

YOUR FOCUS:
  • Authentication: session management, JWT validation, OAuth flows
  • Authorization: every route/action must check permissions before executing
  • Input validation: reject bad data at the boundary, never in the core
  • Secrets: environment variables only — never in source code or git
  • SQL: parameterized queries only — never string concatenation
  • XSS: sanitize before rendering any user-supplied HTML
  • CSRF: verify tokens on all state-changing requests
  • Rate limiting: protect all public endpoints from abuse

SECURITY DEFAULTS (apply unless codebase explicitly opts out with a comment):
  • Deny by default — if unsure, block
  • Fail secure — errors should not grant access
  • Least privilege — request only the permissions the code actually needs
  • Defense in depth — don't rely on a single layer

NEVER:
  • Hardcode credentials, API keys, passwords, or secrets
  • Use deprecated crypto (MD5, SHA-1, DES, RC4)
  • Trust client-supplied IDs for authorization decisions
  • Log sensitive data (passwords, tokens, PII)`,

  instructionsPrompt: `
For your assigned security subtask:

1. Audit the codebase for known vulnerabilities:
${SECURITY_RED_FLAGS.map((_, i) => `   code_searcher searchQueries: [{ pattern: "${SECURITY_RED_FLAGS[i].replace(/"/g, '\\"')}" }]`).join('\n')}
   (and run code_searcher for the remaining patterns relevant to your subtask)

2. Read all files related to authentication and authorization:
   - Auth middleware, guards, decorators
   - Route definitions (look for missing auth middleware)
   - User model and session handling

3. Check secrets management:
   - Search for hardcoded credentials: use code_searcher with pattern "password.*=.*\\""
   - Verify .env.example exists and .env is in .gitignore
   - Confirm all secret reads go through process.env or a secrets manager

4. Implement your fixes:
   - Add missing input validation at API boundaries
   - Add missing authorization checks before data access
   - Replace any hardcoded secrets with environment variable references
   - Replace any raw SQL concatenation with parameterized queries

5. Add security comments:
   // SECURITY: [why this validation/check is necessary]

6. Verify nothing is broken:
   - Run the test suite after your changes
   - Specifically run any auth-related tests`,

  stepPrompt:
    'Continue the security work. ' +
    'Fix all vulnerabilities you have identified. ' +
    'Call end_turn only when all red flags are resolved and tests pass.',
}

export default definition
