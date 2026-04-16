import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, MenuItem, IconButton, Select, Checkbox, ListItemText, OutlinedInput, FormControl, InputLabel, Divider, FormHelperText } from "@mui/material";
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
  exportButton?: React.ReactNode;
  triggersButton?: React.ReactNode;
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

const multiSelectSx = {
  minWidth: 200,
  borderRadius: "20px",
  backgroundColor: "rgba(255,255,255,0.08)",
  color: "#fff",
  "& fieldset": { borderColor: "rgba(255,255,255,0.2)", borderRadius: "20px" },
  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
  "&.Mui-focused fieldset": { borderColor: "#10b981" },
  "& .MuiSvgIcon-root": { color: "#a0aec0" },
  "& .MuiSelect-select": { py: "8.5px" },
};

const menuPaperSx = {
  mt: 0.5,
  bgcolor: "#1a2035",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 2,
  "& .MuiMenuItem-root": {
    color: "#e2e8f0",
    fontSize: 13,
    py: 0.5,
    "&:hover": { bgcolor: "rgba(16,185,129,0.1)" },
    "&.Mui-selected": { bgcolor: "rgba(16,185,129,0.08)" },
    "&.Mui-selected:hover": { bgcolor: "rgba(16,185,129,0.15)" },
  },
  "& .MuiCheckbox-root": { color: "#a0aec0", "&.Mui-checked": { color: "#10b981" } },
  "& .MuiListItemText-primary": { fontSize: 13 },
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
  exportButton,
  triggersButton,
}) => {
  const navigate = useNavigate();
  const allSelected = portfolios.length > 0 && selectedFunds.length === portfolios.length;

  const displayLabel = allSelected
    ? "All Funds"
    : selectedFunds.length === 1
      ? selectedFunds[0]
      : selectedFunds.length > 1
        ? `${selectedFunds.length} Funds`
        : "Select Fund";

  const handleToggleAll = () => {
    onFundsChange(allSelected ? [] : [...portfolios]);
  };

  const handleToggleFund = (fund: string) => {
    if (selectedFunds.includes(fund)) {
      onFundsChange(selectedFunds.filter((f) => f !== fund));
    } else {
      onFundsChange([...selectedFunds, fund]);
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
        {/* <Box className="risk-dashboard-logo">M</Box> */}
        <Box>
          <Box className="risk-dashboard-title">{titleLabel}</Box>
          <Box className="risk-dashboard-subtitle">
            Portfolio Analytics &amp; Monitoring
          </Box>
        </Box>
      </Box>

      <Box className="risk-dashboard-header-right">
        <FormControl size="small" className="risk-dashboard-fund-select" sx={{ minWidth: 200 }} error={selectedFunds.length === 0}>
          <InputLabel sx={{ color: selectedFunds.length === 0 ? "#f87171" : "#a0aec0", "&.Mui-focused": { color: "#10b981" } }}>
            Fund
          </InputLabel>
          <Select
            multiple
            value={selectedFunds}
            input={<OutlinedInput label="Fund" sx={{
              ...multiSelectSx,
              ...(selectedFunds.length === 0 && {
                "& fieldset": { borderColor: "#f87171 !important" },
              }),
            }} />}
            renderValue={() => displayLabel}
            MenuProps={{ PaperProps: { sx: menuPaperSx }, disableAutoFocusItem: true }}
            sx={multiSelectSx}
          >
            {/* All Funds toggle */}
            <MenuItem onClick={handleToggleAll} disableRipple>
              <Checkbox
                checked={allSelected}
                indeterminate={selectedFunds.length > 0 && !allSelected}
                sx={{ color: "#a0aec0", "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "#10b981" } }}
              />
              <ListItemText primary={<strong>All Funds</strong>} />
            </MenuItem>
            <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.1)" }} />
            {portfolios.map((p) => (
              <MenuItem key={p} onClick={() => handleToggleFund(p)} disableRipple>
                <Checkbox
                  checked={selectedFunds.includes(p)}
                  sx={{ color: "#a0aec0", "&.Mui-checked": { color: "#10b981" } }}
                />
                <ListItemText primary={p} />
              </MenuItem>
            ))}
          </Select>
          {selectedFunds.length === 0 && (
            <FormHelperText sx={{ color: "#f87171", fontSize: "11px", mt: 0.5, ml: 1.5, whiteSpace: "nowrap" }}>
              Select at least one fund
            </FormHelperText>
          )}
        </FormControl>

        {aum !== undefined && (
          <Box className="risk-dashboard-aum-badge">
            <Box className="risk-dashboard-aum-badge-label">AUM</Box>
            <Box className="risk-dashboard-aum-badge-value">
              {formatCurrency(aum)}
            </Box>
          </Box>
        )}

        {/* Static date badge shown only in PDF mode */}
        <Box className="risk-dashboard-pdf-date-badge">
          <Box className="risk-dashboard-aum-badge-label">Date</Box>
          <Box className="risk-dashboard-aum-badge-value" sx={{ color: "#fff !important" }}>
            {selectedDate}
          </Box>
        </Box>

        <Box className="risk-dashboard-date-nav" sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
            label="As of Date"
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

        {triggersButton && (
          <Box>{triggersButton}</Box>
        )}

        {exportButton && (
          <Box className="risk-dashboard-export-btn">{exportButton}</Box>
        )}
      </Box>
    </Box>
  );
};

export default DashboardHeader;
