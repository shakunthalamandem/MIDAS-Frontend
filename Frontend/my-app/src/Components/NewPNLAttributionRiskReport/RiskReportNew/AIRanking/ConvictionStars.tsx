import React from "react";
import { Star } from "lucide-react";

interface ConvictionStarsProps {
  rating: number;
  outOf?: number;
}

export const ConvictionStars: React.FC<ConvictionStarsProps> = ({ rating, outOf = 5 }) => {
  const normalized = Math.max(0, Math.min(outOf, rating));
  const rounded = Math.round(normalized);

  return (
    <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: outOf }).map((_, idx) => (
          <Star key={idx} size={12} className={idx < rounded ? "text-primary" : "text-muted-foreground"} />
        ))}
      </div>
      <span className="text-[9px] font-bold">{normalized.toFixed(1)}</span>
    </div>
  );
};
