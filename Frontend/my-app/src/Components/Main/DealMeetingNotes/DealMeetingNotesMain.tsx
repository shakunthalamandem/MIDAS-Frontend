import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MeetingDealNoteCreate from "./MeetingDealNoteCreate";
import UnlistedDealMeetingNotesMain from "./UnlistedDealMeetingNotesMain";

export interface DealSearchResult {
  ticker: string;
  name?: string;
  dealId?: string;
  pricingDate?: string;
  id?: number | string;
  fsTicker?: string | null;
  sector?: string;
  region?: string;
  dealType?: string;
  foType?: string | null;
  ipoType?: string;
  issuerName?: string;
  dealCaptain?: string;
  flagForWriteup?: string | null;
}

const DealMeetingNotesMain: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [searchTerm, setSearchTerm] = useState("");
  const [allDeals, setAllDeals] = useState<DealSearchResult[]>([]);
  const [selectedDeal, setSelectedDeal] =
    useState<DealSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mode, setMode] = useState<"listed" | "unlisted">("listed");

  const formatPricingDate = (value?: string) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    const day = parsed.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    const month = parsed.toLocaleString("en-US", { month: "short" });
    return `${day}${suffix} ${month} ${parsed.getFullYear()}`;
  };

  useEffect(() => {
    if (!apiUrl) {
      setSearchError("REACT_APP_API_URL is not configured.");
      return;
    }

    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError(null);

        const query = searchTerm.trim()
          ? `?search=${encodeURIComponent(searchTerm.trim())}`
          : "";

        const res = await fetch(
          `${apiUrl}/api/get_deal_unified_data/${query}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error("Failed to fetch deals");

        const json = await res.json();
        const payload = Array.isArray(json)
          ? json
          : json?.data || json?.results || [];

        setAllDeals(
          payload
            .map((item: any) => ({
              ticker: item?.ticker || item?.symbol || "",
              name: item?.issuer_name || item?.company_name,
              dealId: item?.deal_id || item?.id,
              pricingDate: item?.pricing_date,
              issuerName: item?.issuer_name,
            }))
            .filter((d: DealSearchResult) => d.ticker)
        );
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setSearchError("Unable to fetch deals");
        }
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [apiUrl, token, searchTerm]);

  return (
    <>
      {/* HEADER */}


      <Container maxWidth="xl">
        {/* MODE TABS */}
        <Paper
          elevation={0}
          sx={{
            p: 0.5,
            mb: 3,
            borderRadius: 999,
            background:
              "linear-gradient(90deg, #0b2c6a 0%, #1f6feb 100%)",
          }}
        >
<Tabs
  value={mode}
  onChange={(_, v) => setMode(v)}
  TabIndicatorProps={{ style: { display: "none" } }}
  sx={{
    display: "flex",
    justifyContent: "center",   // ✅ centers tabs
    "& .MuiTabs-flexContainer": {
      justifyContent: "center", // ✅ important
    },
    "& .MuiTab-root": {
      color: "#fff",
      fontWeight: 700,
      borderRadius: 999,
      px: 3,
    },
    "& .Mui-selected": {
      backgroundColor: "#f5f9ff",
      color: "#0b2c6a",
    },
  }}
>
  <Tab value="listed" label="Listed Companies" />
  <Tab value="unlisted" label="Unlisted Companies" />
</Tabs>

        </Paper>

        {mode === "listed" ? (
          <>
            {/* 🔹 SEARCH BAR CARD (ALWAYS VISIBLE) */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                backgroundColor: "rgba(0,32,96,0.05)",
                border: "1px solid rgba(0,32,96,0.12)",
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                <Box>
            <Typography sx={{ fontWeight: 800, color: "#002060", fontSize: { xs: 20, md: 24 } }}>
                   Listed Company Meeting Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
Meetings can only be created for existing companies. Select a company to proceed.
                  </Typography>
                </Box>

                <Box sx={{ width: { xs: "100%", sm: 360 } }}>
                  <Autocomplete
                    options={allDeals}
                    value={selectedDeal}
                    inputValue={searchTerm}
                    loading={searching}
                    getOptionLabel={(o) =>
                      `${o.ticker}${
                        o.pricingDate
                          ? ` (${formatPricingDate(o.pricingDate)})`
                          : ""
                      }`
                    }
                    onInputChange={(_, v) => setSearchTerm(v)}
                    onChange={(_, v) => setSelectedDeal(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Search ticker"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <>
                              {searching && (
                                <CircularProgress size={18} />
                              )}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            backgroundColor: "#fff",
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Paper>

            {/* 🔹 CONTENT */}
            {!selectedDeal ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px dashed rgba(0,32,96,0.35)",
                }}
              >
                <Typography fontWeight={700} color="#002060">
                  Select a ticker to start meeting notes
                </Typography>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: "rgba(0,32,96,0.05)",
                  border: "1px solid rgba(0,32,96,0.12)",
                }}
              >
                <MeetingDealNoteCreate selectedDeal={selectedDeal} />
              </Paper>
            )}
          </>
        ) : (
          <UnlistedDealMeetingNotesMain />
        )}
      </Container>
    </>
  );
};

export default DealMeetingNotesMain;
