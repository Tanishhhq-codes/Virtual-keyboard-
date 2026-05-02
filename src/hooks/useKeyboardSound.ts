"use client";

import { useCallback, useRef } from "react";

const SAMPLE_NAMES = [
  "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
  "space","enter","tab","backspace","shift","caps lock","[","]",
] as const;

const SAMPLE_BY_CODE: Record<string, string> = {
  Space: "space",
  Enter: "enter",
  NumpadEnter: "enter",
  Tab: "tab",
  Backspace: "backspace",
  ShiftLeft: "shift",
  ShiftRight: "shift",
  CapsLock: "caps lock",
  BracketLeft: "[",
  BracketRight: "]",
};

export function useKeyboardSound() {
  const contextRef = useRef<AudioContext | null>(null);
  const downMasterRef = useRef<GainNode | null>(null);
  const upMasterRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const bufferMapRef = useRef<Map<string, AudioBuffer>>(new Map());
  const isLoadingRef = useRef(false);

  const ensureAudioChain = useCallback(async () => {
    if (typeof window === "undefined") return null;

    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }

    const ctx = contextRef.current;

    if (!downMasterRef.current || !upMasterRef.current || !compressorRef.current) {
      const downMaster = ctx.createGain();
      downMaster.gain.value = 0.8;
      const upMaster = ctx.createGain();
      upMaster.gain.value = 0.35;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 25;
      compressor.ratio.value = 10;
      compressor.attack.value = 0.002;
      compressor.release.value = 0.06;

      downMaster.connect(compressor);
      upMaster.connect(compressor);
      compressor.connect(ctx.destination);

      downMasterRef.current = downMaster;
      upMasterRef.current = upMaster;
      compressorRef.current = compressor;
    }

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (!bufferMapRef.current.size && !isLoadingRef.current) {
      isLoadingRef.current = true;
      try {
        const loaded = await Promise.all(
          SAMPLE_NAMES.map(async (name) => {
            const response = await fetch(`/sounds/nk-cream/${encodeURIComponent(name)}.wav`);
            if (!response.ok) return null;
            const data = await response.arrayBuffer();
            const buffer = await ctx.decodeAudioData(data);
            return [name, buffer] as const;
          })
        );

        loaded.forEach((entry) => {
          if (!entry) return;
          bufferMapRef.current.set(entry[0], entry[1]);
        });
      } finally {
        isLoadingRef.current = false;
      }
    }

    return { ctx, downOut: downMasterRef.current, upOut: upMasterRef.current };
  }, []);

  const getSampleName = useCallback((code: string) => {
    if (SAMPLE_BY_CODE[code]) return SAMPLE_BY_CODE[code];
    if (code.startsWith("Key")) return code.slice(3).toLowerCase();
    return null;
  }, []);

  const playBuffer = useCallback(
    (ctx: AudioContext, out: GainNode, buffer: AudioBuffer, volume: number, rate: number, startTime: number) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = rate;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(0.16, buffer.duration));

      source.connect(gain);
      gain.connect(out);
      source.start(startTime);
    },
    []
  );

  const pickFallback = useCallback(() => {
    const pool = ["a", "s", "d", "f", "j", "k", "l", "space", "enter"];
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const playKeyDown = useCallback(async (code: string) => {
    const chain = await ensureAudioChain();
    if (!chain) return;
    const { ctx, downOut } = chain;
    if (!downOut) return;

    const name = getSampleName(code) ?? pickFallback();
    const primary = bufferMapRef.current.get(name) ?? bufferMapRef.current.get(pickFallback());
    if (!primary) return;

    const now = ctx.currentTime;
    playBuffer(ctx, downOut, primary, 0.9 + Math.random() * 0.12, 0.96 + Math.random() * 0.06, now);

    // Layer a second close sample quietly for fuller, more realistic body.
    const secondaryName = pickFallback();
    const secondary = bufferMapRef.current.get(secondaryName);
    if (secondary) {
      playBuffer(ctx, downOut, secondary, 0.22 + Math.random() * 0.08, 0.9 + Math.random() * 0.05, now + 0.0025);
    }
  }, [ensureAudioChain, getSampleName, pickFallback, playBuffer]);

  const playKeyUp = useCallback(async (code: string) => {
    const chain = await ensureAudioChain();
    if (!chain) return;
    const { ctx, upOut } = chain;
    if (!upOut) return;

    const name = getSampleName(code) ?? "enter";
    const buffer = bufferMapRef.current.get(name) ?? bufferMapRef.current.get("tab");
    if (!buffer) return;

    const now = ctx.currentTime;
    playBuffer(ctx, upOut, buffer, 0.16 + Math.random() * 0.08, 1.06 + Math.random() * 0.08, now);
  }, [ensureAudioChain, getSampleName, playBuffer]);

  return { playKeyDown, playKeyUp };
}
