import React from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import { formatCurrency, formatDate } from "./utils";

interface DashboardHeaderProps {
  selectedFund: string;
  portfolios: string[];
  onFundChange: (fund: string) => void;
  aum?: number;
  asOfDate?: string;
}

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
  selectedFund,
  portfolios,
  onFundChange,
  aum,
  asOfDate,
}) => {
  return (
    <Box className="risk-dashboard-header">
      <Box className="risk-dashboard-header-left">
        <Box className="risk-dashboard-logo">M</Box>
        <Box>
          <Box className="risk-dashboard-title">
            {selectedFund ? `${selectedFund} Risk Dashboard` : "Risk Dashboard"}
          </Box>
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
          value={selectedFund}
          onChange={(e) => onFundChange(e.target.value)}
          className="risk-dashboard-fund-select"
          sx={fundSelectSx}
        >
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
