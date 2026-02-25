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
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Full Stars */}
        {Array.from({ length: fullStars }).map((_, idx) => (
          <Star
            key={`full-${idx}`}
            size={16}
            style={{ color: "#f59e0b" }}
            fill="#f59e0b"
          />
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <div style={{ position: "relative", width: 16, height: 16 }}>
            <Star size={16} style={{ color: "#fcd34d" }} />
            <Star
              size={16}
              style={{
                color: "#f59e0b",
                position: "absolute",
                top: 0,
                left: 0,
                clipPath: "inset(0 50% 0 0)",
              }}
              fill="#f59e0b"
            />
          </div>
        )}

        {/* Empty Stars */}
        {Array.from({ length: emptyStars }).map((_, idx) => (
          <Star
            key={`empty-${idx}`}
            size={16}
            style={{ color: "#d4d4d8" }}
          />
        ))}
      </div>

      <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
        {normalized.toFixed(1)}
      </span>
    </div>
  );
};
