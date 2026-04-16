import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DealUnifiedRow } from "./dealsDataService";

/** Field metadata used to auto-render the form. */
interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "textarea";
  group: string;
}

const FIELD_DEFS: FieldDef[] = [
  // Core
  { key: "ticker", label: "Ticker", type: "text", group: "Core Deal Info" },
  { key: "issuer_name", label: "Issuer Name", type: "text", group: "Core Deal Info" },
  { key: "pricing_date", label: "Pricing Date", type: "date", group: "Core Deal Info" },
  { key: "region", label: "Region", type: "text", group: "Core Deal Info" },
  { key: "deal_type", label: "Deal Type", type: "text", group: "Core Deal Info" },
  { key: "fo_type", label: "FO Type", type: "text", group: "Core Deal Info" },
  { key: "ipo_type", label: "IPO Type", type: "text", group: "Core Deal Info" },
  { key: "sector", label: "Sector", type: "text", group: "Core Deal Info" },
  { key: "deal_captain", label: "Deal Captain", type: "text", group: "Core Deal Info" },
  { key: "lead_bank", label: "Lead Bank", type: "text", group: "Core Deal Info" },
  { key: "deal_size", label: "Deal Size", type: "number", group: "Core Deal Info" },
  { key: "deal_status", label: "Deal Status", type: "text", group: "Core Deal Info" },
  { key: "exchange", label: "Exchange", type: "text", group: "Core Deal Info" },
  { key: "deal_id", label: "Deal ID", type: "text", group: "Core Deal Info" },
  { key: "unique_deal_id", label: "Unique Deal ID", type: "text", group: "Core Deal Info" },
  { key: "fs_ticker", label: "FS Ticker", type: "text", group: "Core Deal Info" },
  { key: "multiple_deal_status", label: "Multiple Deal Status", type: "text", group: "Core Deal Info" },

  // Allocation & Pricing
  { key: "sponsor", label: "Sponsor", type: "text", group: "Allocation & Pricing" },
  { key: "primary_percentage", label: "Primary %", type: "number", group: "Allocation & Pricing" },
  { key: "issue_price", label: "Issue Price", type: "number", group: "Allocation & Pricing" },
  { key: "discount_from_announcement_price", label: "Discount From Announcement", type: "number", group: "Allocation & Pricing" },
  { key: "ioi_amount", label: "IOI Amount", type: "number", group: "Allocation & Pricing" },
  { key: "ioi_as_percentage_of_deal_size", label: "IOI % of Deal Size", type: "number", group: "Allocation & Pricing" },
  { key: "allocation_amount", label: "Allocation Amount", type: "number", group: "Allocation & Pricing" },
  { key: "allocation_as_percentage_of_deal_size", label: "Allocation % of Deal Size", type: "number", group: "Allocation & Pricing" },
  { key: "allocation_as_percentage_of_ioi", label: "Allocation % of IOI", type: "number", group: "Allocation & Pricing" },
  { key: "pricing_range_min", label: "Pricing Range Min", type: "number", group: "Allocation & Pricing" },
  { key: "pricing_range_max", label: "Pricing Range Max", type: "number", group: "Allocation & Pricing" },
  { key: "ioi_dollar_value", label: "IOI Dollar Value", type: "number", group: "Allocation & Pricing" },
  { key: "potential_am_quantity", label: "Potential AM Quantity", type: "number", group: "Allocation & Pricing" },
  { key: "ioi_as_percentage_of_deal_size_status", label: "IOI % Status", type: "number", group: "Allocation & Pricing" },
  { key: "pricing_date_status", label: "Pricing Date Status", type: "text", group: "Allocation & Pricing" },

  // Trading & Market
  { key: "launch_date", label: "Launch Date", type: "date", group: "Trading & Market" },
  { key: "trade_date", label: "Trade Date", type: "date", group: "Trading & Market" },
  { key: "expected_listing_date", label: "Expected Listing Date", type: "date", group: "Trading & Market" },
  { key: "market_cap", label: "Market Cap", type: "number", group: "Trading & Market" },
  { key: "_52_week_high", label: "52-Week High", type: "number", group: "Trading & Market" },
  { key: "percentage_below_52_week_high", label: "% Below 52W High", type: "number", group: "Trading & Market" },
  { key: "percentage_change_last_7_days", label: "% Change Last 7D", type: "number", group: "Trading & Market" },
  { key: "shares_outstanding", label: "Shares Outstanding", type: "number", group: "Trading & Market" },
  { key: "percentage_of_free_float", label: "% Free Float", type: "number", group: "Trading & Market" },
  { key: "short_interest", label: "Short Interest", type: "number", group: "Trading & Market" },
  { key: "short_interest_percentage_of_deal", label: "Short Interest % of Deal", type: "number", group: "Trading & Market" },

  // Technical Indicators
  { key: "_3_month_adtv", label: "3M ADTV", type: "number", group: "Technical Indicators" },
  { key: "_3_month_adtv_shares", label: "3M ADTV Shares", type: "number", group: "Technical Indicators" },
  { key: "beta_snp_500", label: "Beta S&P 500", type: "number", group: "Technical Indicators" },
  { key: "_3_month_volatility", label: "3M Volatility", type: "number", group: "Technical Indicators" },
  { key: "rsi_14d", label: "RSI 14D", type: "number", group: "Technical Indicators" },
  { key: "rsi_30d", label: "RSI 30D", type: "number", group: "Technical Indicators" },
  { key: "dmi_14d", label: "DMI 14D", type: "number", group: "Technical Indicators" },
  { key: "macd_9d", label: "MACD 9D", type: "number", group: "Technical Indicators" },
  { key: "dma_50", label: "DMA 50", type: "number", group: "Technical Indicators" },
  { key: "dma_100", label: "DMA 100", type: "number", group: "Technical Indicators" },
  { key: "ltm_fcf_yield", label: "LTM FCF Yield", type: "number", group: "Technical Indicators" },
  { key: "ltm_dividend_yield", label: "LTM Dividend Yield", type: "number", group: "Technical Indicators" },

  // Allocation Metrics
  { key: "times_covered", label: "Times Covered", type: "text", group: "Allocation Metrics" },
  { key: "long_only_allocation_percentage", label: "Long Only Alloc %", type: "number", group: "Allocation Metrics" },
  { key: "hedge_allocation_percentage", label: "Hedge Alloc %", type: "number", group: "Allocation Metrics" },
  { key: "allocation_concentration_percentage", label: "Alloc Concentration %", type: "number", group: "Allocation Metrics" },
  { key: "institutional_allocation_percentage", label: "Institutional Alloc %", type: "number", group: "Allocation Metrics" },
  { key: "retail_allocation_percentage", label: "Retail Alloc %", type: "number", group: "Allocation Metrics" },
  { key: "deal_color", label: "Deal Color", type: "textarea", group: "Allocation Metrics" },
  { key: "deal_color_rating", label: "Deal Color Rating", type: "number", group: "Allocation Metrics" },
  { key: "deal_writeup_rating", label: "Deal Writeup Rating", type: "number", group: "Allocation Metrics" },

  // Financial
  { key: "revenue", label: "Revenue", type: "number", group: "Financial" },
  { key: "revenue_growth", label: "Revenue Growth", type: "number", group: "Financial" },
  { key: "net_profit_margin", label: "Net Profit Margin", type: "text", group: "Financial" },
  { key: "issue_to_previous_day_close", label: "Issue to Prev Day Close", type: "number", group: "Financial" },
  { key: "previous_day_close_price", label: "Prev Day Close Price", type: "number", group: "Financial" },
  { key: "t1d_open_price", label: "T+1D Open Price", type: "number", group: "Financial" },
  { key: "t1d_close_price", label: "T+1D Close Price", type: "number", group: "Financial" },
  { key: "t1d_low_price", label: "T+1D Low Price", type: "number", group: "Financial" },
  { key: "t1d_high_price", label: "T+1D High Price", type: "number", group: "Financial" },
  { key: "t1d_vwap_price", label: "T+1D VWAP Price", type: "number", group: "Financial" },

  // Macro
  { key: "gdp_growth", label: "GDP Growth", type: "text", group: "Macro & Predictions" },
  { key: "inflation_rate", label: "Inflation Rate", type: "text", group: "Macro & Predictions" },
  { key: "treasury_rates", label: "Treasury Rates", type: "text", group: "Macro & Predictions" },

  // Predictions
  { key: "t1d_pred", label: "T+1D Prediction", type: "text", group: "Macro & Predictions" },
  { key: "t1d_confidence", label: "T+1D Confidence", type: "number", group: "Macro & Predictions" },
  { key: "t1d_actual_return", label: "T+1D Actual Return", type: "number", group: "Macro & Predictions" },
  { key: "t1d_version", label: "T+1D Version", type: "text", group: "Macro & Predictions" },
  { key: "t1d_openprice_pred", label: "T+1D Open Prediction", type: "text", group: "Macro & Predictions" },
  { key: "t1d_openprice_confidence", label: "T+1D Open Confidence", type: "number", group: "Macro & Predictions" },
  { key: "t1d_open_return", label: "T+1D Open Return", type: "number", group: "Macro & Predictions" },
  { key: "t1d_openprice_actual_return", label: "T+1D Open Actual Return", type: "number", group: "Macro & Predictions" },
  { key: "t1d_openprice_version", label: "T+1D Open Version", type: "text", group: "Macro & Predictions" },
  { key: "t1w_pred", label: "T+1W Prediction", type: "text", group: "Macro & Predictions" },
  { key: "t1w_confidence", label: "T+1W Confidence", type: "number", group: "Macro & Predictions" },
  { key: "t1w_actual_return", label: "T+1W Actual Return", type: "number", group: "Macro & Predictions" },
  { key: "t1w_version", label: "T+1W Version", type: "text", group: "Macro & Predictions" },
  { key: "t1m_pred", label: "T+1M Prediction", type: "text", group: "Macro & Predictions" },
  { key: "t1m_confidence", label: "T+1M Confidence", type: "number", group: "Macro & Predictions" },
  { key: "t1m_actual_return", label: "T+1M Actual Return", type: "number", group: "Macro & Predictions" },
  { key: "t1m_version", label: "T+1M Version", type: "text", group: "Macro & Predictions" },

  // Ratings
  { key: "t1d_overall_rating", label: "T+1D Overall Rating", type: "text", group: "Ratings & Sentiment" },
  { key: "t1w_overall_rating", label: "T+1W Overall Rating", type: "text", group: "Ratings & Sentiment" },
  { key: "t1m_overall_rating", label: "T+1M Overall Rating", type: "text", group: "Ratings & Sentiment" },
  { key: "writeup_overall_rating", label: "Writeup Overall Rating", type: "number", group: "Ratings & Sentiment" },
  { key: "one_week_sentiment", label: "1W Sentiment", type: "text", group: "Ratings & Sentiment" },
  { key: "one_month_sentiment", label: "1M Sentiment", type: "text", group: "Ratings & Sentiment" },

  // Text fields
  { key: "flag_for_writeup", label: "Flag For Writeup", type: "text", group: "Notes & Summaries" },
  { key: "sentiment", label: "Sentiment", type: "textarea", group: "Notes & Summaries" },
  { key: "socialmedia_retail_sentiment", label: "Social Media Sentiment", type: "textarea", group: "Notes & Summaries" },
  { key: "sentiment_summary", label: "Sentiment Summary", type: "textarea", group: "Notes & Summaries" },
  { key: "sentiment_pdf", label: "Sentiment PDF", type: "text", group: "Notes & Summaries" },
  { key: "few_shot_review", label: "Few Shot Review", type: "textarea", group: "Notes & Summaries" },
  { key: "valuation_summary", label: "Valuation Summary", type: "textarea", group: "Notes & Summaries" },
  { key: "am_strategy_recommendation", label: "AM Strategy Recommendation", type: "textarea", group: "Notes & Summaries" },
  { key: "writeup_finalverdict_summary", label: "Writeup Final Verdict", type: "textarea", group: "Notes & Summaries" },

  // Ownership
  { key: "form_owner", label: "Form Owner", type: "text", group: "Ownership" },
  { key: "form_owner_email", label: "Form Owner Email", type: "text", group: "Ownership" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingDeal: DealUnifiedRow | null; // null = create mode
  saving: boolean;
  onSubmit: (data: Partial<DealUnifiedRow>) => void;
}

const DealFormDialog: React.FC<Props> = ({
  open,
  onClose,
  onSaved,
  existingDeal,
  saving,
  onSubmit,
}) => {
  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (existingDeal) {
      setForm({ ...existingDeal });
    } else {
      setForm({});
    }
  }, [existingDeal, open]);

  const handleChange = (key: string, value: string, type: string) => {
    let parsed: unknown = value;
    if (type === "number") {
      parsed = value === "" ? null : Number(value);
    }
    if (type === "date") {
      parsed = value === "" ? null : value;
    }
    setForm((prev) => ({ ...prev, [key]: parsed }));
  };

  const handleSubmit = () => {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (k === "id" || k === "created_at" || k === "updated_at") continue;
      cleaned[k] = v;
    }
    onSubmit(cleaned);
  };

  const groups = Array.from(new Set(FIELD_DEFS.map((f) => f.group)));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#1e293b",
          color: "#fff",
        }}
      >
        {existingDeal ? `Edit Deal #${existingDeal.id}` : "Create New Deal"}
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#f8fafc", maxHeight: "70vh" }}>
        {groups.map((group) => (
          <Box key={group} sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#1e293b",
                mb: 1,
                borderBottom: "2px solid #3b82f6",
                pb: 0.5,
              }}
            >
              {group}
            </Typography>
            <Grid container spacing={2}>
              {FIELD_DEFS.filter((f) => f.group === group).map((field) => (
                <Grid item xs={12} sm={6} md={4} key={field.key}>
                  <TextField
                    fullWidth
                    size="small"
                    label={field.label}
                    type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                    multiline={field.type === "textarea"}
                    rows={field.type === "textarea" ? 3 : undefined}
                    InputLabelProps={
                      field.type === "date" ? { shrink: true } : undefined
                    }
                    value={form[field.key] ?? ""}
                    onChange={(e) =>
                      handleChange(field.key, e.target.value, field.type)
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f1f5f9" }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
        >
          {saving ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : existingDeal ? (
            "Update Deal"
          ) : (
            "Create Deal"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DealFormDialog;
