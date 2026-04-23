import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  Select,
  OutlinedInput,
  FormControl,
  Tooltip,
  Checkbox,
  ListItemText,
  Divider,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TuneIcon from "@mui/icons-material/Tune";
import { formatCurrency } from "./utils";

const RETIRED_FUNDS = new Set(["FMAP", "MMLS"]);
const ALL_VALUE = "__ALL__";

interface DashboardHeaderProps {
  selectedFundList: string[];
  onSelectedFundsChange: (funds: string[]) => void;
  allFundsConfig: string[]; // saved "All Funds" default set (for the Configure panel)
  portfolios: string[];
  onToggleConfigure: () => void;
  configureAllOpen: boolean;
  selectedDate: string;
  onDateChange: (date: string) => void;
  aum?: number;
  exportButton?: React.ReactNode;
  triggersButton?: React.ReactNode;
}

const selectSx = {
  minWidth: 220,
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
  maxHeight: 360,
  "& .MuiMenuItem-root": {
    color: "#e2e8f0",
    fontSize: 13,
    py: 0.5,
    "&:hover": { bgcolor: "rgba(16,185,129,0.1)" },
    "&.Mui-selected": { bgcolor: "transparent" },
    "&.Mui-selected:hover": { bgcolor: "rgba(16,185,129,0.1)" },
  },
  "& .MuiCheckbox-root": { p: 0.5, color: "#94a3b8" },
  "& .MuiCheckbox-root.Mui-checked": { color: "#10b981" },
  "& .MuiCheckbox-root.MuiCheckbox-indeterminate": { color: "#10b981" },
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
  selectedFundList,
  onSelectedFundsChange,
  allFundsConfig,
  portfolios,
  onToggleConfigure,
  configureAllOpen,
  selectedDate,
  onDateChange,
  aum,
  exportButton,
  triggersButton,
}) => {
  const activeFunds = React.useMemo(
    () => portfolios.filter((p) => !RETIRED_FUNDS.has(p)),
    [portfolios],
  );

  // "All" = every non-retired fund is selected
  const allSelected =
    activeFunds.length > 0 && activeFunds.every((f) => selectedFundList.includes(f));
  const someSelected = selectedFundList.length > 0 && !allSelected;

  const titleLabel =
    selectedFundList.length === 0
      ? "Select Funds"
      : selectedFundList.length === 1
      ? `${selectedFundList[0]} Risk Dashboard`
      : allSelected
      ? "All Funds Risk Dashboard"
      : `${selectedFundList.length} Funds Risk Dashboard`;

  const handleChange = (event: any) => {
    const raw = event.target.value as string[];
    // User clicked the "All" master row (MUI added ALL_VALUE to the array).
    if (raw.includes(ALL_VALUE)) {
      // Master "All" toggles only active (non-retired) funds. Any manually-added
      // retired funds are preserved on this toggle.
      const retiredKept = selectedFundList.filter((f) => RETIRED_FUNDS.has(f));
      onSelectedFundsChange(allSelected ? retiredKept : [...activeFunds, ...retiredKept]);
      return;
    }
    // Regular toggle — strip out the ALL marker, keep retired funds if user picked them.
    onSelectedFundsChange(raw.filter((v) => v !== ALL_VALUE));
  };

  const renderValue = () => {
    if (selectedFundList.length === 0) return "Select Funds";
    if (allSelected) return `All Funds (${activeFunds.length})`;
    if (selectedFundList.length === 1) return selectedFundList[0];
    return `${selectedFundList.length} of ${activeFunds.length} selected`;
  };

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
        {/* Fund multi-select dropdown with checkboxes */}
        <FormControl size="small">
          <Select
            multiple
            value={selectedFundList}
            onChange={handleChange}
            input={<OutlinedInput sx={selectSx} />}
            renderValue={renderValue}
            MenuProps={{
              PaperProps: { sx: menuPaperSx },
              disableAutoFocusItem: true,
            }}
            sx={selectSx}
          >
            <MenuItem value={ALL_VALUE} disableRipple>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
              />
              <ListItemText
                primary="All Funds"
                secondary={`${activeFunds.length} funds`}
                primaryTypographyProps={{ fontWeight: 700, color: "#fff" }}
                secondaryTypographyProps={{ fontSize: 11, color: "#94a3b8" }}
              />
            </MenuItem>
            <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.1)" }} />
            {portfolios.map((p) => {
              const isRetired = RETIRED_FUNDS.has(p);
              const checked = selectedFundList.includes(p);
              return (
                <MenuItem
                  key={p}
                  value={p}
                  sx={{
                    opacity: isRetired ? 0.7 : 1,
                    fontStyle: isRetired ? "italic" : "normal",
                  }}
                >
                  <Checkbox size="small" checked={checked} />
                  <ListItemText primary={p} />
                  {isRetired && (
                    <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 8 }}>
                      retired
                    </span>
                  )}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {/* Configure "All Funds" default set */}
        <Tooltip title='Configure default "All Funds" set' placement="bottom">
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
