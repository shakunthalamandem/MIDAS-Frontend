import React from "react";
import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { AttributionItem } from "./types";
import { formatCurrency, formatFullCurrency } from "./utils";

interface MetricCard {
  key: string;
  label: string;
  valueKey: keyof AttributionItem;
  pctKey: keyof AttributionItem;
}

const METRIC_CARDS: MetricCard[] = [
  { key: "dtd_pnl", label: "DTD P&L", valueKey: "dtd_pnl", pctKey: "dtd_pnl_pct" },
  { key: "wtd_pnl", label: "WTD P&L", valueKey: "wtd_pnl", pctKey: "wtd_pnl_pct" },
  { key: "ytd_pnl", label: "YTD P&L", valueKey: "ytd_pnl", pctKey: "ytd_pnl_pct" },
  { key: "net_exp", label: "Net Exp", valueKey: "net_exp", pctKey: "net_exp_pct" },
  { key: "beta_adj_net", label: "Beta Adj Net", valueKey: "beta_adj_net", pctKey: "beta_adj_net_pct" },
];

interface AttributionRowCardsProps {
  rowData: AttributionItem;
  selectedCard: string | null;
  accentColor: string;
  onCardClick: (metricKey: string) => void;
  onClose: () => void;
}

const AttributionRowCards: React.FC<AttributionRowCardsProps> = ({
  rowData,
  selectedCard,
  accentColor,
  onCardClick,
  onClose,
}) => {
  return (
    <Box className="attr-row-cards-section">
      <Box className="attr-row-cards-header">
        <Box className="attr-row-cards-title" sx={{ color: accentColor }}>
          {rowData.name}
        </Box>
        <IconButton size="small" onClick={onClose} className="attr-row-cards-close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box className="attr-row-cards-grid">
        {METRIC_CARDS.map((card) => {
          const value = rowData[card.valueKey] as number;
          const pct = rowData[card.pctKey] as number;
          const isSelected = selectedCard === card.key;
          const isPositive = value >= 0;

          return (
            <Box
              key={card.key}
              className={`attr-row-card${isSelected ? " attr-row-card--selected" : ""}`}
              sx={{
                borderColor: isSelected ? accentColor : undefined,
                background: isSelected ? `${accentColor} !important` : undefined,
              }}
              onClick={() => onCardClick(card.key)}
            >
              <Box
                className="attr-row-card-label"
                sx={{ color: isSelected ? "rgba(255,255,255,0.85)" : undefined }}
              >
                {card.label}
              </Box>
              <Box
                className="attr-row-card-value"
                sx={{
                  color: isSelected
                    ? "#fff"
                    : isPositive
                    ? "#059669"
                    : "#dc2626",
                }}
              >
                {formatCurrency(value)}
              </Box>
              <Box
                className="attr-row-card-pct"
                sx={{ color: isSelected ? "rgba(255,255,255,0.7)" : undefined }}
              >
                {pct.toFixed(2)}%
              </Box>

              {/* Hover overlay with full value */}
              {!isSelected && (
                <Box
                  className="attr-row-card-hover-overlay"
                  sx={{ background: `linear-gradient(135deg, ${accentColor}ee, ${accentColor}cc)` }}
                >
                  <Box className="attr-row-card-hover-label">{card.label}</Box>
                  <Box className="attr-row-card-hover-value">{formatFullCurrency(value)}</Box>
                  <Box className="attr-row-card-hover-pct">{pct.toFixed(2)}%</Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default AttributionRowCards;
