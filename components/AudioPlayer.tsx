"use client";

import { useEffect, useRef, useState } from "react";
import { TranscriptLine } from "@/lib/types";

interface AudioPlayerProps {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  transcriptLines: TranscriptLine[];
}

export default function AudioPlayer({ isPlaying, duration, currentTime, transcriptLines }: AudioPlayerProps) {
  const [waveformBars] = useState(() =>
    Array.from({ length: 60 }, () => Math.random() * 0.7 + 0.3)
  );
  const [isMuted, setIsMuted] = useState(false);
  const lastSpokenIndex = useRef(-1);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Speak new transcript lines as they arrive
  useEffect(() => {
    if (!synthRef.current || isMuted || !isPlaying) return;

    const newLines = transcriptLines.slice(lastSpokenIndex.current + 1);
    for (const line of newLines) {
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.rate = 1.1;
      utterance.pitch = line.speaker === "Doctor" ? 0.9 : 1.1;
      utterance.volume = 0.8;

      // Try to pick different voices for doctor vs patient
      const voices = synthRef.current.getVoices();
      if (voices.length > 1) {
        if (line.speaker === "Doctor") {
          // Pick a deeper/male voice if available
          const maleVoice = voices.find(v => v.name.toLowerCase().includes("male") || v.name.includes("David") || v.name.includes("Mark"));
          if (maleVoice) utterance.voice = maleVoice;
        } else {
          // Pick a female voice for patient
          const femaleVoice = voices.find(v => v.name.toLowerCase().includes("female") || v.name.includes("Zira") || v.name.includes("Susan"));
          if (femaleVoice) utterance.voice = femaleVoice;
        }
      }

      synthRef.current.speak(utterance);
    }
    lastSpokenIndex.current = transcriptLines.length - 1;
  }, [transcriptLines, isMuted, isPlaying]);

  // Stop speech when processing stops
  useEffect(() => {
    if (!isPlaying && synthRef.current) {
      synthRef.current.cancel();
    }
  }, [isPlaying]);

  // Reset spoken index when new session starts
  useEffect(() => {
    if (transcriptLines.length === 0) {
      lastSpokenIndex.current = -1;
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    }
  }, [transcriptLines.length]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg p-3">
      {/* Waveform visualization */}
      <div className="flex items-center gap-[2px] h-12 mb-2">
        {waveformBars.map((height, i) => {
          const barProgress = (i / waveformBars.length) * 100;
          const isPast = barProgress < progress;
          const isCurrent = Math.abs(barProgress - progress) < 2;

          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isCurrent
                  ? "bg-indigo-400"
                  : isPast
                  ? "bg-indigo-500/60"
                  : "bg-gray-700/50"
              }`}
              style={{
                height: `${height * 100}%`,
                transform: isPlaying && isCurrent ? "scaleY(1.2)" : "scaleY(1)",
              }}
            />
          );
        })}
      </div>

      {/* Progress bar + controls */}
      <div className="flex items-center gap-3">
        {/* Mute/Unmute button */}
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            if (!isMuted && synthRef.current) {
              synthRef.current.cancel();
            }
          }}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#12121a] border border-[#2e2e3e] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        {/* Progress bar */}
        <div className="flex-1">
          <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full bg-indigo-500 rounded-full transition-all duration-300 ${
                isPlaying ? "progress-glow" : ""
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time display */}
        <span className="text-xs text-gray-500 flex-shrink-0 w-20 text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Audio status */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {isPlaying && (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400">Playing audio (TTS)</span>
            </>
          )}
        </div>
        {isMuted && (
          <span className="text-xs text-yellow-500">🔇 Audio muted</span>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
