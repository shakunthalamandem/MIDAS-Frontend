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
} from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
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
  const [selectedUsDealType, setSelectedUsDealType] = useState<"IPO" | "FO">("IPO");
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const opMap: Record<string, string> = {
    live: "Issued September to Date",
    upcoming: "Upcoming Deals",
  };

  const [selectedRegion, setSelectedRegion] = useState<
    "US" | "EMEA" | "APAC" | "NON_US_AMERICA"
  >("US");



  const fetchData = async (operation: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ operation }),
      });
      const result = await response.json();
      const formattedRows = result.data.map((item: any, index: number) => ({
        id: `${item.ticker}-${index}`, // ✅ always unique
        ...item,
      }));

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
    fetchData(apiOperation);
  }, [selectedOp]);

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

  // 🔹 Reset region when switching tabs
  useEffect(() => {
    setSelectedRegion("US");
  }, [selectedOp]);

  // 🔹 Reset selected ticker when region changes
  useEffect(() => {
    setSelectedDeal(null);
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedRegion !== "US") {
      setSelectedUsDealType("IPO");
    }
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
        const region = row.region?.trim().toUpperCase();

        if (selectedRegion === "US" && region !== "US") return false;
        if (selectedRegion === "APAC" && region !== "APAC") return false;
        if (selectedRegion === "EMEA" && region !== "EMEA") return false;
        if (selectedRegion === "NON_US_AMERICA") {
          if (region !== "NON-US AMERICA" && region !== "LATAM") return false;
        }
      }

      if (selectedRegion === "US") {
        const dealType = row.deal_type?.toString().toUpperCase();
        if (dealType && dealType !== selectedUsDealType) {
          return false;
        }
      }

      return true;
    });
  }, [rows, dealSearch, selectedRegion, selectedOp, selectedUsDealType]);


  return (
    <>
      {/* 🔹 TOP CONTAINER: ONLY THREE CARDS */}
      <Container
        maxWidth="xl"
        sx={{ mt: 0, mb: 2, px: { xs: 1.5, md: 2 } }}
      >
        {selectedOp !== "pipeline" && (
          <Container
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1.5,
              px: 1,
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "US", value: "US" },
              { label: "APAC", value: "APAC" },
              { label: "EMEA", value: "EMEA" },
              { label: "Others", value: "NON_US_AMERICA" },
            ].map((item) => (
              <Paper
                key={item.value}
                onClick={() => setSelectedRegion(item.value as any)}
                sx={{
                  px: 2.4,
                  py: 0.7,
                  borderRadius: 999,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  border: "1px solid rgba(0,32,96,0.25)",
                  backgroundColor:
                    selectedRegion === item.value ? "#6F1178" : "#ffffff",
                  color:
                    selectedRegion === item.value ? "#ffffff" : "#002060",
                }}
              >
                {item.label}
              </Paper>
            ))}
          </Container>
        )}
      </Container>

      {/* 🔹 MAIN CONTENT CONTAINER */}
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
                  height: 34,
                },
              }}
              InputLabelProps={{ shrink: false }}
            />
          </Container>

          {!isPipelineView && (
            <Container
              sx={{
                mb: 1.5,
                px: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#1f2a44",
                  lineHeight: 1.6,
                  textAlign: "left",
                }}
              >
                {headlineText}
              </Typography>
            </Container>
          )}
          {!isPipelineView && selectedRegion === "US" && (
            <Container sx={{ px: 1, mb: 1.5 }}>
              <ToggleButtonGroup
                value={selectedUsDealType}
                exclusive
                onChange={(_e, value) => value && setSelectedUsDealType(value)}
                sx={{
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    borderRadius: 9999,
                    border: "1px solid #002060",
                    backgroundColor: "#ffffff",
                    px: 2.4,
                    py: 0.6,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "#002060",
                    transition: "all 0.2s ease",
                    boxShadow: "0 3px 10px rgba(0,32,96,0.08)",
                  },
                  "& .Mui-selected": {
                    borderColor: "#00133a",
                    background: "linear-gradient(135deg, #0a2b7a 0%, #002060 45%, #001745 100%)",
                    color: "#ffffff",
                    boxShadow: "0 12px 26px rgba(0,32,96,0.32)",
                  },
                }}
              >
                <ToggleButton value="IPO">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography fontWeight={700} color="inherit">
                      US IPO
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="FO">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography fontWeight={700} color="inherit">
                      US FO
                    </Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Container>
          )}

          {/* 🔹 TABLE (UNCHANGED) */}
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
