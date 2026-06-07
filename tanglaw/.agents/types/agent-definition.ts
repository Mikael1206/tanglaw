export interface AgentDefinition {
  id: string
  version: string
  displayName: string
  spawnerPrompt: string
  model: string
  reasoningOptions?: {
    enabled: boolean
    exclude: boolean
    effort: 'low' | 'medium' | 'high'
  }
  toolNames: string[]
  spawnableAgents: string[]
  systemPrompt: string
  instructionsPrompt?: string
  stepPrompt?: string
  includeMessageHistory?: boolean
  /** Generator function for programmatic orchestration flow */
  handleSteps?: (context: { prompt: string }) => Generator<unknown, void, unknown>
}
