import React from "react";
import {
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import LanguageIcon from "@mui/icons-material/Language";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import { FilterType } from "./types";

type RegionOption = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

type IPOWriteUpControlsProps = {
  headerTitle: string;
  regionFilter: string;
  onRegionChange: (value: string) => void;
  filterType: FilterType;
  onFilterTypeChange: (value: FilterType) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

const regionOptions: RegionOption[] = [
  { label: "US", value: "US", icon: <PublicIcon fontSize="small" /> },
  { label: "APAC", value: "APAC", icon: <LanguageIcon fontSize="small" /> },
  { label: "EMEA", value: "EMEA", icon: <TravelExploreIcon fontSize="small" /> },
  {
    label: "Others",
    value: "NON_US_AMERICA",
    icon: <Diversity3Icon fontSize="small" />,
  },
];

const IPOWriteUpControls: React.FC<IPOWriteUpControlsProps> = ({
  headerTitle,
  regionFilter,
  onRegionChange,
  filterType,
  onFilterTypeChange,
  searchQuery,
  onSearchQueryChange,
}) => {
  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        sx={{ mb: 2, flexWrap: "wrap" }}
      >
        {regionOptions.map((item) => {
          const isSelected = regionFilter === item.value;
          return (
            <Paper
              key={item.value}
              onClick={() => onRegionChange(item.value)}
              sx={{
                px: 2,
                py: 0.6,
                borderRadius: 999,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.8rem",
                border: isSelected ? "1px solid #2b146f" : "1px solid #d7ddea",
                backgroundColor: isSelected ? "#2b146f" : "#ffffff",
                color: isSelected ? "#ffffff" : "#1f2a44",
                boxShadow: isSelected
                  ? "0 8px 18px rgba(43,20,111,0.18)"
                  : "none",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: isSelected ? "#24105f" : "#f6f8fc",
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75}>
                {item.icon}
                <Typography fontWeight={600} color="inherit">
                  {item.label}
                </Typography>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        mb={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          color="#0b2a6b"
          sx={{ lineHeight: 1 }}
        >
          {headerTitle}
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="flex-end"
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          <ToggleButtonGroup
            value={filterType}
            exclusive
            size="small"
            onChange={(_, value: FilterType | null) =>
              value && onFilterTypeChange(value)
            }
            sx={{
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                px: 1.5,
                py: 0.9,
                fontSize: "0.8rem",
                textTransform: "none",
                borderColor: "#cbd5e1",
              },
              "& .Mui-selected": {
                backgroundColor: "#0b2a6b !important",
                color: "#fff !important",
                borderColor: "#0b2a6b !important",
              },
            }}
          >
            <ToggleButton value="upcoming">Upcoming</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            placeholder="Search ticker or companyƒ?Ý"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            size="small"
            sx={{ minWidth: 260, backgroundColor: "#fff", borderRadius: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};

export default IPOWriteUpControls;
