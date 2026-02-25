import React from "react";
import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import RegionTabs from "./NewDashboardLifeCycleRegionTabs";

type FilterTab = {
  value: string;
  label: string;
  helper: string;
  icon?: React.ReactNode;
};

type FiltersBarProps = {
  tabs: FilterTab[];
  selectedOp: string;
  onSelectOp: (value: string) => void;
  selectedDealType: "IPO" | "FO";
  onSelectDealType: (value: "IPO" | "FO") => void;
  isPipelineView: boolean;
  liveStartDate: Dayjs | null;
  liveEndDate: Dayjs | null;
  setLiveStartDate: (value: Dayjs | null) => void;
  setLiveEndDate: (value: Dayjs | null) => void;
  regionTabs: ReadonlyArray<{ label: string; value: string; icon: React.ReactNode }>;
  selectedRegion: string;
  onSelectRegion: (value: string) => void;
  dealSearch: string;
  setDealSearch: (value: string) => void;
  pipelineSearch: string;
  setPipelineSearch: (value: string) => void;
  viewMode?: "card" | "table";
  setViewMode?: (value: "card" | "table") => void;
  inline?: boolean;
};

const NewDashboardLifeCycleFiltersBar: React.FC<FiltersBarProps> = ({
  tabs,
  selectedOp,
  onSelectOp,
  selectedDealType,
  onSelectDealType,
  isPipelineView,
  liveStartDate,
  liveEndDate,
  setLiveStartDate,
  setLiveEndDate,
  regionTabs,
  selectedRegion,
  onSelectRegion,
  dealSearch,
  setDealSearch,
  pipelineSearch,
  setPipelineSearch,
  viewMode,
  setViewMode,
  inline = false,
}) => {
  const showDateRange = selectedOp === "live";

  const sectionLabelSx = {
    fontSize: inline ? "0.7rem" : "0.75rem",
    fontWeight: 700,
    color: "#3b4a66",
    textTransform: "none",
    whiteSpace: "nowrap",
  };

  const sectionSx = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    pr: 1,
    pl: 1.1,
    py: 0.35,
    borderRadius: 999,
    border: "1px solid #d7ddea",
    backgroundColor: "#ffffff",
    mr: 0.5,
  };

  const pillGroupSx = {
    backgroundColor: "transparent",
    p: 0.35,
    borderRadius: 9999,
    border: "none",
    display: "inline-flex",
    gap: 0.35,
    flexShrink: 0,
    "& .MuiToggleButtonGroup-grouped": {
      border: 0,
    },
    "& .MuiToggleButton-root": {
      textTransform: "none",
      borderRadius: 9999,
      border: "none",
      px: inline ? 1.3 : 1.7,
      py: 0.3,
      minHeight: inline ? 28 : 32,
      fontWeight: 700,
      fontSize: inline ? "0.72rem" : "0.78rem",
      color: "#5c6680",
      backgroundColor: "transparent",
      transition: "all 0.2s ease",
    },
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: { xs: "wrap", lg: "nowrap" },
          px: { xs: 1.5, md: 2 },
          py: 1.25,
          borderRadius: 2.5,
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          boxShadow: "0 6px 14px rgba(15,23,42,0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Box sx={sectionSx}>
            <Typography sx={sectionLabelSx}>Timing:</Typography>
            <ToggleButtonGroup
              value={selectedOp || tabs[0]?.value}
              exclusive
              onChange={(_e, value) => onSelectOp(value ?? selectedOp)}
              sx={{
                ...pillGroupSx,
                "& .MuiToggleButton-root:hover:not(.Mui-selected)": {
                  backgroundColor: "#6d28d9",
                  color: "#ffffff",
                },
                "& .Mui-selected": {
                  backgroundColor: "#6d28d9",
                  color: "#ffffff",
                },
                "& .Mui-selected:hover": {
                  backgroundColor: "#6d28d9",
                  color: "#ffffff",
                },
              }}
            >
              {tabs.map((option) => (
                <ToggleButton key={option.value} value={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {!isPipelineView && (
            <Box sx={sectionSx}>
              <Typography sx={sectionLabelSx}>Type:</Typography>
              <ToggleButtonGroup
                value={selectedDealType}
                exclusive
                onChange={(_e, value) => value && onSelectDealType(value)}
                sx={{
                  ...pillGroupSx,
                  "& .MuiToggleButton-root:hover:not(.Mui-selected)": {
                    backgroundColor: "#ec4899",
                    color: "#ffffff",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#ec4899",
                    color: "#ffffff",
                  },
                  "& .Mui-selected:hover": {
                    backgroundColor: "#ec4899",
                    color: "#ffffff",
                  },
                }}
              >
                <ToggleButton value="IPO">IPO</ToggleButton>
                <ToggleButton value="FO">FO</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          <Box sx={sectionSx}>
            <Typography sx={sectionLabelSx}>Region:</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <RegionTabs
                tabs={regionTabs}
                selectedRegion={selectedRegion}
                onSelect={onSelectRegion}
                compact
                hoverColor="#16a34a"
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 0 }}>
            {/* <Typography sx={sectionLabelSx}>Search:</Typography> */}
            <TextField
              size="small"
              placeholder="Search..."
              value={isPipelineView ? pipelineSearch : dealSearch}
              onChange={(e) =>
                isPipelineView
                  ? setPipelineSearch(e.target.value)
                  : setDealSearch(e.target.value)
              }
              sx={{
                minWidth: inline ? 180 : 220,
                maxWidth: inline ? 220 : 280,
                flexShrink: 0,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  height: inline ? 32 : 34,
                  backgroundColor: "#ffffff",
                  "& fieldset": {
                    borderColor: "#cfd6e4",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bfc7da",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#b0b9cf",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#8a94a8",
                  opacity: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#8a94a8" }} />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: false }}
            />
          </Box>
        </Box>

        {viewMode && setViewMode && (
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_e, value) =>
              setViewMode((value ?? viewMode) as "card" | "table")
            }
            sx={{
              backgroundColor: "transparent",
              borderRadius: 999,
              border: "1px solid #d7ddea",
              p: 0.35,
              "& .MuiToggleButton-root": {
                border: "none",
                px: 2,
                py: 0.35,
                minWidth: 70,
                color: "#1f2a44",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 999,
                backgroundColor: "#ffffff",
              },
              "& .MuiToggleButton-root:hover": {
                backgroundColor: "#000000",
                color: "#ffffff",
              },
              "& .MuiToggleButton-root.Mui-selected": {
                color: "#ffffff",
                backgroundColor: "#000000",
                boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
              },
              "& .MuiToggleButton-root.Mui-selected:hover": {
                backgroundColor: "#000000",
                color: "#ffffff",
              },
            }}
          >
            <ToggleButton value="card" aria-label="Card view">
              Card
            </ToggleButton>
            <ToggleButton value="table" aria-label="Table view">
              Table
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      {showDateRange && (
        <Box
          sx={{
            mt: 1.5,
            px: { xs: 1.5, md: 2 },
            py: 1.25,
            borderRadius: 2,
            border: "1px solid #f7b948",
            backgroundColor: "#fff8e6",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <CalendarMonthOutlinedIcon sx={{ color: "#d97706" }} />
          <Typography sx={{ fontWeight: 700, color: "#9a5b00" }}>
            Date Range:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction="row" spacing={1} alignItems="center">
              <DatePicker
                label="Start date"
                value={liveStartDate}
                format="DD-MM-YYYY"
                onChange={(value) => {
                  setLiveStartDate(value);
                  if (value && liveEndDate && value.isAfter(liveEndDate)) {
                    setLiveEndDate(value);
                  }
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "dd-mm-yyyy",
                    sx: {
                      minWidth: 120,
                      maxWidth: 160,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        height: 36,
                        backgroundColor: "#ffffff",
                      },
                      "& .MuiInputBase-input": {
                        px: 1,
                      },
                    },
                  },
                }}
              />
              <Typography sx={{ fontWeight: 700, color: "#9a5b00" }}>
                to
              </Typography>
              <DatePicker
                label="End date"
                value={liveEndDate}
                format="DD-MM-YYYY"
                onChange={(value) => {
                  setLiveEndDate(value);
                  if (value && liveStartDate && value.isBefore(liveStartDate)) {
                    setLiveStartDate(value);
                  }
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "dd-mm-yyyy",
                    sx: {
                      minWidth: 120,
                      maxWidth: 160,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        height: 36,
                        backgroundColor: "#ffffff",
                      },
                      "& .MuiInputBase-input": {
                        px: 1,
                      },
                    },
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>
        </Box>
      )}
    </Box>
  );
};

export default NewDashboardLifeCycleFiltersBar;
