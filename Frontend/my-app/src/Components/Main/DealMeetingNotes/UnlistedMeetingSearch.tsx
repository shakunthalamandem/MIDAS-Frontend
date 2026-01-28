import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import UnlistedMeetingSearchOption, {
  UnlistedMeetingSearchOptionData,
} from "./UnlistedMeetingSearchOption";

type UnlistedMeetingSearchProps = {
  apiUrl?: string;
  token: string | null;
  onSelect: (option: UnlistedMeetingSearchOptionData) => void;
  onCreate: () => void;
  onInputChange: (value: string) => void;
};

const UnlistedMeetingSearch: React.FC<UnlistedMeetingSearchProps> = ({
  apiUrl,
  token,
  onSelect,
  onCreate,
  onInputChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UnlistedMeetingSearchOptionData[]>([]);
  const [selectedOption, setSelectedOption] =
    useState<UnlistedMeetingSearchOptionData | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const authHeader = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }),
    [token]
  );

  useEffect(() => {
    if (!apiUrl) {
      setSearchError("REACT_APP_API_URL is not configured.");
      return;
    }

    const term = searchTerm.trim();
    const controller = new AbortController();
    const handle = window.setTimeout(() => {
      const fetchResults = async () => {
        setSearching(true);
        setSearchError(null);

        try {
          const params = new URLSearchParams();
          if (term) {
            params.set("ticker", term);
            params.set("company_name", term);
          }
          const query = params.toString() ? `?${params.toString()}` : "";
          const response = await fetch(`${apiUrl}/api/get_unlisted_deal_meeting/${query}`, {
            headers: authHeader,
            signal: controller.signal,
          });

          if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `Request failed with status ${response.status}`);
          }

          const json = await response.json();
          if (json?.message) {
            setSearchResults([]);
            return;
          }

          const payload = Array.isArray(json)
            ? json
            : Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.results)
            ? json.results
            : [];

          const normalized = (payload as any[])
            .map((item) => ({
              ticker: (item?.ticker || item?.symbol || item?.fs_ticker || "").toUpperCase(),
              pricingDate: item?.pricing_date || item?.pricingDate || item?.pricingdate || "",
              name: item?.company_name || item?.issuer_name || item?.name || "",
              dealType: item?.deal_type || "",
              dealId: item?.deal_id ?? null,
              id: item?.id ?? item?.pk ?? null,
            }))
            .filter((item) => item.ticker);

          setSearchResults(normalized);
        } catch (err: any) {
          if (err.name === "AbortError") return;
          console.error("Error fetching unlisted meetings:", err);
          setSearchError("Unable to fetch unlisted meetings. Please try again.");
        } finally {
          setSearching(false);
        }
      };

      fetchResults();
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [apiUrl, authHeader, searchTerm]);

  return (
    <Stack spacing={1}>
      <Box display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap" gap={1.5}>
        <Autocomplete
          options={searchResults}
          value={selectedOption}
          inputValue={searchTerm}
          loading={searching}
          autoHighlight
          getOptionLabel={(option) => {
            const dateLabel = option.pricingDate ? ` (${option.pricingDate})` : "";
            return `${option.ticker}${dateLabel}`;
          }}
          isOptionEqualToValue={(option, value) =>
            option.ticker === value.ticker &&
            (option.pricingDate ?? "") === (value.pricingDate ?? "")
          }
          onInputChange={(_, value, reason) => {
            if (reason === "input" || reason === "clear") {
              setSearchTerm(value || "");
              setSearchResults([]);
              setSearchError(null);
              onInputChange(value || "");
            }
          }}
          onChange={(_, value) => {
            setSelectedOption(value);
            if (!value) return;
            setSearchTerm(value.ticker);
            onSelect(value);
          }}
          renderOption={(props, option) => (
            <li {...props} key={`${option.ticker}-${option.pricingDate ?? "na"}`}>
              <UnlistedMeetingSearchOption option={option} />
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Search unlisted meeting notes"
              placeholder="Type ticker or company..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 320,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  backgroundColor: "#fff",
                },
              }}
            />
          )}
        />
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={onCreate}
          sx={{
            textTransform: "none",
            borderRadius: 999,
            px: 3,
            background: "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)",
            boxShadow: "0 10px 22px rgba(0, 98, 255, 0.25)",
          }}
        >
          Create
        </Button>
      </Box>
      {searchError ? (
        <Typography variant="caption" color="error">
          {searchError}
        </Typography>
      ) : null}
    </Stack>
  );
};

export default UnlistedMeetingSearch;
