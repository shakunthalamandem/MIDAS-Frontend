import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MeetingDealNoteCreate from "./MeetingDealNoteCreate";

export interface DealSearchResult {
  ticker: string;
  name?: string; // only for display
  dealId?: string;
  pricingDate?: string;
}

const DealMeetingNotesMain: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

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
    const year = parsed.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [allDeals, setAllDeals] = useState<DealSearchResult[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<DealSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiUrl) {
      setSearchError("REACT_APP_API_URL is not configured.");
      return;
    }

    const controller = new AbortController();

    const fetchDeals = async () => {
      setSearching(true);
      setSearchError(null);

      try {
        const url = `${apiUrl}/api/get_deal_unified_data/`;
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Request failed with status ${response.status}`);
        }

        const json = await response.json();
        const payload = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.results)
          ? json.results
          : [];

        const normalized = (payload as any[])
          .map((item) => ({
            ticker: item?.ticker || item?.symbol || "",
            name: item?.issuer_name || item?.company_name || item?.name,
            dealId: item?.deal_id || item?.dealId || item?.id,
            pricingDate: item?.pricing_date || item?.pricingDate || item?.pricingdate,
          }))
          .filter((item) => item.ticker);

        setAllDeals(normalized);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error fetching deals:", err);
        setSearchError("Unable to fetch deals. Please try again.");
      } finally {
        setSearching(false);
      }
    };

    fetchDeals();
    return () => controller.abort();
  }, [apiUrl, token]);

  const norm = (s: string) => (s || "").replace(/\s+/g, "").trim().toLowerCase();

  return (
    <>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
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
          marginBottom: "20px",
          letterSpacing: 0.2,
        }}
      >
        Deal Meeting Notes  📊
      </Typography>

      <Container maxWidth={false} sx={{ px: { xs: 1.5, md: 3 }, maxWidth: 1600 }}>
        <Box display="flex" justifyContent="center" mb={3}>
          <Box sx={{ width: { xs: "100%", sm: 380, md: 440 } }}>
            <Autocomplete
              options={allDeals}
              value={selectedDeal}
              inputValue={searchTerm}
              loading={searching}
              autoHighlight
              noOptionsText={searchTerm ? "No matches found" : "Type a ticker to search"}
              getOptionLabel={(option) => {
                const dateLabel = formatPricingDate(option.pricingDate);
                return `${option.ticker}${dateLabel ? ` (${dateLabel})` : ""}`;
              }}
              isOptionEqualToValue={(option, value) =>
                option.ticker === value.ticker && (option.dealId ?? "") === (value.dealId ?? "")
              }
              onInputChange={(_, value, reason) => {
                if (reason === "input" || reason === "clear") {
                  setSearchTerm(value || "");
                }
              }}
              onChange={(_, value) => {
                setSelectedDeal(value);
                if (value?.ticker) setSearchTerm(value.ticker);
              }}
              filterOptions={(opts, state) => {
                const term = norm(state.inputValue || "");
                const t = (d: DealSearchResult) => norm(d.ticker);

                if (!term) {
                  return [...opts].sort((a, b) => t(a).localeCompare(t(b)));
                }

                const exact = opts.filter((d) => t(d) === term);
                if (exact.length) {
                  return exact.sort((a, b) => t(a).localeCompare(t(b)));
                }

                const starts = opts.filter((d) => t(d).startsWith(term));
                const includes = opts.filter(
                  (d) => !t(d).startsWith(term) && t(d).includes(term)
                );

                const sortedStarts = starts.sort((a, b) => t(a).localeCompare(t(b)));
                const sortedIncludes = includes.sort((a, b) => t(a).localeCompare(t(b)));

                return [...sortedStarts, ...sortedIncludes];
              }}
              renderOption={(props, option) => (
                <li {...props} key={`${option.ticker}-${option.dealId ?? option.name ?? "deal"}`}>
                  <Box display="flex" flexDirection="column">
                    <Typography fontWeight={700} sx={{ color: "#002060" }}>
                      {option.ticker}
                      {option.pricingDate ? ` (${formatPricingDate(option.pricingDate)})` : ""}
                    </Typography>
                    {option.name ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        {option.name}
                      </Typography>
                    ) : null}
                  </Box>
                </li>
              )}
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
                        <SearchIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {searching ? <CircularProgress color="primary" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: "#fff",
                    },
                    "& .MuiInputLabel-root": {
                      color: "#0050c8",
                    },
                    "& .MuiInputBase-input": {
                      color: "#002060",
                    },
                  }}
                />
              )}
            />

            {searchError ? (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                {searchError}
              </Typography>
            ) : null}
          </Box>
        </Box>

        {/* ✅ Show ONLY the upper message box when no ticker is selected */}
        {!selectedDeal ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              backgroundColor: "rgba(0,32,96,0.05)",
              border: "1px dashed rgba(0,32,96,0.35)",
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "#002060", fontWeight: 700 }}>
              Select a ticker for the meeting notes
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              backgroundColor: "rgba(0,32,96,0.05)",
              border: "1px solid rgba(0,32,96,0.12)",
            }}
          >
            <MeetingDealNoteCreate selectedDeal={selectedDeal} />
          </Paper>
        )}
      </Container>
    </>
  );
};

export default DealMeetingNotesMain;
