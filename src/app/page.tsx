"use client";

import { useEffect, useMemo, useState } from "react";
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
  const wrongChars = Math.max(0, charCount - correctChars);

  const accuracy = charCount ? Math.round((correctChars / charCount) * 100) : 100;
  const progress = Math.min(100, Math.round((Math.min(charCount, targetText.length) / targetText.length) * 100));
  const elapsedSeconds = elapsedMs / 1000;

  const elapsedMinutes = elapsedMs / 1000 / 60;
  const wpm = elapsedMinutes > 0 ? Math.round((typedText.length / 5) / elapsedMinutes) : 0;
  const netWpm = elapsedMinutes > 0 ? Math.max(0, Math.round(((correctChars - wrongChars) / 5) / elapsedMinutes)) : 0;
  const cpm = elapsedMinutes > 0 ? Math.round(typedText.length / elapsedMinutes) : 0;
  const isFinished = typedText === targetText;

  useEffect(() => {
    if (!startedAt || isFinished) return;
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 100);
    return () => window.clearInterval(id);
  }, [startedAt, isFinished]);

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
    setElapsedMs(0);
  };

  const nextTest = () => {
    setTestIndex((prev) => (prev + 1) % TEST_LINES.length);
    setTypedText("");
    setStartedAt(null);
    setElapsedMs(0);
  };

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
        <div className="mb-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-sm leading-relaxed">
          {targetText.split("").map((char, idx) => {
            const typed = typedText[idx];
            const isCurrent = idx === typedText.length;
            let className = "text-zinc-500";
            if (typed !== undefined) {
              className = typed === char ? "text-emerald-300" : "text-rose-300";
            } else if (isCurrent) {
              className = "border-b border-cyan-300 text-zinc-200";
            }
            return (
              <span key={`${char}-${idx}`} className={className}>
                {char}
              </span>
            );
          })}
          {typedText.length > targetText.length ? (
            <span className="text-rose-300">{typedText.slice(targetText.length)}</span>
          ) : null}
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-cyan-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2 font-mono text-xs">
          <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">WPM: {wpm}</span>
          <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">Net WPM: {netWpm}</span>
          <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">CPM: {cpm}</span>
          <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">Accuracy: {accuracy}%</span>
          <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">Errors: {wrongChars}</span>
          <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">
            Progress: {Math.min(charCount, targetText.length)}/{targetText.length}
          </span>
          <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">
            Time: {elapsedSeconds.toFixed(1)}s
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
