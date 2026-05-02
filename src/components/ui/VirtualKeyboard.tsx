"use client";

import { useEffect, useRef, useState } from "react";
import { keyboardLayout, type KeyData } from "@/data/keyboard";
import { useKeyboardSound } from "@/hooks/useKeyboardSound";

// Color palettes: [face, faceDark (pressed), base/side]
const colorPalettes = {
  default: { face: "#F0EEEA", faceActive: "#D8D4CE", base: "#9A9488" },
  modifier: { face: "#F4B8C4", faceActive: "#E09AAA", base: "#B8707C" },
  accent: { face: "#C8E6C0", faceActive: "#A0CCA0", base: "#6AAA78" },
  nav: { face: "#A8C8E4", faceActive: "#8AB0CC", base: "#5A88A8" },
  special: { face: "#F4B8C4", faceActive: "#E09AAA", base: "#B8707C" },
};

interface KeyCapProps {
  data: KeyData;
  isPressed: boolean;
}

function KeyCap({ data, isPressed }: KeyCapProps) {
  const color = data.color ?? "default";
  const width = data.width ?? 2.75;
  const palette = colorPalettes[color];

  const lines = data.label.split("\n");
  const hasShiftLabel = lines.length > 1;

  const baseHeight = isPressed ? 44 : 48;
  const faceColor = isPressed ? palette.faceActive : palette.face;

  return (
    <button
      type="button"
      className="relative flex items-end"
      style={{
        width: `${width}rem`,
        height: "3rem",
      }}
      tabIndex={-1}
      aria-label={data.label || "Space"}
    >
      {/* Base (side of keycap — visible when not pressed) */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden transition-all duration-75 ease-out"
        style={{
          height: `${baseHeight}px`,
          borderRadius: "8px 8px 4px 4px",
          backgroundColor: palette.base,
        }}
      >
        {/* Left facet */}
        <div
          className="absolute left-0 top-0 h-full w-[6px] origin-top-left transition-transform duration-75"
          style={{
            background: `linear-gradient(to right, ${palette.base}, transparent)`,
            transform: `skewY(${isPressed ? "45deg" : "55deg"})`,
            opacity: 0.5,
          }}
        />
        {/* Right facet */}
        <div
          className="absolute right-0 top-0 h-full w-[6px] origin-top-right transition-transform duration-75"
          style={{
            background: `linear-gradient(to left, ${palette.base}, transparent)`,
            transform: `skewY(${isPressed ? "-45deg" : "-55deg"})`,
            opacity: 0.5,
          }}
        />
      </div>

      {/* Face (top surface) */}
      <div
        className="relative z-10 flex w-full items-center justify-center transition-all duration-75 ease-out"
        style={{
          height: "36px",
          margin: "0 2px",
          borderRadius: "5px",
          backgroundColor: faceColor,
          boxShadow: isPressed
            ? "none"
            : "0 1px 0 rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.6)",
          transform: isPressed ? "translateY(3px)" : "translateY(0px)",
        }}
      >
        {hasShiftLabel ? (
          <div className="flex flex-col items-center justify-center gap-0 leading-none">
            <span
              className="font-mono opacity-50"
              style={{ fontSize: width <= 2.5 ? "0.5rem" : "0.55rem", color: "#555" }}
            >
              {lines[0]}
            </span>
            <span
              className="font-mono font-semibold"
              style={{ fontSize: width <= 2.5 ? "0.6rem" : "0.65rem", color: "#333" }}
            >
              {lines[1]}
            </span>
          </div>
        ) : (
          <span
            className="select-none font-mono font-semibold"
            style={{
              fontSize:
                width > 4
                  ? "0.5rem"
                  : width <= 2.25
                    ? "0.5rem"
                    : "0.7rem",
              color: "#333",
              letterSpacing: width > 4 ? "0.05em" : "0",
            }}
          >
            {data.label}
          </span>
        )}
      </div>
    </button>
  );
}

export interface VirtualKeyboardProps {
  /** Text typed by the user, displayed below the keyboard */
  typedText?: string;
  /** Callback when text changes from keyboard input */
  onTextChange?: (text: string) => void;
  /** Whether the keyboard captures global keypresses (default: true) */
  captureInput?: boolean;
  /** Placeholder hint below the keyboard */
  placeholder?: string;
  /** Whether to play mechanical sounds (default: true) */
  soundEnabled?: boolean;
}

export default function VirtualKeyboard({
  typedText,
  onTextChange,
  captureInput = true,
  placeholder = "Type to test the keyboard sound and key animation.",
  soundEnabled = true,
}: VirtualKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [internalText, setInternalText] = useState("");
  const { playKeyDown, playKeyUp } = useKeyboardSound();

  const text = typedText ?? internalText;
  const setText = onTextChange ?? setInternalText;
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (!captureInput) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Tab") e.preventDefault();

      // Only trigger visual press/sound once per physical key press.
      if (!e.repeat) {
        setPressedKeys((prev) => {
          const next = new Set(prev);
          next.add(e.code);
          return next;
        });

        if (soundEnabled) {
          void playKeyDown(e.code);
        }
      }

      const currentText = textRef.current;

      // Handle text input (allow OS key repeat while key is held)
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setText(currentText + e.key);
      } else if (e.code === "Backspace") {
        setText(currentText.slice(0, -1));
      } else if (e.code === "Space") {
        e.preventDefault();
        setText(currentText + " ");
      } else if (e.code === "Enter" && !e.ctrlKey) {
        setText(currentText + "\n");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });

      if (soundEnabled) {
        void playKeyUp(e.code);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [captureInput, soundEnabled, text, setText, playKeyDown, playKeyUp]);

  return (
    <div className="flex w-full max-w-[46rem] flex-col items-center gap-5">
      {/* Keyboard case / housing */}
      <div
        className="relative rounded-t-xl rounded-b-md border border-[#c0bbb2] p-3"
        style={{
          background: "linear-gradient(180deg, #d4d0c8 0%, #c8c4bc 100%)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        {/* Key rows */}
        <div className="flex flex-col gap-[3px]">
          {keyboardLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-[3px]">
              {row.map((keyData) => (
                <KeyCap
                  key={keyData.code}
                  data={keyData}
                  isPressed={pressedKeys.has(keyData.code)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder text */}
      <p className="text-center font-mono text-xs tracking-wide text-gray-500">
        {placeholder}
      </p>

      {/* Typed text display with blinking cursor */}
      <div className="min-h-[1.5rem] w-full max-w-[46rem]">
        <div className="whitespace-pre-wrap break-words font-mono text-base leading-relaxed text-gray-300">
          {text}
          <span className="ml-[1px] inline-block h-[1.2em] w-[2px] animate-pulse bg-gray-400 align-text-bottom" />
        </div>
      </div>
    </div>
  );
}
