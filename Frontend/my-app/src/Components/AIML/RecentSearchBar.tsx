import React from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export type SearchOption = {
  ticker: string;
  pricing_date: string; // original string
  dateKey: string; // normalized "YYYY-MM-DD"
  display: string; // "TICKER - 07 Oct 2025"
};

interface RecentSearchBarProps {
  options: SearchOption[];
  inputValue: string;
  loading: boolean;
  selectedTypeLabel: string; // "IPO" | "FO"
  onInputChange: (value: string) => void;
  onSelectOption: (opt: SearchOption | null) => void;
}

const normTicker = (t: string) => t.replace(/\s+/g, "").toUpperCase();
export const sameTicker = (a: string, b: string) => {
  const na = normTicker(a);
  const nb = normTicker(b);
  return na === nb || na.startsWith(nb) || nb.startsWith(na);
};

const highlightMatch = (text: string, q: string) => {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  const before = text.slice(0, i);
  const match = text.slice(i, i + q.length);
  const after = text.slice(i + q.length);
  return (
    <>
      {before}
      <strong>{match}</strong>
      {after}
    </>
  );
};

const RecentSearchBar: React.FC<RecentSearchBarProps> = ({
  options,
  inputValue,
  loading,
  selectedTypeLabel,
  onInputChange,
  onSelectOption,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Autocomplete
        freeSolo
        options={options}
        inputValue={inputValue}
        getOptionLabel={(opt) =>
          typeof opt === "string" ? opt : (opt as SearchOption).display
        }
        // ticker-equivalence + dateKey equality
        isOptionEqualToValue={(opt, val) => {
          const o = typeof opt === "string" ? null : (opt as SearchOption);
          const v = typeof val === "string" ? null : (val as SearchOption);
          if (!o || !v) return false;
          return sameTicker(o.ticker, v.ticker) && o.dateKey === v.dateKey;
        }}
        onInputChange={(_e, value, reason) => {
          // only clear selection on true typing/clear
          if (reason === "input" || reason === "clear") {
            onInputChange(value || "");
          }
        }}
        onChange={(_e, value) =>
          onSelectOption(
            value && typeof value === "object" ? (value as SearchOption) : null
          )
        }
        selectOnFocus
        clearOnBlur={false}
        handleHomeEndKeys
        disablePortal
        blurOnSelect="mouse"
        forcePopupIcon="auto"
        clearOnEscape
        disableClearable={false}
        noOptionsText={inputValue ? "No matches" : "Type a ticker to search"}
        loading={loading}
        renderOption={(props, option) => {
          const opt = option as SearchOption;
          const [tickerPart, datePart] = opt.display.split(" - ");
          return (
            <Box
              component="li"
              {...props}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                px: 1.25,
                "&.Mui-focused": { backgroundColor: "action.hover" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {highlightMatch(tickerPart, inputValue)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ ml: "auto", color: "#000000" }}
              >
                {datePart}
              </Typography>
            </Box>
          );
        }}
        ListboxProps={{
          sx: {
            maxHeight: 280,
            overflowY: "auto",
            py: 0.5,
            "& li": { borderBottom: "1px solid", borderColor: "divider" },
            "& li:last-of-type": { borderBottom: "none" },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={`Search ${selectedTypeLabel} ticker (e.g., NVDA)`}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.paper",
                pr: 1,
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
                borderWidth: 1.5,
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
                  <SearchIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.disabled" }}
                  />
                </Box>
              ),
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </Box>
  );
};

export default RecentSearchBar;
