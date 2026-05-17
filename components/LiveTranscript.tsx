"use client";

import { useEffect, useRef } from "react";
import { TranscriptLine } from "@/lib/types";

interface LiveTranscriptProps {
  lines: TranscriptLine[];
  isProcessing: boolean;
}

export default function LiveTranscript({ lines, isProcessing }: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[#1e1e2e] flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Live Transcript</h3>
        {isProcessing && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400">Listening</span>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin min-h-[300px] max-h-[500px]"
      >
        {lines.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            <p>Transcript will appear here when processing starts...</p>
          </div>
        ) : (
          lines.map((line, index) => (
            <div key={index} className="animate-fade-in">
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    line.speaker === "Doctor"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {line.speaker === "Doctor" ? "Dr" : "Pt"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-xs font-medium ${
                        line.speaker === "Doctor" ? "text-blue-400" : "text-amber-400"
                      }`}
                    >
                      {line.speaker}
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatTimestamp(line.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">{line.text}</p>
                </div>
              </div>
            </div>
          ))
        )}

        {isProcessing && lines.length > 0 && (
          <div className="flex items-center gap-2 text-gray-500 text-xs pl-11">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span>Transcribing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
