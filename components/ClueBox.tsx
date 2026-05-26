"use client";

interface ClueBoxProps {
  clues: string[];
  activeIndex: number;
}

export default function ClueBox({ clues, activeIndex }: ClueBoxProps) {
  const visibleClues = clues.slice(0, activeIndex + 1);

  return (
    <div className="w-full max-w-[85%] flex flex-col gap-2 animate-fade-in">
      <div className="flex items-center gap-1.5 ml-1">
        <span className="text-sm">💡</span>
        <p className="text-xs font-semibold text-yellow-700">
          Petunjuk ({activeIndex + 1} dari {clues.length})
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {visibleClues.map((clue, index) => (
          <div
            key={index}
            className="clue-step"
            style={{
              animationDelay: `${index * 80}ms`,
            }}
          >
            <div className="shrink-0 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-yellow-900">
                {index + 1}
              </span>
            </div>
            <p className="leading-snug">{clue}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 ml-1 mt-0.5">
        {clues.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index <= activeIndex
                ? "bg-yellow-400 w-5"
                : "bg-gray-200 w-3"
            }`}
          />
        ))}
      </div>
    </div>
  );
}