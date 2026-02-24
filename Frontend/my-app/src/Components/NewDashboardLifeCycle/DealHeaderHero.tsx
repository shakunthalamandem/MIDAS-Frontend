// components/AIMLResults/DealHeaderHero.tsx
import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PublicIcon from "@mui/icons-material/Public";
import CategoryIcon from "@mui/icons-material/Category";
import type { DealRecord } from "../AIMLResults/types";

type Props = {
  deal: DealRecord;
  fmtPlain: (v: any) => string;
  fmtMoney: (v: any, currency?: string) => string;
};

function MetaPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.85,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.55)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.55))",
        boxShadow: "0 8px 18px rgba(16, 24, 40, 0.08)",
        backdropFilter: "blur(10px)",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          background: "rgba(59,130,246,0.12)",
          color: "#1D4ED8",
          flex: "0 0 auto",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 900,
            color: "rgba(17,24,39,0.60)",
            lineHeight: 1.1,
            letterSpacing: 0.35,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 950,
            color: "#111827",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 220,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

const DealHeaderHero: React.FC<Props> = ({ deal, fmtPlain, fmtMoney }) => {
  const issuer = fmtPlain(deal.issuer_name);
  const ticker = fmtPlain(deal.ticker);
  const region = fmtPlain(deal.region);
  const sector = fmtPlain(deal.sector);
  const rawDealType = fmtPlain(deal.deal_type);
  const normalizedDealType =
    rawDealType === "-" ? "-" : rawDealType.trim().toUpperCase();
  const dealType =
    normalizedDealType === "FO"
      ? "FO"
      : normalizedDealType === "IPO"
        ? "IPO"
        : rawDealType;
  const issuePrice = fmtMoney(deal.issue_price);

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid rgba(207,227,255,0.9)",
        background:"#e0e7f5",
          // "radial-gradient(900px 300px at 10% 10%, rgba(59, 130, 246, 0.22), transparent 55%)," +
          // "radial-gradient(800px 260px at 90% 30%, rgba(99,102,241,0.18), transparent 55%)," +
          // "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))",
        boxShadow: "0 16px 42px rgba(16, 24, 40, 0.10)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {/* Left: issuer + subtitle */}
      <Box sx={{ minWidth: 260 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            minWidth: 0,
            flexWrap: "nowrap",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              background: "rgba(17,24,39,0.86)",
              color: "white",
              boxShadow: "0 10px 22px rgba(16, 24, 40, 0.18)",
              flex: "0 0 auto",
            }}
          >
            <BusinessIcon sx={{ fontSize: 22 }} />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 1100,
              lineHeight: 1.1,
              letterSpacing: 0.3,
              color: "#0B1220",
              minWidth: 0,
              flex: "1 1 auto",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {issuer === "-" ? "Unknown Issuer" : issuer}
          </Typography>

          <Chip
            label={`Priced at ${issuePrice}`}
            sx={{
              flex: "0 0 auto",
              height: 30,
              borderRadius: 999,
              fontWeight: 1000,
              bgcolor: "rgba(59,130,246,0.14)",
              color: "#1D4ED8",
              border: "1px solid rgba(59,130,246,0.22)",
              boxShadow: "0 8px 18px rgba(16, 24, 40, 0.08)",
            }}
          />
        </Box>

        {/* Pills row */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <MetaPill
            icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
            label="Ticker"
            value={ticker}
          />
          <MetaPill
            icon={<PublicIcon sx={{ fontSize: 16 }} />}
            label="Region"
            value={region}
          />
          <MetaPill
            icon={<CategoryIcon sx={{ fontSize: 16 }} />}
            label="Sector"
            value={sector}
          />
        </Box>
      </Box>

      {/* Right: deal type chips */}
      <Box
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
      >
        <Chip
          label={dealType}
          sx={{
            fontWeight: 1000,
            borderRadius: 999,
            px: 0.75,
            bgcolor: "rgba(59,130,246,0.14)",
            color: "#1D4ED8",
            border: "1px solid rgba(59,130,246,0.25)",
          }}
        />
        <Chip
          label={ticker}
          variant="outlined"
          sx={{
            fontWeight: 1000,
            borderRadius: 999,
            px: 0.75,
            borderColor: "rgba(17,24,39,0.18)",
            bgcolor: "rgba(255,255,255,0.55)",
          }}
        />
      </Box>
    </Box>
  );
};

export default DealHeaderHero;
