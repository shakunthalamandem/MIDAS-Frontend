import React from "react";
import {
  Container,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import DealsFilters from "../Main/NewDealsLifeCycle/DealsFilters";

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
  dealSearch: string;
  setDealSearch: (value: string) => void;
  pipelineSearch: string;
  setPipelineSearch: (value: string) => void;
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
  dealSearch,
  setDealSearch,
  pipelineSearch,
  setPipelineSearch,
}) => {
  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
          px: 1,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Container maxWidth="xl" sx={{ flexGrow: 1, minWidth: { xs: "100%", md: "auto" } }}>
          <DealsFilters selectedOp={selectedOp} onChange={onSelectOp} options={tabs} />
        </Container>
      </Container>

      <Container
        maxWidth="xl"
        sx={{
          mb: 1.5,
          px: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
          justifyContent: "space-between",
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        {!isPipelineView && (
          <ToggleButtonGroup
            value={selectedDealType}
            exclusive
            onChange={(_e, value) => value && onSelectDealType(value)}
            sx={{
              backgroundColor: "#f2f4f8",
              p: 0.4,
              borderRadius: 9999,
              border: "1px solid #d7ddea",
              display: "inline-flex",
              gap: 0.5,
              flexShrink: 0,
              ml: "auto",
              "& .MuiToggleButtonGroup-grouped": {
                border: 0,
              },
              "& .MuiToggleButton-root": {
                textTransform: "none",
                borderRadius: 9999,
                border: 0,
                px: 2,
                py: 0.5,
                fontWeight: 700,
                fontSize: "0.8rem",
                color: "#6a7286",
                backgroundColor: "transparent",
                transition: "all 0.2s ease",
              },
              "& .Mui-selected": {
                backgroundColor: "#2b146f",
                color: "#ffffff",
                boxShadow: "0 6px 14px rgba(43,20,111,0.2)",
              },
            }}
          >
            <ToggleButton value="IPO">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontWeight={700} color="inherit">
                  IPO
                </Typography>
              </Stack>
            </ToggleButton>
            <ToggleButton value="FO">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontWeight={700} color="inherit">
                  FO
                </Typography>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
        )}


        {selectedOp === "live" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
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
                      minWidth: 160,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 999,
                        height: 36,
                        backgroundColor: "#ffffff",
                      },
                    },
                  },
                }}
              />
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
                      minWidth: 160,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 999,
                        height: 36,
                        backgroundColor: "#ffffff",
                      },
                    },
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>
        )}

        {!isPipelineView && (
          <TextField
            size="small"
            placeholder="Search"
            value={dealSearch}
            onChange={(e) => setDealSearch(e.target.value)}
            sx={{
              minWidth: 220,
              flexShrink: 0,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                height: 36,
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
        )}

        {isPipelineView && (
          <TextField
            size="small"
            placeholder="Search"
            value={pipelineSearch}
            onChange={(e) => setPipelineSearch(e.target.value)}
            sx={{
              minWidth: 220,
              flexShrink: 0,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                height: 36,
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
        )}
      </Container>
    </>
  );
};

export default NewDashboardLifeCycleFiltersBar;
