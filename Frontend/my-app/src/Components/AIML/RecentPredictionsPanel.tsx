import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  TextField,
  Autocomplete,
  Stack,
  Tooltip,
} from "@mui/material";
import { green, red, grey } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";

interface RecentPrediction {
  deal_status: string;
  ticker: string;
  pricing_date: string;
  deal_type: string;
  region: string;
  sponsor: string;
  deal_size: number;
  lead_bank: string;
  primary_percentage: number;
  sector: string;
  discount_from_announcement_price: number;
  allocation_as_percentage_of_deal_size: number;
  allocation_as_percentage_of_ioi: number;
  gdp_growth: string | null;
  inflation_rate: string | null;
  treasury_rates: string | null;

  t1d_pred: string | null;

  // May still arrive from backend but no longer shown
  revenue?: number | string | null;
  revenue_growth?: number | string | null;
  net_profit_margin?: number | string | null;
  issue_to_previous_day_close?: number | string | null; // shown only for FO
  t1d_open_return_category?: string | null;
  t1d_return_from_bloomberg_category?: string | null;
}

interface ApiResponse {
  data: RecentPrediction[];
}

interface RecentPredictionsPanelProps {
  selectedType: "IPO" | "FO";
  onSelect: (item: RecentPrediction) => void;
  refreshKey?: number;
}

/** ----- helpers ----- */
const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const formatDateShort = (dateString?: string) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "N/A";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = monthShort[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd} ${mm} ${yyyy}`;
};

const normalizePrediction = (p?: string | null) => (p || "").trim().toLowerCase();
const hasPrediction = (p?: string | null) => {
  const n = normalizePrediction(p);
  return n === "positive" || n === "positive return" || n === "negative" || n === "low return" || n === "neutral";
};
const mapPredToColor = (p?: string | null) => {
  const n = normalizePrediction(p);
  if (n === "positive" || n === "positive return") return green[600];
  if (n === "negative" || n === "low return") return red[500];
  if (n === "neutral") return grey[700];
  return grey[500];
};

// Calm background + accent
const CARD_BG = "#EEF2FF";
const CARD_BORDER = "#DDE4FF";
const ACCENT = "#B6C4FF";

const formatSector = (raw?: string) => {
  if (!raw) return "N/A";
  const cleaned = raw.replace(/^(sp500_|nasdaq_|nyse_)/i, "");
  return cleaned
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// forgiving parse for number-like strings (handles "-2.5%", "1,234.5", etc.)
const parseNumberLike = (val?: number | string | null): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Number.isNaN(val) ? null : val;
  const n = parseFloat(String(val).replace(/[^\d.-]/g, ""));
  return Number.isNaN(n) ? null : n;
};

// small format helpers
const fmtMoneyM = (v?: number | string | null) => {
  const n = parseNumberLike(v);
  return n === null ? "N/A" : `$${n.toFixed(1)}M`;
};
const fmtPct = (v?: number | string | null) => {
  const n = parseNumberLike(v);
  return n === null ? "N/A" : `${n.toFixed(1)}%`;
};

type Option = {
  ticker: string;
  pricing_date: string;
  prediction: string | null;
  display: string; // e.g., "NVDA on 11 Sep 2025 - Positive"
};

const statusChip = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "issued") return { color: "success" as const, label: "Issued" };
  if (s === "announced") return { color: "info" as const, label: "Announced" };
  if (s === "price range") return { color: "secondary" as const, label: "Price Range" };
  return { color: "default" as const, label: status || "Status" };
};

const metricRow = (label: string, value: React.ReactNode, tooltip?: string) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    {tooltip ? (
      <Tooltip title={tooltip} arrow>
        <Typography variant="body2" sx={{ color: grey[700] }}>{label}</Typography>
      </Tooltip>
    ) : (
      <Typography variant="body2" sx={{ color: grey[700] }}>{label}</Typography>
    )}
    <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>{value}</Typography>
  </Stack>
);

const RecentPredictionsPanel: React.FC<RecentPredictionsPanelProps> = ({ selectedType, onSelect, refreshKey }) => {
  const [allDeals, setAllDeals] = useState<RecentPrediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [query, setQuery] = useState<string>("");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/recent_predictions/`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          signal: ac.signal,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        const json: ApiResponse = await res.json();
        const sorted = (json.data || [])
          .slice()
          .sort((a, b) => new Date(b.pricing_date).getTime() - new Date(a.pricing_date).getTime());
        if (isMounted) setAllDeals(sorted);
      } catch (err: any) {
        if (isMounted && err.name !== "AbortError") setError(err.message || "Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      ac.abort();
    };
  }, [refreshKey]);

  // Apply IPO/FO filter (driven by top radio)
  const filteredByType = useMemo(
    () => allDeals.filter((d) => (d.deal_type || "").toUpperCase() === selectedType),
    [allDeals, selectedType]
  );

  // Search options built from filtered list
  const options: Option[] = useMemo(
    () =>
      filteredByType.map((f) => {
        const dateShort = formatDateShort(f.pricing_date);
        const predTitle = hasPrediction(f.t1d_pred)
          ? String(f.t1d_pred)[0].toUpperCase() + String(f.t1d_pred).slice(1)
          : "Not available";
        return {
          ticker: f.ticker,
          pricing_date: f.pricing_date,
          prediction: f.t1d_pred,
          display: `${f.ticker} on ${dateShort} - ${predTitle}`,
        };
      }),
    [filteredByType]
  );

  // Default: top 5 newest; Search: all matches from filtered list
  const filteredCards: RecentPrediction[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !selectedTicker) return filteredByType.slice(0, 5);
    return filteredByType.filter((f) =>
      selectedTicker
        ? f.ticker.toLowerCase() === selectedTicker.toLowerCase()
        : f.ticker.toLowerCase().includes(q)
    );
  }, [filteredByType, query, selectedTicker]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
        <CircularProgress size={20} />
      </Box>
    );
  }
  if (error) {
    return (
      <Typography color="error" textAlign="center" fontSize="0.85rem">
        Error: {error}
      </Typography>
    );
  }
  if (filteredByType.length === 0) {
    return (
      <Typography textAlign="center" fontSize="0.9rem">
        No recent {selectedType} predictions available.
      </Typography>
    );
  }

  const renderPredictionChip = (prediction?: string | null) => {
    if (!hasPrediction(prediction)) {
      return <Chip label="NOT AVAILABLE" size="small" variant="outlined" />;
    }
    return (
      <Chip
        label={(prediction as string).toUpperCase()}
        size="small"
        sx={{
          backgroundColor: mapPredToColor(prediction),
          color: "white",
          fontWeight: "bold",
          height: 22,
          letterSpacing: 0.4,
        }}
      />
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="subtitle1"
        fontWeight={700}
        fontSize={20}
        gutterBottom
        textAlign="center"
        color="#002060"
      >
        Recent {selectedType} Predictions
      </Typography>

      {/* Search (scrollable results; ~5 visible) */}
      <Box sx={{ mb: 2 }}>
        <Autocomplete
          freeSolo
          options={options}
          getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.display)}
          isOptionEqualToValue={(opt, val) =>
            (typeof opt === "string" ? opt : opt.ticker) ===
            (typeof val === "string" ? val : val.ticker)
          }
          onInputChange={(_e, value) => {
            setQuery(value || "");
            setSelectedTicker(null);
          }}
          onChange={(_e, value) => {
            if (typeof value === "string") {
              setSelectedTicker(value || null);
              setQuery(value || "");
            } else if (value && typeof value === "object") {
              setSelectedTicker(value.ticker);
              setQuery(value.ticker);
            } else {
              setSelectedTicker(null);
            }
          }}
          renderOption={(props, option) => {
            const colorDot = mapPredToColor(option.prediction);
            return (
              <Box
                component="li"
                {...props}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: colorDot,
                    flex: "0 0 auto",
                  }}
                />
                <Typography variant="body2">{option.display}</Typography>
              </Box>
            );
          }}
          ListboxProps={{
            sx: { maxHeight: 240, overflowY: "auto" },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={`Search ${selectedType} ticker (e.g., NVDA)`}
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
                    <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                  </Box>
                ),
              }}
            />
          )}
        />
      </Box>

      {/* Cards */}
      <Grid container spacing={2}>
        {filteredCards.map((form, i) => {
          const isFO = (form.deal_type || "").toUpperCase() === "FO";
          const stChip = statusChip(form.deal_status);
          const sectorLabel = formatSector(form.sector);

          return (
            <Grid item xs={12} key={`${form.ticker}-${form.pricing_date}-${i}`}>
              <Card
                onClick={() => onSelect(form)}
                sx={{
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.15s",
                  "&:hover": { boxShadow: 4, transform: "translateY(-3px)" },
                  borderRadius: 2,
                  backgroundColor: CARD_BG,
                  border: "1px solid",
                  borderColor: CARD_BORDER,
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: ACCENT,
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                  },
                }}
                variant="outlined"
              >
                <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight={800} color="#0f172a">
                      {form.ticker}
                    </Typography>
                    {renderPredictionChip(form.t1d_pred)}
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={stChip.label} color={stChip.color} variant="outlined" />
                      <Chip size="small" label={(form.deal_type || "N/A").toUpperCase()} variant="outlined" />
                    </Stack>
                    <Typography variant="body2" sx={{ color: grey[700], fontWeight: 600 }}>
                      {formatDateShort(form.pricing_date)}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Deal block ONLY (simple + clear) */}
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <Typography variant="overline" sx={{ letterSpacing: 0.6, fontWeight: "bold" }}>
                        Deal
                      </Typography>
                      <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                        {metricRow("Deal Size", fmtMoneyM(form.deal_size), "Aggregate offering size")}
                        {metricRow("Sector", sectorLabel)}
                        {metricRow("Region", form.region || "N/A")}
                      </Stack>
                    </Grid>

                    {/* FO-only block */}
                    {isFO && (
                      <Grid item xs={12}>
                        <Typography variant="overline" sx={{ color: grey[600], letterSpacing: 0.6 }}>
                          Offering Dynamics (FO)
                        </Typography>
                        <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                          {metricRow(
                            "Discount from Announcement",
                            fmtPct(form.discount_from_announcement_price),
                            "Issue price vs announcement reference"
                          )}
                          {metricRow(
                            "Change in Price from T-1D to Issue",
                            fmtPct(form.issue_to_previous_day_close),
                            "Relative change from T-1 close to issue price"
                          )}
                        </Stack>
                      </Grid>
                    )}
                  </Grid>

                  {/* Footer removed (simplified card) */}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Footer hint */}
      {!query && !selectedTicker && (
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: grey[700] }}>
          Showing the latest 5 deals. Search a ticker above to see more details.
        </Typography>
      )}
    </Box>
  );
};

export default RecentPredictionsPanel;
