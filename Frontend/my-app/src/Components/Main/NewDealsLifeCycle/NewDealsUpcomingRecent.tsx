import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Grid,
  TextField,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  InputAdornment,
} from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PublicIcon from "@mui/icons-material/Public";
import LanguageIcon from "@mui/icons-material/Language";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import SearchIcon from "@mui/icons-material/Search";
import DealsFilters from "./DealsFilters";
import DealsTable from "./DealsTable";
import AIMLModelPredictionInfo from "./DealsCyclesSections/AIMLModelPredictionInfo";
import DealColorInfo from "./DealsCyclesSections/DealColorInfo";
import DealWriteUpInfo from "./DealsCyclesSections/DealWriteUpInfo";
import DealIoiValuesTable from "./DealsCyclesSections/DealIoiValuesTable";
import DealInfoContainer from "./DealInfoContainer";
import ExpectedPipelineDealsTable from "../../UpcomingPipelineDeals/ExpectedPipelineDealsTable";

const NewDealsUpcomingRecent: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const tabs = [
    {
      value: "upcoming",
      label: "Upcoming Deals",
      helper: "Filed but not issued",
      icon: <EventAvailableIcon fontSize="small" sx={{ color: "inherit" }} />,
    },
    {
      value: "live",
      label: "Live Deals",
      helper: "Issued within last 30 days",
      icon: <FlashOnIcon fontSize="small" sx={{ color: "inherit" }} />,
    },
    {
      value: "pipeline",
      label: "Future Pipeline",
      helper: "Not filed",
      icon: <RocketLaunchIcon fontSize="small" sx={{ color: "inherit" }} />,
    },
  ];
  const [selectedOp, setSelectedOp] = useState<string>("upcoming");
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const [pipelineSearch, setPipelineSearch] = useState("");
  const [dealSearch, setDealSearch] = useState("");
  const [selectedDealType, setSelectedDealType] = useState<"IPO" | "FO">("IPO");
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const opMap: Record<string, string> = {
    live: "Issued September to Date",
    upcoming: "Upcoming Deals",
  };

  const [selectedRegion, setSelectedRegion] = useState<
    "US" | "EMEA" | "APAC" | "NON_US_AMERICA"
  >("US");

  const fetchData = async (operation: string, region: string, dealType: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ operation, region, deal_type: dealType }),
      });
      const result = await response.json();
      const payload = result?.data ?? result?.Data ?? [];
      const sectionKey = selectedOp === "live" ? "Live" : "Upcoming";
      const rowsSource = Array.isArray(payload)
        ? payload
        : Object.values(payload).flatMap((regionBucket: any) => {
            const section = regionBucket?.[sectionKey] ?? regionBucket;
            if (Array.isArray(section)) return section;
            if (section && typeof section === "object") return Object.values(section);
            return [];
          });
      const fieldOrder = [
        "ticker",
        "region",
        "sector",
        "issuer_name",
        "deal_size",
        "trade_date",
        "pricing_date",
        "deal_type",
        "fo_type",
        "issue_price",
        "price_range",
        "writeup_available",
        "deal_status",
        "t1d_pred",
      ];

      const formattedRows = rowsSource.flatMap((item: any, index: number) => {
        if (Array.isArray(item)) {
          const mapped: Record<string, any> = {};
          item.forEach((value, idx) => {
            const key = fieldOrder[idx];
            if (key) mapped[key] = value;
          });
          return [
            {
              id: `${mapped.ticker ?? "row"}-${index}`,
              ...mapped,
            },
          ];
        }

        if (item && typeof item === "object") {
          const numericKeys = Object.keys(item).filter((key) => /^\d+$/.test(key));
          if (numericKeys.length > 0) {
            const numericValues = numericKeys
              .sort((a, b) => Number(a) - Number(b))
              .map((key) => (item as Record<string, any>)[key])
              .filter((value) => value !== undefined && value !== null);

            const objectValues = numericValues.filter(
              (value) => value && typeof value === "object" && !Array.isArray(value)
            );
            if (objectValues.length > 0) {
              return objectValues.map((rowItem: any, innerIndex: number) => ({
                id: `${rowItem?.ticker ?? "row"}-${index}-${innerIndex}`,
                ...rowItem,
              }));
            }

            const mapped: Record<string, any> = {};
            numericValues.forEach((value, idx) => {
              const key = fieldOrder[idx];
              if (key) mapped[key] = value;
            });
            return [
              {
                id: `${mapped.ticker ?? "row"}-${index}`,
                ...mapped,
              },
            ];
          }
        }

        return [
          {
            id: `${item?.ticker ?? "row"}-${index}`, // ?. always unique
            ...item,
          },
        ];
      });
      console.log("Formatted rows:", formattedRows);

      setRows(formattedRows);
      setSelectedDeal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOp === "pipeline") {
      setRows([]);
      setSelectedDeal(null);
      return;
    }
    const apiOperation = opMap[selectedOp] || selectedOp;
    fetchData(apiOperation, selectedRegion, selectedDealType);
  }, [selectedOp, selectedRegion, selectedDealType]);

  const handleOpChange = (value: string) => {
    setSelectedOp(value);
  };

  const isPipelineView = selectedOp === "pipeline";

  useEffect(() => {
    if (!isPipelineView) {
      setPipelineSearch("");
    }
  }, [isPipelineView]);

  useEffect(() => {
    if (isPipelineView) {
      setDealSearch("");
    }
  }, [isPipelineView]);

  useEffect(() => {
    setSelectedDeal(null);
  }, [dealSearch]);

  // dY"1 Reset selected ticker when region changes
  useEffect(() => {
    setSelectedDeal(null);
  }, [selectedRegion]);

  const headlineText = useMemo(() => {
    if (selectedOp === "live") {
      return "Track IPOs that have been issued or priced within the last 30 days, with real-time deal status and key market details.";
    }
    return "Track IPOs that have been filed but not yet issued, highlighting key issuer details, expected timelines, and deal readiness.";
  }, [selectedOp]);

  const filteredRows = useMemo(() => {
    const term = dealSearch.trim().toLowerCase();

    return rows.filter((row) => {
      // dY"1 Search filter
      if (term && !row.ticker?.toString().toLowerCase().includes(term)) {
        return false;
      }

      // dY"1 Region filter (only for non-pipeline)
      if (selectedOp !== "pipeline") {
        const region = row.region != null ? String(row.region).trim().toUpperCase() : "";

        if (region) {
          if (selectedRegion === "US" && region !== "US") return false;
          if (selectedRegion === "APAC" && region !== "APAC") return false;
          if (selectedRegion === "EMEA" && region !== "EMEA") return false;
          if (selectedRegion === "NON_US_AMERICA") {
            if (region !== "NON-US AMERICA" && region !== "LATAM") return false;
          }
        }
      }

      const dealType = row.deal_type?.toString().toUpperCase();
      if (dealType && dealType !== selectedDealType) {
        return false;
      }

      return true;
    });
  }, [rows, dealSearch, selectedRegion, selectedOp, selectedDealType]);
console.log("Filtered rows:", filteredRows);
  return (
    <>
      {/* dY"1 TOP CONTAINER: ONLY THREE CARDS */}
      <Container
        maxWidth="xl"
        sx={{ mt: 0, mb: 2, px: { xs: 1.5, md: 2 } }}
      >
        {selectedOp !== "pipeline" && (
          <Container
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1.5,
              px: 1,
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "US", value: "US", icon: <PublicIcon fontSize="small" /> },
              { label: "APAC", value: "APAC", icon: <LanguageIcon fontSize="small" /> },
              { label: "EMEA", value: "EMEA", icon: <TravelExploreIcon fontSize="small" /> },
              { label: "Others", value: "NON_US_AMERICA", icon: <Diversity3Icon fontSize="small" /> },
            ].map((item) => {
              const isSelected = selectedRegion === item.value;

              return (
                <Paper
                  key={item.value}
                  onClick={() => setSelectedRegion(item.value as any)}
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
          </Container>
        )}
      </Container>

      {/* dY"1 MAIN CONTENT CONTAINER */}
      <Container
        maxWidth="xl"
        sx={{
          mb: 4,
          position: "relative",
          pb: 4,
          pt: 2,
          px: { xs: 1.5, md: 2 },
          backgroundColor: "rgba(21,101,192,0.05)",
          borderRadius: 3,
        }}
      >
        <Container maxWidth={false} sx={{ mt: 1, px: 0 }}>
          {/* dY"1 ONE-LINE TEXT (LEFT) + SEARCH (RIGHT) */}
          <Container
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
            <Container sx={{ flexGrow: 1, minWidth: { xs: "100%", md: "auto" } }}>
              <DealsFilters
                selectedOp={selectedOp}
                onChange={handleOpChange}
                options={tabs}
              />
            </Container>
          </Container>

          <Container
            sx={{
              mb: 1.5,
              px: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            <TextField
              size="small"
              placeholder="Search"
              value={isPipelineView ? pipelineSearch : dealSearch}
              onChange={(e) =>
                isPipelineView
                  ? setPipelineSearch(e.target.value)
                  : setDealSearch(e.target.value)
              }
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
            {!isPipelineView && (
              <Typography
                sx={{
                  fontWeight: 400,
                  color: "#1f2a44",
                  lineHeight: 1.4,
                  textAlign: "left",
                  fontSize: { xs: "0.82rem", md: "0.88rem" },
                  whiteSpace: { xs: "normal", md: "nowrap" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flexGrow: 1,
                }}
              >
                {headlineText}
              </Typography>
            )}
            {!isPipelineView && (
              <ToggleButtonGroup
                value={selectedDealType}
                exclusive
                onChange={(_e, value) => value && setSelectedDealType(value)}
                sx={{
                  backgroundColor: "#f2f4f8",
                  p: 0.4,
                  borderRadius: 9999,
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
          </Container>
          {/* dY"1 TABLE (UNCHANGED) */}
          {isPipelineView ? (
            <ExpectedPipelineDealsTable
              searchQuery={pipelineSearch}
              onSearchQueryChange={setPipelineSearch}
              showSearch={false}
            />
          ) : loading ? (
            <CircularProgress sx={{ display: "block", mx: "auto" }} />
          ) : (
            <DealsTable
              rows={filteredRows}
              loading={loading}
              onRowSelect={(row) => setSelectedDeal(row)}
              selectedOp={selectedOp}
              hideRegionColumn
            />
          )}
        </Container>

        {!isPipelineView && selectedDeal && (
          <>
            <Grid container spacing={2} mt={2}>
              <Grid item xs={12} md={4}>
                <DealColorInfo data={selectedDeal} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DealWriteUpInfo data={selectedDeal} />
              </Grid>
              <Grid item xs={12} md={4}>
                <AIMLModelPredictionInfo data={selectedDeal} />
              </Grid>
            </Grid>

            <Grid item xs={12} md={4} mb={4}>
              <DealIoiValuesTable data={selectedDeal} />
              <DealInfoContainer selectedDeal={selectedDeal} />
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

export default NewDealsUpcomingRecent;
