"use client";

/**
 * Mini chatbot component for the dashboard.
 * On desktop: floating resizable panel anchored to bottom-right.
 * On mobile (< 640px): bottom sheet that slides up from the bottom like a native app.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, Send, HelpCircle, GripHorizontal } from "lucide-react";
import { createChatMessage, getChatMessages, sendChatMessage } from "@/lib/backend";
import type { BackendMessage } from "@/lib/backend";

const MIN_WIDTH = 280;
const MAX_WIDTH = 800;
const MIN_HEIGHT = 280;
const SMALL_SCREEN_BREAKPOINT = 640;

function getIsMobile() {
  return typeof window !== "undefined" && window.innerWidth < SMALL_SCREEN_BREAKPOINT;
}

function getDefaultWidth() {
  return getIsMobile() ? Math.min(340, typeof window !== "undefined" ? window.innerWidth - 32 : 340) : 384;
}

function getDefaultHeight() {
  return getIsMobile() ? 380 : 520;
}

function getMaxHeight() {
  return typeof window !== "undefined" ? window.innerHeight * 0.85 : 800;
}

function getMaxWidth() {
  return typeof window !== "undefined" ? Math.min(800, window.innerWidth - 24) : 800;
}

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

export default function OwelChatbot({ variant = "floating" }: { variant?: "floating" | "inline" }) {
  const [isOpen, setIsOpen] = useState(variant === "inline");
  const [panelWidth, setPanelWidth] = useState(getDefaultWidth);
  const [panelHeight, setPanelHeight] = useState(getDefaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);
  const panelDimsRef = useRef({ width: getDefaultWidth(), height: getDefaultHeight() });

  // Mobile bottom-sheet state
  const [isMobile, setIsMobile] = useState(() => getIsMobile());
  const [sheetVisible, setSheetVisible] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the ref in sync with state so resize callbacks always read current dims
  panelDimsRef.current = { width: panelWidth, height: panelHeight };
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
            storedMessages.map((msg: BackendMessage) => ({
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

  // Track mobile / desktop changes
  useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Trigger slide-up animation after mount on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      const raf = requestAnimationFrame(() => setSheetVisible(true));
      return () => cancelAnimationFrame(raf);
    } else if (!isOpen) {
      setSheetVisible(false);
    }
  }, [isOpen, isMobile]);

  // Update max height when window resizes
  useEffect(() => {
    const handleWindowResize = () => {
      setPanelHeight((prev) => Math.min(prev, getMaxHeight()));
    };
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  // ── Resize handlers (desktop only) ──────────────────────────────────────

  const handleResizeStart = useCallback((clientX: number, clientY: number) => {
    setIsResizing(true);
    const dims = panelDimsRef.current;
    resizeRef.current = {
      startX: clientX,
      startY: clientY,
      startWidth: dims.width,
      startHeight: dims.height,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleResizeStart(e.clientX, e.clientY);
  }, [handleResizeStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    handleResizeStart(touch.clientX, touch.clientY);
  }, [handleResizeStart]);

  useEffect(() => {
    if (!isResizing) return;

    const applyResize = (clientX: number, clientY: number) => {
      if (!resizeRef.current) return;
      const deltaX = clientX - resizeRef.current.startX;
      const deltaY = clientY - resizeRef.current.startY;
      const maxH = getMaxHeight();
      const maxW = getMaxWidth();

      const newWidth = Math.min(maxW, Math.max(MIN_WIDTH, resizeRef.current.startWidth - deltaX));
      const newHeight = Math.min(maxH, Math.max(MIN_HEIGHT, resizeRef.current.startHeight - deltaY));

      setPanelWidth(newWidth);
      setPanelHeight(newHeight);
    };

    const handleMouseMove = (e: MouseEvent) => applyResize(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      applyResize(touch.clientX, touch.clientY);
    };

    const endResize = () => {
      setIsResizing(false);
      resizeRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", endResize);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", endResize);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", endResize);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", endResize);
    };
  }, [isResizing]);

  // ── Close helpers ──────────────────────────────────────────────────────

  const handleOpen = useCallback(() => {
    // Cancel any pending close timeout to prevent race condition
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    if (isMobile) {
      setSheetVisible(false);
      // Clear any stale timeout before scheduling a new one
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = setTimeout(() => {
        closeTimeoutRef.current = null;
        setIsOpen(false);
      }, 300);
    } else {
      setIsOpen(false);
    }
  }, [isMobile]);

  // Prevent body scroll when mobile sheet is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, isMobile]);

  // ── Message handling ───────────────────────────────────────────────────

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

      let replyText: string;
      let aiGenerated = false;

      if (matchingPrompt) {
        replyText = matchingPrompt.reply;
      } else {
        try {
          const { answer } = await sendChatMessage(textToSend);
          replyText = answer;
          aiGenerated = true;
        } catch (error) {
          console.error("AI chat failed, using generic fallback:", error);
          replyText = `Hoot! I've noted your question: "${textToSend}". As your AI assistant, I recommend browsing the Scholarships page or using the review engine for deeper guidance.`;
        }
      }

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
          metadata: { source: aiGenerated ? "ai-rag" : "preloaded", aiFallback: !matchingPrompt && !aiGenerated },
        });
      } catch (error) {
        console.error("Failed to save assistant message:", error);
      }

      setIsTyping(false);
    }, 900);
  };

  // ── Shared panel body (used by both desktop & mobile) ──────────────────

  const panelBody = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[color:var(--theme-surface)]/80 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-[color:var(--theme-surface)] flex items-center justify-center shadow-lg">
            <Image
              src="/assets/owel-head.png"
              alt="Owel Mascot"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-[color:var(--theme-typography-main)]">Owel Assistant</p>
            <p className="text-[10px] text-[color:var(--theme-text-muted)]">Live guidance for dashboard users</p>
          </div>
        </div>
        {variant === "floating" && (
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-[color:var(--theme-text-body)] hover:bg-base-light focus:outline-none"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[color:var(--theme-surface)]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm ${
                msg.sender === "user"
                  ? "bg-primary text-white rounded-br-none"
                  : "bg-base-pastel text-[color:var(--theme-typography-main)] rounded-bl-none"
              }`}
            >
              {msg.text}
              <span className="block text-[9px] text-[color:var(--theme-text-muted)] text-right mt-2">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-3xl bg-base-pastel px-4 py-3 text-sm shadow-sm">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--theme-typography-secondary)] animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--theme-typography-secondary)] animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--theme-typography-secondary)] animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      <div className="p-3 bg-[color:var(--theme-surface)] border-t border-accent-muted/20 flex-shrink-0">
        <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[color:var(--theme-text-muted)] font-bold flex items-center gap-2">
          <HelpCircle className="h-3 w-3" /> Quick Questions
        </div>
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
          {PRELOADED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt.query)}
              className="rounded-full border border-white/10 bg-[color:var(--theme-canvas)]/90 px-3 py-2 text-[11px] text-[color:var(--theme-text-body)] hover:bg-primary/10 transition"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="flex items-center gap-2 p-3 bg-[color:var(--theme-surface)] flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Owel about grants..."
          className="flex-1 rounded-full border border-white/10 bg-base-light/70 px-4 py-2 text-sm text-[color:var(--theme-typography-main)] focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────

  if (variant === "inline") {
    return (
      <div className="flex flex-col rounded-[2rem] bg-[color:var(--theme-surface)]/90 border border-accent-muted/40 shadow-2xl overflow-hidden h-[500px] w-full">
        {panelBody}
      </div>
    );
  }

  return (
    <>
      {/* ── Trigger button (hidden when mobile sheet is open) ──────────── */}
      <div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 font-sans ${
          isOpen && isMobile ? "hidden" : ""
        }`}
      >
        {!isOpen && (
          <button
            onClick={handleOpen}
            className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-transparent text-primary shadow-2xl hover:scale-105 transition-transform duration-300 focus:outline-none"
            aria-label="Open Owel chat"
          >
            <Image
              src="/assets/owel-head.png"
              alt="Owel Mascot"
              width={44}
              height={44}
              className="rounded-full object-cover sm:w-12 sm:h-12"
            />
          </button>
        )}
      </div>

      {/* ── Desktop floating panel ─────────────────────────────────────── */}
      {isOpen && !isMobile && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 font-sans">
          <div
            className={`relative flex flex-col rounded-[2rem] bg-[color:var(--theme-surface)]/95 shadow-2xl backdrop-blur-xl overflow-hidden border border-white/5 shadow-[var(--theme-glow-ai)] transition-shadow duration-300 ${
              isResizing ? "select-none" : ""
            }`}
            style={{
              width: panelWidth,
              maxWidth: "calc(100vw - 2rem)",
              height: panelHeight,
            }}
          >
            {panelBody}

            {/* Resize handle — top-left corner */}
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize flex items-start justify-start p-0.5 group touch-none"
              aria-label="Resize chat panel from top-left"
              role="slider"
              tabIndex={-1}
            >
              <GripHorizontal className="h-4 w-4 text-[color:var(--theme-text-muted)] group-hover:text-[color:var(--theme-text-body)] transition-colors -rotate-45" />
            </div>

            {/* Resize handle — bottom-left corner */}
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize flex items-end justify-start p-0.5 group touch-none"
              aria-label="Resize chat panel from bottom-left"
              role="slider"
              tabIndex={-1}
            >
              <GripHorizontal className="h-4 w-4 text-[color:var(--theme-text-muted)] group-hover:text-[color:var(--theme-text-body)] transition-colors rotate-45" />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom sheet ────────────────────────────────────────── */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-50 font-sans">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              sheetVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            className={`absolute inset-x-0 bottom-0 bg-[color:var(--theme-surface)] rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
              sheetVisible ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-[color:var(--theme-borders-system)]/50" />
            </div>

            {panelBody}
          </div>
        </div>
      )}
    </>
  );
}
