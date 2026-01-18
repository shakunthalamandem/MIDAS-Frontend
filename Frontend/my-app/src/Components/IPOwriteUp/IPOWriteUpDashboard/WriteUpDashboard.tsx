import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DealsTable from "../../Main/NewDealsLifeCycle/DealsTable";
import ExpectedPipelineDealsTable from "../../UpcomingPipelineDeals/ExpectedPipelineDealsTable";

const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

type Region = "US" | "APAC" | "EMEA" | "NON_US_AMERICA";

type UnifiedResponse = Record<string, any>;

const regionOptions: Array<{ value: Region; label: string; icon: React.ElementType }> = [
  { value: "US", label: "US", icon: ApartmentIcon },
  { value: "APAC", label: "APAC", icon: PublicIcon },
  { value: "EMEA", label: "EMEA", icon: TimelineIcon },
  { value: "NON_US_AMERICA", label: "Others", icon: ShowChartIcon },
];

const opOptions = [
  { value: "upcoming", label: "Upcoming Deals", icon: EventAvailableIcon },
  { value: "live", label: "Live Deals", icon: FlashOnIcon },
  { value: "pipeline", label: "Future Pipeline", icon: RocketLaunchIcon },
];

const WriteUpDashboard: React.FC = () => {
  const [data, setData] = useState<UnifiedResponse>({});
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region>("US");
  const [selectedOp, setSelectedOp] = useState("upcoming");
  const [selectedDealType, setSelectedDealType] = useState<"IPO" | "FO">("IPO");
  const [searchTerm, setSearchTerm] = useState("");
  const [pipelineSearch, setPipelineSearch] = useState("");

  const opPayloadMap: Record<string, string> = {
    upcoming: "Upcoming Deals",
    live: "Issued September to Date",
  };

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
      const payload = result?.Data ?? result?.data ?? result ?? {};
      setData(payload || {});
    } catch (err) {
      console.error(err);
      setData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOp === "pipeline") {
      setData({});
      return;
    }
    const operation = opPayloadMap[selectedOp] || selectedOp;
    fetchData(operation);
  }, [selectedOp]);

  useEffect(() => {
    if (selectedOp === "pipeline") {
      setSearchTerm("");
    } else {
      setPipelineSearch("");
    }
  }, [selectedOp]);

  const rows = useMemo(() => {
    if (selectedOp === "pipeline") return [];

    const opKeyMap: Record<string, string> = {
      upcoming: "Upcoming",
      live: "Live",
    };

    const regionData = data?.[selectedRegion] ?? {};
    const opKey = opKeyMap[selectedOp];
    const opData = opKey ? regionData?.[opKey] ?? {} : {};
    const list = opData?.[selectedDealType] ?? [];

    const normalized = list.map((item: any, index: number) => ({
      id: item.ticker ? `${item.ticker}-${index}` : index,
      ...item,
    }));

    const term = searchTerm.trim().toLowerCase();
    if (!term) return normalized;

    return normalized.filter((item: any) =>
      [item.ticker, item.issuer_name, item.sector]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(term))
    );
  }, [data, selectedDealType, selectedOp, selectedRegion, searchTerm]);

  return (
    <Container maxWidth="xl" sx={{ mb: 4, mt: 2 }}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={selectedRegion}
          exclusive
          onChange={(_e, value) => value && setSelectedRegion(value)}
          sx={{
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
            "& .MuiToggleButton-root": {
              border: "1px solid rgba(0,32,96,0.16)",
              borderRadius: 999,
              textTransform: "none",
              px: 2.2,
              py: 1,
              mr: 1,
              mb: 1,
              backgroundColor: "#fff",
              color: "#002060",
              gap: 0.75,
              fontWeight: 700,
              boxShadow: "0 6px 16px rgba(0,32,96,0.12)",
            },
            "& .Mui-selected": {
              backgroundColor: "#6F1178",
              color: "#ffffff",
              borderColor: "#6F1178",
              boxShadow: "0 10px 22px rgba(111,17,120,0.35)",
            },
            "& .MuiToggleButton-root:hover": {
              backgroundColor: "rgba(21,101,192,0.08)",
            },
          }}
        >
          {regionOptions.map((option) => {
            const Icon = option.icon;
            return (
              <ToggleButton key={option.value} value={option.value}>
                <Icon fontSize="small" sx={{ color: "inherit" }} />
                {option.label}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <ToggleButtonGroup
            value={selectedOp}
            exclusive
            onChange={(_e, value) => value && setSelectedOp(value)}
            sx={{
              flexWrap: "wrap",
              "& .MuiToggleButton-root": {
                border: "1px solid #002060",
                borderRadius: 9999,
                textTransform: "none",
                px: 1.7,
                py: 0.55,
                backgroundColor: "#e9eef6",
                color: "#002060",
                gap: 0.75,
                fontWeight: 700,
                fontSize: "0.82rem",
                boxShadow: "0 3px 10px rgba(0,32,96,0.08)",
              },
              "& .Mui-selected": {
                borderColor: "#00133a",
                background:
                  "linear-gradient(135deg, #0a2b7a 0%, #002060 45%, #001745 100%)",
                color: "#ffffff",
                boxShadow: "0 12px 26px rgba(0,32,96,0.32)",
              },
            }}
          >
            {opOptions.map((option) => {
              const Icon = option.icon;
              return (
                <ToggleButton key={option.value} value={option.value}>
                  <Icon fontSize="small" sx={{ color: "inherit" }} />
                  {option.label}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>

          <TextField
            size="small"
            placeholder="Search"
            value={selectedOp === "pipeline" ? pipelineSearch : searchTerm}
            onChange={(e) =>
              selectedOp === "pipeline"
                ? setPipelineSearch(e.target.value)
                : setSearchTerm(e.target.value)
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
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={selectedDealType}
              onChange={(e) => setSelectedDealType(e.target.value as "IPO" | "FO")}
              sx={{
                borderRadius: 999,
                height: 36,
                backgroundColor: "#ffffff",
                fontWeight: 700,
                color: "#002060",
              }}
            >
              <MenuItem value="IPO">IPO</MenuItem>
              <MenuItem value="FO">FO</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>

      {selectedOp === "pipeline" ? (
        <ExpectedPipelineDealsTable
          searchQuery={pipelineSearch}
          onSearchQueryChange={setPipelineSearch}
          showSearch={false}
        />
      ) : loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto" }} />
      ) : (
        <DealsTable
          rows={rows}
          loading={loading}
          onRowSelect={() => undefined}
          selectedOp={selectedOp}
        />
      )}

      {!loading && selectedOp !== "pipeline" && rows.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          No deals match the current filters.
        </Typography>
      )}
    </Container>
  );
};

export default WriteUpDashboard;
