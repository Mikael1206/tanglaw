/**
 * AI model configuration used by the frontend chatbot and tool agent.
 */
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

const googleApiKey = process.env.GOOGLE_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

export function getGoogleModel() {
  if (!googleApiKey) {
    throw new Error(
      "Missing GOOGLE_API_KEY environment variable. Set GOOGLE_API_KEY for Google GenerativeAI or configure an alternative model."
    );
  }

  return new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: googleApiKey,
  });
}

export function getGroqModel() {
  if (!groqApiKey) {
    throw new Error(
      "Missing GROQ_API_KEY environment variable. Set GROQ_API_KEY for ChatGroq or configure an alternative model."
    );
  }

  return new ChatGroq({
    model: "llama3-8b-8192",
    apiKey: groqApiKey,
  });
}
