import React from "react";
import { Star } from "lucide-react";

interface ConvictionStarsProps {
  rating: number;
  outOf?: number;
}

export const ConvictionStars: React.FC<ConvictionStarsProps> = ({
  rating,
  outOf = 5,
}) => {
  const normalized = Math.max(0, Math.min(outOf, rating));

  const fullStars = Math.floor(normalized);
  const hasHalfStar = normalized - fullStars >= 0.5;
  const emptyStars = outOf - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
      <div className="flex items-center gap-[2px]">
        {/* Full Stars */}
        {Array.from({ length: fullStars }).map((_, idx) => (
          <Star
            key={`full-${idx}`}
            size={12}
            className="text-red-600"
            fill="currentColor"
          />
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <div className="relative">
            <Star size={12} className="text-red-700" />
            <Star
              size={12}
              className="absolute top-0 left-0 text-red-600"
              fill="currentColor"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </div>
        )}

        {/* Empty Stars */}
        {Array.from({ length: emptyStars }).map((_, idx) => (
          <Star
            key={`empty-${idx}`}
            size={12}
            className="text-red-200"
          />
        ))}
      </div>

      <span className="text-[9px] font-bold">
        {normalized.toFixed(1)}
      </span>
    </div>
  );
};