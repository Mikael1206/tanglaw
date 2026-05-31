"use client";

/**
 * Mini chatbot component for the dashboard.
 * Uses a set of preloaded prompts and simple simulated responses.
 */
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Send, HelpCircle } from "lucide-react";
import { createChatMessage, getChatMessages } from "@/lib/backend";

interface Message {
  id: string;
  sender: "user" | "owel";
  text: string;
  timestamp: Date;
}

const PRELOADED_PROMPTS = [
  {
    label: "What scholarships fit a BSCS student?",
    query: "Owel, what scholarships fit a BSCS student?",
    reply:
      "As a BSCS (Computer Science) student, you have excellent options.\n\n1. **DOST-SEI Undergraduate Scholarship**: Perfect for STEM majors. Covers tuition, monthly allowance (₱7,000/mo), and book subsidies.\n2. **CHED Merit Scholarship Program**: For students with high GWAs. Offers up to ₱120,000/year.\n3. **Mega-Tech Local Grants**: Corporate-sponsored grants offering direct internship placements after graduation.",
  },
  {
    label: "Am I eligible for local grants?",
    query: "Am I eligible for local grants?",
    reply:
      "Local government grants (e.g., Mayor's Scholarships, City educational assistance) typically require:\n\n- **Residency**: Proof of residence in the sponsoring city.\n- **Enrollment**: Registration in a state university or accredited local college.\n- **Income Bracket**: Sponsoring cities usually prioritize students whose family income falls in lower brackets (below ₱300,000/yr).",
  },
  {
    label: "How does the Readiness Check work?",
    query: "How does the Readiness Check work?",
    reply:
      "The **TANGLAW Interactive Readiness Check** is a gamified, timed mock assessment tool. It measures your core competencies in:\n- Mathematics\n- Science\n- English\n- Filipino\n\nConfigure your quiz length (up to 25 items) and difficulty tier (1-5) on the Readiness page to test your knowledge!",
  },
  {
    label: "What are the return-of-service terms?",
    query: "What are the return-of-service terms?",
    reply:
      "Return of Service (ROS) is common for high-value government grants. For example, **DOST-SEI** requires you to work in the Philippines in your field of study for a duration equal to the number of years you enjoyed the scholarship. It's a wonderful way to give back to local science and technology!",
  },
];

export default function OwelChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "owel",
      text: "Hoot! Hello! I'm Owel, your academic navigation companion. I can help you search scholarships, check eligibility criteria, or explain return-of-service terms. Ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadChatHistory() {
      try {
        const storedMessages = await getChatMessages();

        if (!active) return;

        if (storedMessages.length > 0) {
          setMessages(
            storedMessages.map((msg: any) => ({
              id: msg.id,
              sender: msg.role === "user" ? "user" : "owel",
              text: msg.content,
              timestamp: new Date(msg.createdAt),
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load chat history from backend:", error);
      }
    }

    loadChatHistory();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      await createChatMessage({
        role: "user",
        content: textToSend,
        metadata: { source: "frontend" },
      });
    } catch (error) {
      console.error("Failed to save user message:", error);
    }

    setTimeout(async () => {
      const matchingPrompt = PRELOADED_PROMPTS.find(
        (p) => p.query.toLowerCase() === textToSend.toLowerCase() || p.label.toLowerCase() === textToSend.toLowerCase()
      );

      const replyText = matchingPrompt
        ? matchingPrompt.reply
        : `Hoot! I've noted your question: "${textToSend}". As your AI assistant, I recommend browsing the Scholarships page or using the review engine for deeper guidance.`;

      const owelMsg: Message = {
        id: `owel-${Date.now()}`,
        sender: "owel",
        text: replyText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, owelMsg]);

      try {
        await createChatMessage({
          role: "assistant",
          content: replyText,
          metadata: { source: "frontend", aiFallback: true },
        });
      } catch (error) {
        console.error("Failed to save assistant message:", error);
      }

      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-transparent text-primary shadow-2xl hover:scale-105 transition-transform duration-300 focus:outline-none"
          aria-label="Open Owel chat"
        >
          <Image
            src="/assets/owel-head.png"
            alt="Owel Mascot"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        </button>
      )}

      {isOpen && (
        <div className="flex flex-col w-96 max-w-[calc(100vw-2rem)] h-[520px] rounded-[2rem] bg-white/95 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-white/80">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-white flex items-center justify-center shadow-lg">
                <Image
                  src="/assets/owel-head.png"
                  alt="Owel Mascot"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Owel Assistant</p>
                <p className="text-[10px] text-zinc-500">Live guidance for dashboard users</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-zinc-700 hover:bg-base-light focus:outline-none"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-base-pastel text-zinc-900 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                  <span className="block text-[9px] text-zinc-500 text-right mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-3xl bg-base-pastel px-4 py-3 text-sm shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-accent-muted/20">
            <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-bold flex items-center gap-2">
              <HelpCircle className="h-3 w-3" /> Quick Questions
            </div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
              {PRELOADED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt.query)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-[11px] text-zinc-700 hover:bg-primary/10 transition"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-2 p-3 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Owel about grants..."
              className="flex-1 rounded-full border border-zinc-200 bg-base-light/70 px-4 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
