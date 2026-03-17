import React from "react";

interface SentimentBarProps {
  score: number;
  label?: string;
}

export const SentimentBar: React.FC<SentimentBarProps> = ({ score, label = "Sentiment" }) => {
  const clampedScore = Math.max(-1, Math.min(1, score));
  const percent = ((clampedScore + 1) / 2) * 100;
  const fillColor = clampedScore >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="font-semibold text-foreground">{(clampedScore * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-border/70 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-150"
          style={{ width: `${percent}%`, background: fillColor }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.3em]">
        <span>Bearish</span>
        <span>Bullish</span>
      </div>
    </div>
  );
};
