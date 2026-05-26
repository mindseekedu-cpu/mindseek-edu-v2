"use client";

import { useState, KeyboardEvent, RefObject } from "react";
import { ChatMessage, Question } from "@/types";
import QuestionBox from "@/components/QuestionBox";
import ClueBox from "@/components/ClueBox";
import { FALLBACK_OPTIONS } from "@/lib/constants";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentQuestion: Question | null;
  clueIndex: number;
  showFallback: boolean;
  isLoading: boolean;
  onSend: (message: string) => void;
  onFallbackAction: (action: string) => void;
  bottomRef: RefObject<HTMLDivElement>;
}

export default function ChatInterface({
  messages,
  currentQuestion,
  clueIndex,
  showFallback,
  isLoading,
  onSend,
  onFallbackAction,
  bottomRef,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold">
                {part}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
          {i < content.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="card flex flex-col gap-3 p-0 overflow-hidden">
      <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Ai Mi</p>
          <p className="text-xs text-green-500 font-medium">● Online</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-2 chat-height overflow-y-auto scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {msg.role === "ai" && (
              <span className="text-xs text-gray-400 ml-1">Ai Mi</span>
            )}
            <div
              className={
                msg.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"
              }
            >
              <p className="text-sm leading-relaxed">
                {formatContent(msg.content)}
              </p>
            </div>
            <span className="text-xs text-gray-300 mx-1">
              {msg.timestamp.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}

        {currentQuestion && (
          <div className="flex flex-col items-start gap-2">
            <QuestionBox question={currentQuestion} />
            {clueIndex > 0 && (
              <ClueBox
                clues={currentQuestion.clues}
                activeIndex={clueIndex - 1}
              />
            )}
          </div>
        )}

        {showFallback && (
          <div className="flex flex-col gap-2 animate-fade-in">
            <p className="text-xs text-gray-400 ml-1">Ai Mi</p>
            <div className="chat-bubble-ai flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Pilih langkah berikutnya:
              </p>
              {FALLBACK_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onFallbackAction(option.label)}
                  className="btn-option text-sm"
                >
                  {option.emoji} {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-start gap-2 animate-fade-in">
            <div className="chat-bubble-ai flex items-center gap-1.5 py-3">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesanmu di sini... (Enter untuk kirim)"
          rows={1}
          className="input-chat"
          style={{ minHeight: "44px", maxHeight: "120px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="btn-primary flex items-center justify-center w-11 h-11 px-0 py-0 shrink-0"
          aria-label="Kirim pesan"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}