import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Stack,
  Tooltip,
} from "@mui/material";
import { green, red, grey } from "@mui/material/colors";
import RecentSearchBar, { SearchOption, sameTicker } from "./RecentSearchBar";

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
  sentiment_pdf?: string | null;
  revenue?: number | string | null;
  revenue_growth?: number | string | null;
  net_profit_margin?: number | string | null;
  issue_to_previous_day_close?: number | string | null;
  t1d_open_return_category?: string | null;
  t1d_return_from_bloomberg_category?: string | null;
  issue_price?: number | string | null;
  previous_day_close_price?: number | string | null;
  t1d_open_price?: number | string | null;
  t1d_close_price?: number | string | null;
  t1d_low_price?: number | string | null;
  t1d_high_price?: number | string | null;
  t1d_vwap_price?: number | string | null;
}

interface ApiResponse {
  data: RecentPrediction[];
}

interface RecentPredictionsPanelProps {
  selectedType: "IPO" | "FO";
  onSelect: (item: RecentPrediction) => void;
  refreshKey?: number;
  prefillTicker?: { ticker: string; pricing_date?: string | null } | null;
  onTypeChange?: (type: "IPO" | "FO") => void;
}

/** ----- helpers ----- */
const monthShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatDateShort = (dateString?: string) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "N/A";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = monthShort[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  return `${dd} ${mm} ${yyyy}`;
};

// "YYYY-MM-DD" from incoming value; prefer literal prefix to avoid tz shifts
const dateKey = (dateLike: string): string => {
  const m = /^\d{4}-\d{2}-\d{2}/.exec(dateLike);
  if (m) return m[0];
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const normalizePrediction = (p?: string | null) =>
  (p || "").trim().toLowerCase();

const hasPrediction = (p?: string | null) => {
  const n = normalizePrediction(p);
  return (
    n === "positive" ||
    n === "positive return" ||
    n === "negative" ||
    n === "low return" ||
    n === "neutral"
  );
};

const mapPredToColor = (p?: string | null) => {
  const n = normalizePrediction(p);
  if (n === "positive" || n === "positive return") return green[600];
  if (n === "negative" || n === "low return") return red[500];
  if (n === "neutral") return grey[700];
  return grey[500];
};

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

const parseNumberLike = (val?: number | string | null): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Number.isNaN(val) ? null : val;
  const n = parseFloat(String(val).replace(/[^\d.-]/g, ""));
  return Number.isNaN(n) ? null : n;
};

const fmtMoneyM = (v?: number | string | null) => {
  const n = parseNumberLike(v);
  return n === null ? "N/A" : `$${n.toFixed(1)}M`;
};

const fmtPct = (v?: number | string | null) => {
  const n = parseNumberLike(v);
  return n === null ? "N/A" : `${n.toFixed(1)}%`;
};

// simple numeric display for issue price
const fmtPrice = (v?: number | string | null) => {
  const n = parseNumberLike(v);
  return n === null ? "N/A" : n.toFixed(2);
};

const tickerKey = (t?: string) => (t || "").replace(/\s+/g, "").toUpperCase();

const statusChip = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "issued") return { color: "success" as const, label: "Issued" };
  if (s === "announced") return { color: "info" as const, label: "Announced" };
  if (s === "price range")
    return { color: "secondary" as const, label: "Price Range" };
  return { color: "default" as const, label: status || "Status" };
};

const metricRow = (
  label: string,
  value: React.ReactNode,
  tooltip?: string
) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    {tooltip ? (
      <Tooltip title={tooltip} arrow>
        <Typography variant="body2" sx={{ color: grey[700] }}>
          {label}
        </Typography>
      </Tooltip>
    ) : (
      <Typography variant="body2" sx={{ color: grey[700] }}>
        {label}
      </Typography>
    )}

    <Typography
      variant="body2"
      sx={{ fontWeight: 600, color: "#0f172a" }}
    >
      {value}
    </Typography>
  </Stack>
);

const RecentPredictionsPanel: React.FC<RecentPredictionsPanelProps> = ({
  selectedType,
  onSelect,
  refreshKey,
  prefillTicker,
  onTypeChange,
}) => {
  const [allDeals, setAllDeals] = useState<RecentPrediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [query, setQuery] = useState<string>("");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const lastAutoSelectKey = useRef<string | null>(null);

  // for scroll-to-selected
  const selectedCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRecent = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/recent_predictions/`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          keepalive: true,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const json: ApiResponse = await res.json();

        // Sort: pricing_date desc, then ticker asc
        const sorted = (json.data || []).slice().sort((a, b) => {
          const da = new Date(a.pricing_date).getTime();
          const db = new Date(b.pricing_date).getTime();
          if (db !== da) return db - da;
          const ta = (a.ticker || "").toUpperCase();
          const tb = (b.ticker || "").toUpperCase();
          return ta.localeCompare(tb);
        });

        if (isMounted) setAllDeals(sorted);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecent();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // Clear search whenever IPO/FO changes
  useEffect(() => {
    setQuery("");
    setSelectedTicker(null);
    setSelectedDateKey(null);
  }, [selectedType]);

  // Apply IPO/FO filter
  const filteredByType = useMemo(
    () =>
      allDeals.filter(
        (d) => (d.deal_type || "").toUpperCase() === selectedType
      ),
    [allDeals, selectedType]
  );

  // Search options (add stable dateKey)
  const options: SearchOption[] = useMemo(
    () =>
      filteredByType.map((f) => {
        const dk = dateKey(f.pricing_date);
        const dateShort = formatDateShort(dk);
        return {
          ticker: f.ticker,
          pricing_date: f.pricing_date,
          dateKey: dk,
          display: `${f.ticker} - ${dateShort}`,
        };
      }),
    [filteredByType]
  );

  // Cards data
  const filteredCards: RecentPrediction[] = useMemo(() => {
    // exact selection: ticker-equivalent + dateKey
    if (selectedTicker && selectedDateKey) {
      return filteredByType.filter(
        (f) =>
          sameTicker(f.ticker, selectedTicker) &&
          dateKey(f.pricing_date) === selectedDateKey
      );
    }
    // free text by ticker
    const q = query.trim().toLowerCase();
    if (!q) return filteredByType.slice(0, 5);
    return filteredByType.filter((f) => f.ticker.toLowerCase().includes(q));
  }, [filteredByType, query, selectedTicker, selectedDateKey]);

  // Scroll to the selected card, if any
  useEffect(() => {
    if (selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [filteredCards.length]);

  // Auto-select a recent prediction card when a ticker is chosen from the top search
  useEffect(() => {
    if (!prefillTicker?.ticker || loading || error) return;

    const targetTicker = prefillTicker.ticker;
    const targetDateKey = prefillTicker.pricing_date
      ? dateKey(prefillTicker.pricing_date)
      : null;

    const candidates = filteredByType.filter((d) => sameTicker(d.ticker, targetTicker));

    // If no match in current type, try switching to the other type if available
    if (candidates.length === 0) {
      const fallback = allDeals.find((d) => sameTicker(d.ticker, targetTicker));
      const fallbackType = (fallback?.deal_type || "").toUpperCase() as "IPO" | "FO" | "";
      if (fallback && fallbackType && fallbackType !== selectedType) {
        onTypeChange?.(fallbackType);
        return; // wait for selectedType to change, then effect reruns
      }
      if (!fallback) return;
      candidates.push(fallback);
    }

    let chosen = candidates[0];
    if (targetDateKey) {
      const exact = candidates.find(
        (c) => dateKey(c.pricing_date) === targetDateKey
      );
      if (exact) chosen = exact;
    }

    const chosenKey = `${tickerKey(chosen.ticker)}-${dateKey(
      chosen.pricing_date
    )}`;
    if (lastAutoSelectKey.current === chosenKey) return;
    lastAutoSelectKey.current = chosenKey;

    setSelectedTicker(chosen.ticker);
    setSelectedDateKey(dateKey(chosen.pricing_date));
    setQuery(chosen.ticker);
    onSelect(chosen);
  }, [prefillTicker, filteredByType, loading, error, onSelect]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100px"
      >
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

  const handleSelectFromSearch = (opt: SearchOption | null) => {
    if (!opt) {
      setSelectedTicker(null);
      setSelectedDateKey(null);
      return;
    }
    setSelectedTicker(opt.ticker);
    setSelectedDateKey(opt.dateKey);
    // keep input text friendly (ticker only)
    setQuery(opt.ticker);
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

      <RecentSearchBar
        options={options}
        inputValue={query}
        loading={loading}
        selectedTypeLabel={selectedType}
        onInputChange={(v) => {
          setQuery(v);
          setSelectedTicker(null);
          setSelectedDateKey(null);
        }}
        onSelectOption={handleSelectFromSearch}
      />

      {/* Cards */}
      <Grid container spacing={2}>
        {filteredCards.map((form, i) => {
          const isFO = (form.deal_type || "").toUpperCase() === "FO";
          const stChip = statusChip(form.deal_status);
          const sectorLabel = formatSector(form.sector);
          const hasSentiment = Boolean((form.sentiment_pdf || "").trim());

          const isExactSelected =
            selectedTicker &&
            selectedDateKey &&
            sameTicker(form.ticker, selectedTicker) &&
            dateKey(form.pricing_date) === selectedDateKey;

          return (
            <Grid
              item
              xs={12}
              key={`${form.ticker}-${form.pricing_date}-${i}`}
              ref={isExactSelected ? selectedCardRef : null}
            >
              <Card
                onClick={() => onSelect(form)}
                sx={{
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.15s",
                  "&:hover": { boxShadow: 4, transform: "translateY(-3px)" },
                  borderRadius: 2,
                  backgroundColor: CARD_BG,
                  border: "1px solid",
                  borderColor: isExactSelected ? "primary.main" : CARD_BORDER,
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: isExactSelected
                      ? "primary.main"
                      : ACCENT,
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                  },
                }}
                variant="outlined"
              >
                <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                  {/* Header */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="h6" fontWeight={800} color="#0f172a">
                      {form.ticker}
                    </Typography>
                    {renderPredictionChip(form.t1d_pred)}
                  </Box>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={stChip.label}
                        color={stChip.color}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={(form.deal_type || "N/A").toUpperCase()}
                        variant="outlined"
                      />
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{ color: grey[700], fontWeight: 600 }}
                    >
                      {formatDateShort(dateKey(form.pricing_date))}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Deal block ONLY */}
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <Typography
                        variant="overline"
                        sx={{ letterSpacing: 0.6, fontWeight: "bold" }}
                      >
                        Deal
                      </Typography>
                      <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                        {metricRow(
                          "Deal Size",
                          fmtMoneyM(form.deal_size),
                          "Aggregate offering size"
                        )}
                        {metricRow(
                          "Issue Price",
                          fmtPrice(form.issue_price)
                        )}
                        {metricRow("Sector", sectorLabel)}
                        {metricRow("Region", form.region || "N/A")}
                      </Stack>
                    </Grid>

                    {/* FO-only block */}
                    {isFO && (
                      <Grid item xs={12}>
                        <Typography
                          variant="overline"
                          sx={{ color: grey[600], letterSpacing: 0.6 }}
                        >
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
                        {/* {metricRow(
                          "Sentiment Analysis",
                          hasSentiment ? (
                            <a
                              href={(form.sentiment_pdf || "").trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#1d4ed8", fontWeight: 600 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open PDF
                            </a>
                          ) : (
                            "Not Available"
                          )
                        )} */}
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {!query && !selectedTicker && (
        <Typography
          variant="body2"
          sx={{ mt: 2, textAlign: "center", color: grey[700] }}
        >
          Showing the latest 5 deals. Search a ticker above to see more details.
        </Typography>
      )}
    </Box>
  );
};

export default RecentPredictionsPanel;
