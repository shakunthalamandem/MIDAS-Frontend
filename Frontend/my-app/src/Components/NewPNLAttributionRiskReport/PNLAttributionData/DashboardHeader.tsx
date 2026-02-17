import React from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import { formatCurrency, formatDate } from "./utils";

interface DashboardHeaderProps {
  selectedFunds: string[];
  portfolios: string[];
  onFundsChange: (funds: string[]) => void;
  aum?: number;
  asOfDate?: string;
}

const ALL_FUNDS = "All Funds";

const fundSelectSx = {
  minWidth: 200,
  "& .MuiOutlinedInput-root": {
    borderRadius: "20px",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#fff",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#10b981" },
  },
  "& .MuiInputLabel-root": {
    color: "#a0aec0",
    "&.Mui-focused": { color: "#10b981" },
  },
  "& .MuiSvgIcon-root": { color: "#a0aec0" },
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedFunds,
  portfolios,
  onFundsChange,
  aum,
  asOfDate,
}) => {
  const allSelected = portfolios.length > 0 && selectedFunds.length === portfolios.length;

  // Derive the display value for the single-select
  const displayValue = allSelected ? ALL_FUNDS : (selectedFunds[0] || "");

  const handleChange = (value: string) => {
    if (value === ALL_FUNDS) {
      onFundsChange([...portfolios]);
    } else {
      onFundsChange([value]);
    }
  };

  const titleLabel =
    allSelected
      ? "All Funds Risk Dashboard"
      : selectedFunds.length === 1
        ? `${selectedFunds[0]} Risk Dashboard`
        : "Risk Dashboard";

  return (
    <Box className="risk-dashboard-header">
      <Box className="risk-dashboard-header-left">
        <Box className="risk-dashboard-logo">M</Box>
        <Box>
          <Box className="risk-dashboard-title">{titleLabel}</Box>
          <Box className="risk-dashboard-subtitle">
            Portfolio Analytics &amp; Monitoring
          </Box>
        </Box>
      </Box>

      <Box className="risk-dashboard-header-right">
        <TextField
          select
          size="small"
          label="Fund"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          className="risk-dashboard-fund-select"
          sx={fundSelectSx}
        >
          <MenuItem value={ALL_FUNDS}>{ALL_FUNDS}</MenuItem>
          {portfolios.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>

        {aum !== undefined && (
          <Box className="risk-dashboard-aum-badge">
            <Box className="risk-dashboard-aum-badge-label">AUM</Box>
            <Box className="risk-dashboard-aum-badge-value">
              {formatCurrency(aum)}
            </Box>
          </Box>
        )}

        {asOfDate && (
          <Box className="risk-dashboard-date-badge">
            <Box className="risk-dashboard-date-label">AS OF</Box>
            <Box className="risk-dashboard-date-value">
              {formatDate(asOfDate)}
            </Box>
          </Box>
        )}

        <Box className="risk-dashboard-live-indicator">
          <Box className="risk-dashboard-live-dot" />
          <Box className="risk-dashboard-live-text">LIVE</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
