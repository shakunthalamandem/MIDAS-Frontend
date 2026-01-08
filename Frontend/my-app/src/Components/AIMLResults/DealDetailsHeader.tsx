// src/components/DealDetailsHeader.tsx
import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { DealRecord } from "./types";

const getDaySuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatPricingDate = (date: string | null | undefined): string => {
  if (!date || !date.trim()) return "TBD";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date; // fallback to raw string

  const day = parsed.getDate();
  const suffix = getDaySuffix(day);
  const month = parsed.toLocaleString(undefined, { month: "long" });
  const year = parsed.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
};

interface DealDetailsHeaderProps {
  deal: DealRecord;
}

const DealDetailsHeader: React.FC<DealDetailsHeaderProps> = ({ deal }) => {
  const pricingDateText = formatPricingDate(deal.trade_date);

  const issuer = deal.issuer_name || "Unknown issuer";
  const ticker = deal.ticker || "";
  const region = deal.region || "";
  const sector = deal.sector || "";
  const dealType = deal.deal_type || "deal";
  const foType = deal.fo_type || "";

  const hasTBD = pricingDateText === "TBD";

  const dealKindPhrase =
    foType && !dealType.toLowerCase().includes(foType.toLowerCase())
      ? `${dealType} – ${foType}`
      : dealType;

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 1.5,
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(90deg, ${alpha(
                theme.palette.primary.light,
                0.18
              )}, ${theme.palette.background.paper})`
            : alpha(theme.palette.primary.dark, 0.3),
        borderRadius: 2,
        px: 1.6,
        py: 1.2,
      })}
    >
      {/* LEFT: Narrative sentence */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          <Box component="span" sx={{ fontWeight: 600 }}>
            {issuer}
          </Box>{" "}
          {ticker && (
            <Box
              component="span"
              sx={(theme) => ({
                fontWeight: 700,
                fontSize: "0.9rem",
                ml: 0.4,
                mr: 0.8,
                px: 0.75,
                py: 0.15,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                backgroundColor:
                  theme.palette.mode === "light"
                    ? theme.palette.common.white
                    : theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.7)}`,
              })}
            >
              {ticker}
            </Box>
          )}
          {hasTBD ? " is planning a " : " has recently priced a "}
          <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
            {dealKindPhrase}
          </Box>{" "}
          {hasTBD ? "with pricing date " : "on "}
          <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
            {pricingDateText}
          </Box>
          {region && (
            <>
              {" "}
              in the{" "}
              <Box
                component="span"
                sx={{ fontWeight: 600, color: "secondary.main" }}
              >
                {region}
              </Box>{" "}
              region
            </>
          )}
          {sector && (
            <>
              {" in the "}
              <Box component="span" sx={{ fontWeight: 600, color: "#000000" }}>
                {sector}
              </Box>
              {" sector."}
            </>
          )}
        </Typography>
      </Box>

      {/* RIGHT: Compact deal tags */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.6,
          alignItems: "center",
          justifyContent: { xs: "flex-start", sm: "flex-end" },
          minWidth: 0,
        }}
      >
        {deal.deal_type && (
          <Chip
            label={deal.deal_type}
            size="small"
            color="primary"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          />
        )}
        {deal.fo_type && (
          <Chip
            label={deal.fo_type}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default DealDetailsHeader;
