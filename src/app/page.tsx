"use client";

import { useMemo, useState } from "react";
import VirtualKeyboard from "@/components/ui/VirtualKeyboard";

const TEST_LINES = [
  "the quick brown fox jumps over the lazy dog",
  "build fast and ship clean code every single day",
  "typing rhythm improves with focus and consistency",
  "great products are polished through tiny details",
];

export default function Home() {
  const [typedText, setTypedText] = useState("");
  const [testIndex, setTestIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const targetText = TEST_LINES[testIndex];

  const charCount = typedText.length;
  const correctChars = useMemo(() => {
    let count = 0;
    for (let i = 0; i < typedText.length; i += 1) {
      if (typedText[i] === targetText[i]) count += 1;
    }
    return count;
  }, [typedText, targetText]);

  const accuracy = charCount ? Math.round((correctChars / charCount) * 100) : 100;

  const elapsedMinutes = elapsedMs / 1000 / 60;
  const wpm = elapsedMinutes > 0 ? Math.round((typedText.trim().length / 5) / elapsedMinutes) : 0;

  const handleTextChange = (nextText: string) => {
    const now = Date.now();
    if (!startedAt && nextText.length > 0) {
      setStartedAt(now);
      setElapsedMs(0);
    } else if (startedAt) {
      setElapsedMs(now - startedAt);
    }
    setTypedText(nextText);
  };

  const resetTest = () => {
    setTypedText("");
    setStartedAt(null);
  };

  const nextTest = () => {
    setTestIndex((prev) => (prev + 1) % TEST_LINES.length);
    setTypedText("");
    setStartedAt(null);
  };

  const isFinished = typedText === targetText;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="mb-2 font-mono text-2xl font-bold tracking-tight text-white">
          Virtual Keyboard
        </h1>
        <p className="font-mono text-sm text-gray-500">
          realistic mechanical key samples + typing test
        </p>
      </div>

      <div className="w-full max-w-[46rem] rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-zinc-400">
          Type this line
        </p>
        <p className="mb-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-200">
          {targetText}
        </p>

        <div className="mb-4 flex flex-wrap gap-2 font-mono text-xs">
          <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">WPM: {wpm}</span>
          <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">Accuracy: {accuracy}%</span>
          <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">
            Progress: {Math.min(charCount, targetText.length)}/{targetText.length}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetTest}
            className="rounded border border-zinc-700 px-3 py-1 font-mono text-xs text-zinc-200 transition hover:border-zinc-500"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={nextTest}
            className="rounded border border-zinc-700 px-3 py-1 font-mono text-xs text-zinc-200 transition hover:border-zinc-500"
          >
            Next test
          </button>
          {isFinished ? (
            <span className="ml-1 inline-flex items-center font-mono text-xs text-emerald-300">
              Completed
            </span>
          ) : null}
        </div>
      </div>

      <VirtualKeyboard
        typedText={typedText}
        onTextChange={handleTextChange}
        placeholder="Type the test line above and track your speed."
      />
    </main>
  );
}
