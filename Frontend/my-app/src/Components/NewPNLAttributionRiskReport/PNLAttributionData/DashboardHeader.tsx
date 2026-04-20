import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, MenuItem, IconButton, Select, OutlinedInput, FormControl, Tooltip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TuneIcon from "@mui/icons-material/Tune";
import { formatCurrency } from "./utils";

const RETIRED_FUNDS = new Set(["FMAP", "MMLS"]);

interface DashboardHeaderProps {
  selection: "all" | string;
  allFundsConfig: string[];
  portfolios: string[];
  onSelectionChange: (val: string) => void;
  onToggleConfigure: () => void;
  configureAllOpen: boolean;
  selectedDate: string;
  onDateChange: (date: string) => void;
  aum?: number;
  exportButton?: React.ReactNode;
  triggersButton?: React.ReactNode;
}

const selectSx = {
  minWidth: 180,
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
    py: 0.75,
    "&:hover": { bgcolor: "rgba(16,185,129,0.1)" },
    "&.Mui-selected": { bgcolor: "rgba(16,185,129,0.12)" },
    "&.Mui-selected:hover": { bgcolor: "rgba(16,185,129,0.18)" },
  },
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
  selection,
  allFundsConfig,
  portfolios,
  onSelectionChange,
  onToggleConfigure,
  configureAllOpen,
  selectedDate,
  onDateChange,
  aum,
  exportButton,
  triggersButton,
}) => {
  const navigate = useNavigate();

  const titleLabel =
    selection === "all"
      ? (allFundsConfig.length === 1 ? `${allFundsConfig[0]} Risk Dashboard` : "All Funds Risk Dashboard")
      : `${selection} Risk Dashboard`;

  return (
    <Box className="risk-dashboard-header">
      <Box className="risk-dashboard-header-left">
        <Box>
          <Box className="risk-dashboard-title">{titleLabel}</Box>
          <Box className="risk-dashboard-subtitle">
            Portfolio Analytics &amp; Monitoring
          </Box>
        </Box>
      </Box>

      <Box className="risk-dashboard-header-right">
        {/* Fund selector — All or single fund */}
        <FormControl size="small">
          <Select
            value={selection}
            onChange={(e) => onSelectionChange(e.target.value)}
            input={<OutlinedInput sx={selectSx} />}
            renderValue={(val) =>
              val === "all"
                ? `All Funds (${allFundsConfig.length})`
                : (val as string)
            }
            MenuProps={{ PaperProps: { sx: menuPaperSx }, disableAutoFocusItem: true }}
            sx={selectSx}
          >
            <MenuItem value="all">
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 3 }}>
                <strong>All Funds</strong>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{allFundsConfig.length} funds</span>
              </Box>
            </MenuItem>
            <Box sx={{ height: "1px", bgcolor: "rgba(255,255,255,0.1)", my: 0.5 }} />
            {portfolios.map((p) => {
              const isRetired = RETIRED_FUNDS.has(p);
              return (
                <MenuItem key={p} value={p}
                  sx={{ opacity: isRetired ? 0.4 : 1, fontStyle: isRetired ? "italic" : "normal" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 2 }}>
                    <span>{p}</span>
                    {isRetired && <span style={{ fontSize: 10, color: "#64748b" }}>retired</span>}
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {/* Configure "All Funds" toggle */}
        <Tooltip title='Configure "All Funds"' placement="bottom">
          <IconButton
            size="small"
            onClick={onToggleConfigure}
            sx={{
              color: configureAllOpen ? "#fff" : "#a0aec0",
              backgroundColor: configureAllOpen ? "rgba(255,255,255,0.15)" : "transparent",
              border: "1px solid",
              borderColor: configureAllOpen ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
              borderRadius: "10px",
              p: 0.75,
              "&:hover": { color: "#fff", borderColor: "rgba(255,255,255,0.5)" },
            }}
          >
            <TuneIcon fontSize="small" />
          </IconButton>
        </Tooltip>

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

        {triggersButton && <Box>{triggersButton}</Box>}
        {exportButton && <Box className="risk-dashboard-export-btn">{exportButton}</Box>}
      </Box>
    </Box>
  );
};

export default DashboardHeader;
