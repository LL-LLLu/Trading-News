"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
} from "react-icons/fi";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTION_KEYS: TranslationKey[] = [
  "chat.q1",
  "chat.q2",
  "chat.q3",
  "chat.q4",
  "chat.q5",
];

export function ChatPanel() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(
    typeof crypto !== "undefined" ? crypto.randomUUID() : "session",
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            sessionId: sessionId.current,
          }),
        });

        if (!response.ok) throw new Error("Chat request failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let assistantContent = "";
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantContent += parsed.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // Skip malformed SSE chunks
              }
            }
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: t("chat.error"),
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleNewChat() {
    setMessages([]);
    sessionId.current =
      typeof crypto !== "undefined" ? crypto.randomUUID() : "session";
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // Floating button (closed state)
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setHasBeenOpened(true);
        }}
        className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-50 group"
      >
        <FiMessageSquare size={22} />
        {/* Indicator dot for first-time visibility */}
        {!hasBeenOpened && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" />
        )}
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-2.5 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {t("chat.title")}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] shadow-2xl flex flex-col transition-all ${
        isExpanded
          ? "inset-4 rounded-sm"
          : "bottom-20 md:bottom-6 right-4 md:right-6 w-[380px] h-[540px] rounded-sm"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E0D8] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#0F4C81] rounded-full" />
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
            {t("chat.title")}
          </h3>
          <span className="text-[10px] text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
            AI
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title={t("chat.newConversation")}
            >
              <FiRefreshCw size={13} />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {isExpanded ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="py-4">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-[#0F4C81]/10 dark:bg-[#5BA3D9]/10 rounded-sm flex items-center justify-center mx-auto mb-3">
                <FiMessageSquare
                  className="text-[#0F4C81] dark:text-[#5BA3D9]"
                  size={24}
                />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {t("chat.title")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {t("chat.desc")}
              </p>
            </div>

            {/* Suggested questions */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider px-1">
                {t("chat.suggested")}
              </p>
              {SUGGESTED_QUESTION_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => sendMessage(t(key))}
                  disabled={isStreaming}
                  className="w-full text-left px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-[#0F4C81]/5 dark:hover:bg-[#5BA3D9]/10 hover:text-[#0F4C81] dark:hover:text-[#5BA3D9] rounded-sm border border-[#E5E0D8] dark:border-[#2D2D2D] hover:border-[#0F4C81]/20 dark:hover:border-[#5BA3D9]/20 transition-colors disabled:opacity-50"
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-sm px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-[#0F4C81] text-white"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700"
              }`}
            >
              {msg.role === "assistant" ? (
                <ChatMarkdown text={msg.content} />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-sm px-4 py-3 border border-gray-100 dark:border-gray-700">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-[#5BA3D9] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#5BA3D9] rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-[#5BA3D9] rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-[#E5E0D8] dark:border-[#2D2D2D]"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder")}
            disabled={isStreaming}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2.5 bg-[#0F4C81] text-white rounded-sm hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <FiSend size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Markdown renderer for assistant messages ──

function ChatMarkdown({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1 my-1.5">
          {listItems.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-sm leading-relaxed"
            >
              <span className="text-[#0F4C81] mt-1 flex-shrink-0 text-[8px]">
                &#9679;
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <p
          key={i}
          className="text-xs font-bold text-gray-900 dark:text-white mt-2.5 mb-1"
        >
          {renderInline(trimmed.slice(4))}
        </p>,
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <p
          key={i}
          className="text-sm font-bold text-gray-900 dark:text-white mt-3 mb-1"
        >
          {renderInline(trimmed.slice(3))}
        </p>,
      );
      continue;
    }

    // Bullet points
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      continue;
    }

    // Numbered lists
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)/);
    if (numberedMatch) {
      listItems.push(numberedMatch[1]);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={i} className="text-sm leading-relaxed my-1">
        {renderInline(trimmed)}
      </p>,
    );
  }

  flushList();

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): ReactNode {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} className="font-semibold text-gray-900 dark:text-white">
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="text-gray-700 dark:text-gray-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
