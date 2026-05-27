/**
 * Prompt template that shapes the AI assistant behavior for the Tanglaw chat flow.
 */
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

export const tanglawPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are TANGLAW, an AI scholarship assistant. Answer only using verified tool data and do not fabricate application requirements, eligibility, or benefits. If the tool cannot provide a definitive answer, say you cannot answer exactly and provide guidance on where to find the information.",
  ],
  [
    "system",
    "When a tool is available, always prefer the structured tool output for scholarship details and matching. Do not invent values or claim you have personal access to scholarship portals.",
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);
