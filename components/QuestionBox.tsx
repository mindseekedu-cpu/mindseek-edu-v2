"use client";

import { Question } from "@/types";

interface QuestionBoxProps {
  question: Question;
}

export default function QuestionBox({ question }: QuestionBoxProps) {
  return (
    <div className="w-full max-w-[85%] animate-slide-up">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl rounded-tl-sm p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📚</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {question.meta?.kelas && (
              <span className="badge badge-blue">
                Kelas {question.meta.kelas}
              </span>
            )}
            {question.meta?.topik && (
              <span className="badge badge-purple">{question.meta.topik}</span>
            )}
            {question.meta?.bahasa && (
              <span className="badge badge-green">{question.meta.bahasa}</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-blue-100 shadow-sm">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
            Soal
          </p>
          <p className="text-base font-semibold text-gray-800 leading-snug">
            {question.text}
          </p>
        </div>

        <p className="text-xs text-gray-400 mt-2.5 text-right">
          Ketik jawabanmu di bawah 👇
        </p>
      </div>
    </div>
  );
}