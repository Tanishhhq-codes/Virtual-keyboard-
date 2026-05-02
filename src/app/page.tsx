"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import VirtualKeyboard from "@/components/ui/VirtualKeyboard";

const TEST_LINES = [
  "the quick brown fox jumps over the lazy dog",
  "build fast and ship clean code every single day",
  "typing rhythm improves with focus and consistency",
  "great products are polished through tiny details",
];

const TIME_TEST_SECONDS = 60;
const TIME_TEST_TEXT = `${TEST_LINES.join(" ")} ${TEST_LINES.join(" ")}`;

type TestMode = "line" | "time";

interface Attempt {
  id: number;
  mode: TestMode;
  wpm: number;
  netWpm: number;
  cpm: number;
  accuracy: number;
  durationSec: number;
}

export default function Home() {
  const [mode, setMode] = useState<TestMode>("line");
  const [typedText, setTypedText] = useState("");
  const [testIndex, setTestIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [resultSaved, setResultSaved] = useState(false);

  const targetText = mode === "time" ? TIME_TEST_TEXT : TEST_LINES[testIndex];

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
  const remainingSeconds = Math.max(0, TIME_TEST_SECONDS - elapsedSeconds);

  const elapsedMinutes = elapsedMs / 1000 / 60;
  const wpm = elapsedMinutes > 0 ? Math.round((typedText.length / 5) / elapsedMinutes) : 0;
  const netWpm = elapsedMinutes > 0 ? Math.max(0, Math.round(((correctChars - wrongChars) / 5) / elapsedMinutes)) : 0;
  const cpm = elapsedMinutes > 0 ? Math.round(typedText.length / elapsedMinutes) : 0;
  const isFinished = typedText === targetText;
  const isTimeUp = mode === "time" && elapsedSeconds >= TIME_TEST_SECONDS;
  const testEnded = isFinished || isTimeUp;
  const bestWpm = attempts.length ? Math.max(...attempts.map((attempt) => attempt.wpm)) : 0;

  const createAttempt = useCallback((text: string, elapsed: number): Attempt => {
    const minutes = elapsed / 1000 / 60;
    let correct = 0;
    for (let i = 0; i < text.length; i += 1) {
      if (text[i] === targetText[i]) correct += 1;
    }
    const wrong = Math.max(0, text.length - correct);
    const attemptAccuracy = text.length ? Math.round((correct / text.length) * 100) : 100;
    const attemptWpm = minutes > 0 ? Math.round((text.length / 5) / minutes) : 0;
    const attemptNetWpm = minutes > 0 ? Math.max(0, Math.round(((correct - wrong) / 5) / minutes)) : 0;
    const attemptCpm = minutes > 0 ? Math.round(text.length / minutes) : 0;

    return {
      id: Date.now(),
      mode,
      wpm: attemptWpm,
      netWpm: attemptNetWpm,
      cpm: attemptCpm,
      accuracy: attemptAccuracy,
      durationSec: Number((elapsed / 1000).toFixed(1)),
    };
  }, [mode, targetText]);

  useEffect(() => {
    if (!startedAt || testEnded) return;
    const id = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAt;
      if (mode === "time" && nextElapsed >= TIME_TEST_SECONDS * 1000) {
        setElapsedMs(TIME_TEST_SECONDS * 1000);
        if (!resultSaved) {
          const attempt = createAttempt(typedText, TIME_TEST_SECONDS * 1000);
          setAttempts((prev) => [attempt, ...prev].slice(0, 8));
          setResultSaved(true);
        }
        return;
      }
      setElapsedMs(nextElapsed);
    }, 100);
    return () => window.clearInterval(id);
  }, [startedAt, testEnded, mode, resultSaved, typedText, createAttempt]);

  const handleTextChange = (nextText: string) => {
    if (testEnded) return;
    const now = Date.now();
    let nextElapsed = elapsedMs;
    if (!startedAt && nextText.length > 0) {
      setStartedAt(now);
      setElapsedMs(0);
      nextElapsed = 0;
    } else if (startedAt) {
      nextElapsed = now - startedAt;
      setElapsedMs(nextElapsed);
    }
    setTypedText(nextText);

    if (nextText === targetText && !resultSaved) {
      const attempt = createAttempt(nextText, Math.max(1, nextElapsed));
      setAttempts((prev) => [attempt, ...prev].slice(0, 8));
      setResultSaved(true);
    }
  };

  const resetTest = () => {
    setTypedText("");
    setStartedAt(null);
    setElapsedMs(0);
    setResultSaved(false);
  };

  const nextTest = () => {
    setTestIndex((prev) => (prev + 1) % TEST_LINES.length);
    resetTest();
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("line");
            resetTest();
          }}
          className={`rounded border px-3 py-1 font-mono text-xs transition ${
            mode === "line"
              ? "border-cyan-300 bg-cyan-300/10 text-cyan-200"
              : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Line mode
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("time");
            resetTest();
          }}
          className={`rounded border px-3 py-1 font-mono text-xs transition ${
            mode === "time"
              ? "border-cyan-300 bg-cyan-300/10 text-cyan-200"
              : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          60s mode
        </button>
      </div>

      <div className="w-full max-w-[46rem] rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-zinc-400">
          {mode === "time" ? "Type for 60 seconds" : "Type this line"}
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
          {mode === "time" ? (
            <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">
              Remaining: {remainingSeconds.toFixed(1)}s
            </span>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetTest}
            className="rounded border border-zinc-700 px-3 py-1 font-mono text-xs text-zinc-200 transition hover:border-zinc-500"
          >
            Reset
          </button>
          {mode === "line" ? (
            <button
              type="button"
              onClick={nextTest}
              className="rounded border border-zinc-700 px-3 py-1 font-mono text-xs text-zinc-200 transition hover:border-zinc-500"
            >
              Next test
            </button>
          ) : null}
          {isFinished ? (
            <span className="ml-1 inline-flex items-center font-mono text-xs text-emerald-300">
              Completed
            </span>
          ) : null}
          {isTimeUp ? (
            <span className="ml-1 inline-flex items-center font-mono text-xs text-amber-300">
              Time up
            </span>
          ) : null}
        </div>
      </div>

      <div className="w-full max-w-[46rem] rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-wide text-zinc-400">Recent results</p>
          <span className="font-mono text-xs text-zinc-300">Best WPM: {bestWpm}</span>
        </div>
        {attempts.length === 0 ? (
          <p className="font-mono text-sm text-zinc-500">No attempts yet. Start typing to record your first run.</p>
        ) : (
          <div className="space-y-2">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex flex-wrap items-center gap-2 rounded border border-zinc-800 px-2 py-2 font-mono text-xs text-zinc-300"
              >
                <span className="rounded border border-zinc-700 px-2 py-1">{attempt.mode === "time" ? "60s" : "Line"}</span>
                <span className="rounded border border-zinc-700 px-2 py-1">WPM {attempt.wpm}</span>
                <span className="rounded border border-zinc-700 px-2 py-1">Net {attempt.netWpm}</span>
                <span className="rounded border border-zinc-700 px-2 py-1">CPM {attempt.cpm}</span>
                <span className="rounded border border-zinc-700 px-2 py-1">Acc {attempt.accuracy}%</span>
                <span className="rounded border border-zinc-700 px-2 py-1">{attempt.durationSec}s</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <VirtualKeyboard
        typedText={typedText}
        onTextChange={handleTextChange}
        captureInput={!testEnded}
        placeholder={
          mode === "time"
            ? "Type continuously for 60 seconds. Reset to try again."
            : "Type the test line above and track your speed."
        }
      />
    </main>
  );
}
