"use client";

import { useState, useRef, useEffect } from "react";
import ModeDropdown from "@/components/ModeDropdown";
import ChatInterface from "@/components/ChatInterface";
import { Mode, ChatMessage, Question, AppState } from "@/types";
import { TRIGGER_PATTERN, WELCOME_MESSAGE } from "@/lib/constants";

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("practice");
  const [appState, setAppState] = useState<AppState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [clueIndex, setClueIndex] = useState<number>(0);
  const [showFallback, setShowFallback] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: "ai" | "user", content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${role}-${Date.now()}`,
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const handleTrigger = async (userMessage: string) => {
    const match = userMessage.match(TRIGGER_PATTERN);
    if (!match) return false;

    const kelas = match[1];
    const topik = match[2];
    const bahasa = match[3];

    setIsLoading(true);
    addMessage("user", userMessage);

    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kelas, topik, bahasa }),
      });

      if (!res.ok) throw new Error("Gagal mengambil soal");

      const data = await res.json();
      setCurrentQuestion(data.question);
      setClueIndex(0);
      setShowFallback(false);
      setAppState("question");

      addMessage(
        "ai",
        `Halo! Senang bertemu kamu, kelas ${kelas} 🎉\nYuk kita mulai belajar **${topik}** dalam bahasa **${bahasa}**!\n\nBerikut soal pertamamu:`
      );
    } catch {
      addMessage("ai", "Maaf, ada kendala saat memuat soal. Coba lagi ya!");
    } finally {
      setIsLoading(false);
    }

    return true;
  };

  const handleAnswer = (userMessage: string) => {
    if (!currentQuestion) return;

    addMessage("user", userMessage);

    const userAnswer = userMessage.trim();
    const isCorrect =
      userAnswer === String(currentQuestion.answer) ||
      userAnswer.toLowerCase().includes(String(currentQuestion.answer));

    if (isCorrect) {
      setAppState("idle");
      setCurrentQuestion(null);
      setClueIndex(0);
      setShowFallback(false);
      addMessage(
        "ai",
        "Luar biasa! Jawaban kamu tepat sekali! 🌟\nKamu hebat! Mau lanjut ke soal berikutnya?"
      );
      return;
    }

    const nextClueIndex = clueIndex + 1;

    if (nextClueIndex > currentQuestion.clues.length) {
      setShowFallback(true);
      addMessage(
        "ai",
        "Belum tepat, ayo coba lagi 💪\nSeperti kelihatannya kamu butuh bantuan lebih. Pilih salah satu ya:"
      );
      return;
    }

    setClueIndex(nextClueIndex);
    const clue = currentQuestion.clues[nextClueIndex - 1];
    addMessage(
      "ai",
      `Belum tepat, ayo coba lagi 💪\n\n💡 **Petunjuk ${nextClueIndex}:** ${clue}`
    );
  };

  const handleSend = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    if (appState === "idle") {
      const triggered = await handleTrigger(userMessage);
      if (!triggered) {
        addMessage("user", userMessage);
        addMessage(
          "ai",
          'Halo! Untuk memulai, ketik:\n"Halo Ai Mi, saya kelas [kelas], topik [topik]. Siap belajar dengan bahasa [bahasa]"\n\nContoh: Halo Ai Mi, saya kelas 1, topik Penjumlahan. Siap belajar dengan bahasa Indonesia'
        );
      }
      return;
    }

    if (appState === "question") {
      handleAnswer(userMessage);
    }
  };

  const handleFallbackAction = (action: string) => {
    alert(`Fitur dalam pengembangan: ${action}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Selamat Datang di{" "}
            <span className="text-blue-600">MindSeek</span>
            <span className="text-purple-500">.edu</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Belajar matematika seru bersama Ai Mi 🤖
          </p>
        </div>
        <ModeDropdown value={mode} onChange={setMode} />
      </div>

      <ChatInterface
        messages={messages}
        currentQuestion={currentQuestion}
        clueIndex={clueIndex}
        showFallback={showFallback}
        isLoading={isLoading}
        onSend={handleSend}
        onFallbackAction={handleFallbackAction}
        bottomRef={bottomRef}
      />
    </div>
  );
}