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

interface DealSearchResult {
  ticker: string;
  name?: string;
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
  const [options, setOptions] = useState<DealSearchResult[]>([]);
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
        const term = searchTerm.trim();
        const params = new URLSearchParams();
        if (term) params.set("search", term);
        const url =
          params.toString().length > 0
            ? `${apiUrl}/api/get_deal_unified_data/?${params.toString()}`
            : `${apiUrl}/api/get_deal_unified_data/`;

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

        setOptions(normalized);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error searching deals:", err);
        setSearchError("Unable to fetch deals. Please try again.");
      } finally {
        setSearching(false);
      }
    };

    const debounceId = setTimeout(fetchDeals, 400);
    return () => {
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [apiUrl, token, searchTerm]);

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
        Post-Meeting Notes
      </Typography>

      <Container maxWidth={false} sx={{ px: { xs: 1.5, md: 3 }, maxWidth: 1600 }}>
        <Box display="flex" justifyContent="center" mb={3}>
          <Box sx={{ width: { xs: "100%", sm: 380, md: 440 } }}>
            <Autocomplete
              options={options}
              value={selectedDeal}
              getOptionLabel={(option) => {
                const dateLabel = formatPricingDate(option.pricingDate);
                return `${option.ticker}${dateLabel ? ` (${dateLabel})` : ""}`;
              }}
              isOptionEqualToValue={(option, value) =>
                option.ticker === value.ticker && (option.dealId ?? "") === (value.dealId ?? "")
              }
              inputValue={searchTerm}
              onInputChange={(_, value) => setSearchTerm(value)}
              onChange={(_, value) => {
                setSelectedDeal(value);
                if (value?.ticker) {
                  setSearchTerm(value.ticker);
                }
              }}
              loading={searching}
              noOptionsText="No matches found"
              renderOption={(props, option) => (
                <li {...props} key={`${option.ticker}-${option.dealId ?? option.name ?? "deal"}`}>
                  <Box display="flex" flexDirection="column">
                    <Typography fontWeight={700}>
                      {option.ticker}
                      {option.pricingDate ? ` (${formatPricingDate(option.pricingDate)})` : ""}
                    </Typography>
                    {option.name ? (
                      <Typography variant="caption" color="text.secondary">
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

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            backgroundColor: "rgba(0,32,96,0.05)",
            border: "1px solid rgba(0,32,96,0.12)",
          }}
        >
          <MeetingDealNoteCreate />
        </Paper>
      </Container>
    </>
  );
};

export default DealMeetingNotesMain;
