import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import LanguageIcon from "@mui/icons-material/Language";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import SearchIcon from "@mui/icons-material/Search";
import ExpectedPipelineDealsTable from "./ExpectedPipelineDealsTable";

const FuturePipelineDealsMain = () => {
  const [selectedRegion, setSelectedRegion] = useState<
    "US" | "EMEA" | "APAC"
  >("US");
  const [selectedDealType, setSelectedDealType] = useState<"IPO" | "FO">("IPO");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedRegion !== "US") {
      setSelectedDealType("IPO");
    }
  }, [selectedRegion]);

  const regionTabs = [
    { label: "US", value: "US", icon: <PublicIcon fontSize="small" /> },
    { label: "APAC", value: "APAC", icon: <LanguageIcon fontSize="small" /> },
    { label: "EMEA", value: "EMEA", icon: <TravelExploreIcon fontSize="small" /> },
  ] as const;

  return (
    <>
           <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "#FFFFFF",
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                  backgroundColor: "#002060",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "4vh",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  textAlign: "center",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  animation: "fadeIn 1.5s ease-in-out",
                  "@keyframes fadeIn": {
                    "0%": { opacity: 0 },
                    "100%": { opacity: 1 },
                  },
                }}
              >
               Welcome to the Future Pipeline Deals Dashboard
              </Typography>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: { xs: 1.5, md: 2 } }}>
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
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent={{ xs: "center", md: "flex-start" }}
            sx={{ minWidth: 240 }}
          >
            {regionTabs.map((item) => {
              const isSelected = selectedRegion === item.value;

              return (
                <Paper
                  key={item.value}
                  onClick={() => setSelectedRegion(item.value)}
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
                    boxShadow: isSelected ? "0 8px 18px rgba(43,20,111,0.18)" : "none",
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

          <Typography
            variant="h6"
            color="#002060"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              flexGrow: 1,
              minWidth: 200,
            }}
          >
            Future Pipeline Deals
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={{ xs: "center", md: "flex-end" }}
            sx={{ minWidth: 260 }}
          >
            <ToggleButtonGroup
              value={selectedDealType}
              exclusive
              onChange={(_e, value) => value && setSelectedDealType(value)}
              sx={{
                backgroundColor: "#f2f4f8",
                p: 0.4,
                borderRadius: 9999,
                border: "1px solid #d7ddea",
                display: "inline-flex",
                gap: 0.5,
                flexShrink: 0,
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
              <ToggleButton value="IPO" disabled={selectedRegion !== "US"}>
                IPO
              </ToggleButton>
              <ToggleButton value="FO" disabled={selectedRegion !== "US"}>
                FO
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
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
          </Stack>
        </Container>
      </Container>


      <ExpectedPipelineDealsTable
        selectedRegion={selectedRegion}
        selectedDealType={selectedDealType}
        onSelectedDealTypeChange={setSelectedDealType}
        showDealTypeToggle={false}
        showSearch={false}
        showTitle={false}
        searchQuery={searchTerm}
        onSearchQueryChange={setSearchTerm}
      />
    </>
  );
};

export default FuturePipelineDealsMain;
