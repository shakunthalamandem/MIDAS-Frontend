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

        const normalized: DealSearchResult[] = payload
          .map((item: any) => ({
            ticker: item?.ticker || item?.symbol || "",
            name: item?.issuer_name || item?.company_name,
            dealId: item?.deal_id || item?.id,
            pricingDate: item?.pricing_date,
            issuerName: item?.issuer_name,
          }))
          .filter((d: DealSearchResult) => d.ticker);

        const toTime = (value?: string) => {
          if (!value) return -Infinity;
          const parsed = new Date(value);
          const time = parsed.getTime();
          return Number.isNaN(time) ? -Infinity : time;
        };

        normalized.sort(
          (a: DealSearchResult, b: DealSearchResult) =>
            toTime(b.pricingDate) - toTime(a.pricingDate)
        );
        setAllDeals(normalized);
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


      <Container maxWidth="xl" sx={{ pb: { xs: 4, md: 6 } }}>
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
                  <Typography variant="body2" color="#000000">
Meetings can only be created for existing companies. Select a company to proceed.
                  </Typography>
                </Box>

                <Box sx={{ width: { xs: "100%", sm: 360 } }}>
                  <Autocomplete
                    options={allDeals}
                    value={selectedDeal}
                    inputValue={searchTerm}
                    loading={searching}
                    autoHighlight
                    getOptionLabel={(o) =>
                      `${o.ticker}${
                        o.pricingDate
                          ? ` (${formatPricingDate(o.pricingDate)})`
                          : ""
                      }`
                    }
                    onInputChange={(_, v) => setSearchTerm(v)}
                    onChange={(_, v) => setSelectedDeal(v)}
                    renderOption={(props, option) => {
                      const pricingLabel = option.pricingDate
                        ? formatPricingDate(option.pricingDate)
                        : "";

                      return (
                        <li
                          {...props}
                          key={`${option.ticker}-${option.dealId ?? option.pricingDate ?? ""}`}
                        >
                          <Box display="flex" flexDirection="column" gap={0.25}>
                            <Box display="flex" alignItems="baseline" gap={0.75}>
                              <Typography
                                component="span"
                                sx={{ fontWeight: 700, color: "#0b2c6a", fontSize: 13 }}
                              >
                                {option.ticker}
                              </Typography>
                              {pricingLabel ? (
                                <Typography
                                  component="span"
                                  sx={{ fontWeight: 600, color: "#6b2dbd", fontSize: 12 }}
                                >
                                  ({pricingLabel})
                                </Typography>
                              ) : null}
                            </Box>
                            {option.name ? (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: 11,
                                  color: "#6b7280",
                                  textTransform: "uppercase",
                                  letterSpacing: 0.4,
                                }}
                              >
                                {option.name}
                              </Typography>
                            ) : null}
                          </Box>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Search ticker"
                        placeholder="Type to search..."
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" sx={{ color: "#6b7280" }} />
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
                            borderRadius: "999px",
                            backgroundColor: "#fff",
                            fontSize: 13,
                            "& fieldset": {
                              border: "none",
                            },
                            "&:hover fieldset": {
                              border: "none",
                            },
                            "&.Mui-focused fieldset": {
                              border: "none",
                              boxShadow: "0 0 0 3px rgba(59, 91, 219, 0.12)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "#3b5bdb",
                            fontWeight: 600,
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#3b5bdb",
                          },
                          "& .MuiInputBase-input::placeholder": {
                            color: "#9aa3b2",
                            opacity: 1,
                          },
                        }}
                      />
                    )}
                    sx={{
                      "& .MuiAutocomplete-paper": {
                        mt: 1,
                        borderRadius: 2,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 12px 24px rgba(15, 23, 42, 0.12)",
                      },
                      "& .MuiAutocomplete-listbox": {
                        maxHeight: 320,
                        p: 0,
                      },
                      "& .MuiAutocomplete-option": {
                        alignItems: "flex-start",
                        py: 1,
                        px: 2,
                        borderBottom: "1px solid #eef2ff",
                        "&[aria-selected='true']": {
                          backgroundColor: "rgba(59, 91, 219, 0.08)",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "rgba(59, 91, 219, 0.08)",
                        },
                      },
                    }}
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
