/**
 * API route powering the AI chatbot.
 * Uses LangChain tools and model prompts to stream conversational responses.
 */
import { getGoogleModel } from "@/lib/ai/models";
import { tanglawPrompt } from "@/lib/ai/prompts";
import { searchScholarships, getScholarshipDetails } from "@/lib/ai/tools";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse } from "ai";
import { AgentExecutor, createToolCallingAgent } from "@langchain/classic/agents";
import { z } from "zod";

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request payload." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages } = parsed.data;
    const lastMessage = messages[messages.length - 1];
    const input = lastMessage.content;

    const chatHistory = messages.slice(0, -1).map((m) => {
      if (m.role === "user") {
        return new HumanMessage(m.content);
      } else if (m.role === "assistant") {
        return new AIMessage(m.content);
      }
      return new SystemMessage(m.content);
    });

    const tools = [searchScholarships, getScholarshipDetails];

    const agent = await createToolCallingAgent({
      llm: getGoogleModel(),
      tools,
      prompt: tanglawPrompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    const stream = agentExecutor.streamEvents(
      {
        input,
        chat_history: chatHistory,
      },
      { version: "v2" }
    );

    return createUIMessageStreamResponse({
      stream: toUIMessageStream(stream),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
