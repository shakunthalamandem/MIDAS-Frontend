import React from "react";
import { Box, TextField, MenuItem, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { formatCurrency } from "./utils";

interface DashboardHeaderProps {
  selectedFunds: string[];
  portfolios: string[];
  onFundsChange: (funds: string[]) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  aum?: number;
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

const dateInputSx = {
  width: 160,
  "& .MuiOutlinedInput-root": {
    borderRadius: "20px",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "13px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#10b981" },
  },
  "& .MuiInputLabel-root": {
    color: "#a0aec0",
    "&.Mui-focused": { color: "#10b981" },
  },
  "& input": { color: "#fff" },
  "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
};

const shiftDate = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedFunds,
  portfolios,
  onFundsChange,
  selectedDate,
  onDateChange,
  aum,
}) => {
  const allSelected = portfolios.length > 0 && selectedFunds.length === portfolios.length;
  const displayValue = allSelected ? ALL_FUNDS : (selectedFunds[0] || "");

  const handleFundChange = (value: string) => {
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
          onChange={(e) => handleFundChange(e.target.value)}
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

        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <IconButton
            size="small"
            onClick={() => onDateChange(shiftDate(selectedDate, -1))}
            sx={{ color: "#a0aec0", "&:hover": { color: "#fff" } }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>

          <TextField
            type="date"
            size="small"
            label="Date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={dateInputSx}
          />

          <IconButton
            size="small"
            onClick={() => onDateChange(shiftDate(selectedDate, 1))}
            sx={{ color: "#a0aec0", "&:hover": { color: "#fff" } }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

      </Box>
    </Box>
  );
};

export default DashboardHeader;
