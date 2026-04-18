"use client";

import { useState, useRef, FormEvent } from "react";
import { MessageCircle, Send, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { useTranslations } from "next-intl";

type StaffChatResponse =
  | { type: "data_response"; value: unknown; period: string; branch: string; formattedAnswer: string }
  | { type: "authorization_error" }
  | { type: "error"; message: string };

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  structured?: { value: unknown; period: string; branch: string; formattedAnswer: string };
  isError?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 w-fit">
      <span
        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

function StructuredAnswer({
  value,
  period,
  branch,
  formattedAnswer,
}: {
  value: unknown;
  period: string;
  branch: string;
  formattedAnswer: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm">{formattedAnswer}</p>
      <div className="flex flex-wrap gap-2 mt-1">
        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
          {period}
        </span>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          {branch}
        </span>
        {value !== undefined && value !== null && (
          <span className="text-xs font-semibold text-sky-800">
            {String(value)}
          </span>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? "bg-sky-600 text-white"
            : message.isError
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-slate-100 text-slate-800"
        }`}
      >
        {message.structured ? (
          <StructuredAnswer {...message.structured} />
        ) : (
          <p>{message.content}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Staff-facing chat panel for operational queries.
 * Visible only to authenticated staff from the dashboard.
 * Requirements: 5.1, 5.4, 5.7, 5.8
 */
export function StaffChatPanel() {
  const { user } = useAuth();
  const t = useTranslations("ai");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only render for authenticated staff
  if (!user) return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isTyping) return;

    const userMessage: DisplayMessage = {
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const { data } = await api.post<StaffChatResponse>("/ai/chat/staff", { query });

      let assistantMessage: DisplayMessage;

      if (data.type === "data_response") {
        assistantMessage = {
          role: "assistant",
          content: data.formattedAnswer,
          timestamp: new Date().toISOString(),
          structured: {
            value: data.value,
            period: data.period,
            branch: data.branch,
            formattedAnswer: data.formattedAnswer,
          },
        };
      } else if (data.type === "authorization_error") {
        assistantMessage = {
          role: "assistant",
          content: t("dataNotAccessible"),
          timestamp: new Date().toISOString(),
        };
      } else {
        // error type
        assistantMessage = {
          role: "assistant",
          content: t("assistantUnavailable"),
          timestamp: new Date().toISOString(),
          isError: true,
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t("assistantUnavailable"),
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <Card className="w-full sm:w-80 shadow-xl border-sky-200 flex flex-col" style={{ height: "420px", maxHeight: "calc(100vh - 6rem)" }}>
          <CardHeader className="pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm text-sky-700">
                <MessageCircle size={16} />
                {t("staffAssistant")}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
                aria-label={t("closeChat")}
              >
                <X size={14} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 overflow-hidden p-3 gap-2">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 min-h-0">
              {messages.length === 0 && (
                <p className="text-xs text-slate-400 text-center mt-4">
                  {t("askAbout")}
                </p>
              )}
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("askQuestion")}
                className="text-sm h-8"
                disabled={isTyping}
              />
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 bg-sky-600 hover:bg-sky-700 shrink-0"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
              >
                <Send size={14} />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Toggle button */}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full h-12 w-12 bg-sky-600 hover:bg-sky-700 shadow-lg"
        aria-label={isOpen ? t("closeAssistant") : t("openAssistant")}
      >
        {isOpen ? <ChevronDown size={20} /> : <MessageCircle size={20} />}
      </Button>
    </div>
  );
}
