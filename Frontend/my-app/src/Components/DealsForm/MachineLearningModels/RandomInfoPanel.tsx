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
  Stack,
  TextField,
  Autocomplete,
} from "@mui/material";
import { green, red, grey } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";

interface FormData {
  deal_stats: string;
  ticker: string;
  pricing_date: string;
  deal_type: string;
  region: string;
  sponsor: string | null;
  deal_size: number;
  lead_bank: string | null;
  primary_percentage: number | null;
  sector: string;
  discount_from_announcement_price: number | null;
  allocation_as_percentage_of_deal_size: number | null;
  allocation_as_percentage_of_ioi: number | null;
  gdp_growth: string | null;
  inflation_rate: string | null;
  treasury_rates: string | null;
  t1d_pred: string | null;
}

interface ApiResponse {
  data: FormData[];
}

interface RandomInfoPanelProps {
  onSelect: (formData: FormData) => void;
}

type Option = {
  ticker: string;
  pricing_date: string;
  prediction: string | null;
  display: string; // e.g., "NVDA — 11 Sep 2025 — Positive"
};

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

const RandomInfoPanel: React.FC<RandomInfoPanelProps> = ({ onSelect }) => {
  const [formsAll, setFormsAll] = useState<FormData[]>([]); // ALL results (sorted desc by date)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [query, setQuery] = useState<string>("");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    let didCancel = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${apiUrl}/api/recent_predictions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
        const json: ApiResponse = await response.json();
        const sorted = (json.data || [])
          .slice()
          .sort(
            (a, b) =>
              new Date(b.pricing_date).getTime() -
              new Date(a.pricing_date).getTime()
          );

        if (!didCancel) setFormsAll(sorted);
      } catch (err: any) {
        if (!didCancel) setError(err.message || "Something went wrong");
      } finally {
        if (!didCancel) setLoading(false);
      }
    })();
    return () => {
      didCancel = true;
    };
  }, [apiUrl, token]);

  const handleCardClick = (item: FormData) => {
    sessionStorage.setItem("selected_form_data", JSON.stringify(item));
    sessionStorage.setItem("auto_predict", "true");
    window.open("/machine_learning/equity");
    onSelect?.(item);
  };

  // ----- helpers -----
  const normalizePrediction = (prediction?: string | null) =>
    (prediction || "").trim().toLowerCase();

  const hasPrediction = (prediction?: string | null) => {
    const n = normalizePrediction(prediction);
    return (
      n === "positive" ||
      n === "positive return" ||
      n === "negative" ||
      n === "low return" ||
      n === "neutral"
    );
  };

  const mapPredToColor = (prediction?: string | null) => {
    const n = normalizePrediction(prediction);
    if (n === "positive" || n === "positive return") return green[600];
    if (n === "negative" || n === "low return") return red[500];
    if (n === "neutral") return grey[700];
    return grey[500];
  };

  const renderPredictionChip = (prediction?: string | null) => {
    const label = hasPrediction(prediction)
      ? (prediction as string).toUpperCase()
      : "NOT AVAILABLE";
    return (
      <Chip
        label={label}
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

  const formatSector = (raw?: string) => {
    if (!raw) return "N/A";
    const cleaned = raw.replace(/^(sp500_|nasdaq_|nyse_)/i, "");
    return cleaned
      .split("_")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const formatDateLong = (dateString?: string) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Only IPO/FO background
  const getCardBackgroundColor = (dealType?: string) => {
  if ((dealType || "").toLowerCase() === "ipo") return "#fde2e2"; // light pink
  if ((dealType || "").toLowerCase() === "fo") return "#e8f4fc"; // light blue
  return "#ffffff"; // default (white)
};

  // ----- Search options (ALL results), scrollable list -----
  const options: Option[] = useMemo(
    () =>
      formsAll.map((f) => {
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
    [formsAll]
  );

  // Default: top 5 newest; Search: show all matches in ALL results
  const filteredForms: FormData[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !selectedTicker) return formsAll.slice(0, 5);
    return formsAll.filter((f) =>
      selectedTicker
        ? f.ticker.toLowerCase() === selectedTicker.toLowerCase()
        : f.ticker.toLowerCase().includes(q)
    );
  }, [formsAll, query, selectedTicker]);

  const showSearchHint = !query && !selectedTicker;

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

  if (formsAll.length === 0) {
    return (
      <Typography textAlign="center" fontSize="0.85rem">
        No submitted forms found.
      </Typography>
    );
  }

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
        Recent Predictions
      </Typography>

      {/* Search (scrollable results; show 5 at a time via height) */}
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
            sx: {
              maxHeight: 240, // ~5 items visible, then scroll
              overflowY: "auto",
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search ticker (e.g., NVDA)"
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

      {/* Color Legend */}
      <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
        <Box display="flex" alignItems="center">
          <Box sx={{ width: 16, height: 16, backgroundColor: "#fde2e2", borderRadius: "4px", mr: 0.5 }} />
          <Typography fontSize={12}>IPO</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box sx={{ width: 16, height: 16, backgroundColor: "#e8f4fc", borderRadius: "4px", mr: 0.5 }} />
          <Typography fontSize={12}>FO</Typography>
        </Box>
      </Stack>

      {/* Cards */}
      <Grid container spacing={2}>
        {filteredForms.map((form, i) => {
          const dealStatColor =
            form.deal_stats === "Announced"
              ? "blue"
              : form.deal_stats === "Issued"
              ? "green"
              : form.deal_stats === "Priced"
              ? "orange"
              : "grey";

          return (
            <Grid item xs={12} key={`${form.ticker}-${form.pricing_date}-${i}`}>
              <Card
                onClick={() => handleCardClick(form)}
                sx={{
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.15s",
                  "&:hover": { boxShadow: 4, transform: "translateY(-3px)" },
                  borderRadius: 2,
                  backgroundColor: getCardBackgroundColor(form.deal_type),
                  minHeight: 180,
                  border: "1px solid",
                  borderColor: "#e0e0e0",
                }}
                variant="outlined"
              >
                <CardContent sx={{ py: 4, px: 4 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body1" fontWeight={700} color="#002060">
                      {form.ticker}{" "}
                      <Box component="span" sx={{ fontWeight: 600, ml: 1, color: dealStatColor }}>
                        {form.deal_stats || "N/A"}
                      </Box>
                    </Typography>
                    {renderPredictionChip(form.t1d_pred)}
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={1}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {form.deal_type || "N/A"}
                    </Typography>
                    <Typography variant="body1" color="#002060">
                      {formatDateLong(form.pricing_date)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1">Deal Size</Typography>
                    <Typography variant="body1">
                      {Number.isFinite(Number(form.deal_size))
                        ? `$${Number(form.deal_size).toFixed(1)}M`
                        : "N/A"}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1">Sector</Typography>
                    <Typography variant="body1">{formatSector(form.sector)}</Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" color="#002060">
                      Discount:{" "}
                      <strong>
                        {form.discount_from_announcement_price !== null &&
                        form.discount_from_announcement_price !== undefined
                          ? `${form.discount_from_announcement_price}%`
                          : "N/A"}
                      </strong>
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1">Region</Typography>
                    <Typography variant="body1">{form.region || "N/A"}</Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body1" color="#002060">
                      {form.lead_bank || "N/A"}
                    </Typography>
                    <Typography variant="body1" color="#002060">
                      {form.sponsor === "Y"
                        ? "Sponsored"
                        : form.sponsor === "N"
                        ? "Not Sponsored"
                        : "N/A"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Footer hint */}
      {showSearchHint && (
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: grey[700] }}>
          Showing the latest 5 deals. Search a ticker above to see more details.
        </Typography>
      )}
    </Box>
  );
};

export default RandomInfoPanel;
