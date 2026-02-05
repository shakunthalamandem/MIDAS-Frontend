import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import FormSwitcher from "./FormSwitcher";
import RecentPredictionsPanel from "./RecentPredictionsPanel";
import { Block } from "../GhcAi/Utils/ComponentsUtils";
import IPOForm from "./USIPO/IPOForm";
import FOForm from "./USFO/FOForm";

// ---- Helpers ----
const toNullableNumber = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Finds the first present (non-null/undefined) value among the provided keys
const pick = (obj: any, keys: string[]) => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return null;
};

// Parse sentiment JSON (string or object) into renderer blocks
const parseSentimentBlocks = (raw: unknown): Block[] => {
  if (!raw) return [];

  const extractBlocks = (val: any): Block[] => {
    if (Array.isArray(val)) return val as Block[];
    if (val && typeof val === "object") {
      if (Array.isArray((val as any).blocks)) return (val as any).blocks as Block[];
      if (Array.isArray((val as any).answer)) return (val as any).answer as Block[];
      if (Array.isArray((val as any).sentiment)) return (val as any).sentiment as Block[];
      if (Array.isArray((val as any).data)) return (val as any).data as Block[];
    }
    return [];
  };

  // Strings may be plain JSON or a stringified object/array; try parsing, otherwise ignore
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      const blocks = extractBlocks(parsed);
      if (blocks.length) return blocks;
    } catch (err) {
      // Retry with a loose conversion from python-style repr to JSON
      try {
        let normalized = raw.trim();
        normalized = normalized
          .replace(/\bNone\b/g, "null")
          .replace(/\bTrue\b/g, "true")
          .replace(/\bFalse\b/g, "false")
          .replace(/'/g, '"');
        const parsed = JSON.parse(normalized);
        const blocks = extractBlocks(parsed);
        if (blocks.length) return blocks;
      } catch (_err) {
        const trimmed = raw.trim();
        if (trimmed) {
          // Fallback: treat plain text as a single text block
          return [{ type: "text", content: trimmed } as Block];
        }
        console.warn("Sentiment string is not JSON; skipping blocks");
        return [];
      }
    }
  }

  try {
    return extractBlocks(raw);
  } catch (err) {
    console.error("Unable to parse sentiment blocks", err);
    return [];
  }
};

// ---- Defaults ----
const defaultFOValues = {
  ticker: "",
  pricing_date: null as Date | null,
  deal_type: "FO",
  region: "US",
  deal_size_category: "",
  percentage_primary_category: "",
  discount_from_announcement_price_category: "",
  allocation_deal_size_percentage_category: "",
  allocation_percentage_category: "",
  selected_bank_category: "",
  sponsor_yn_category: "",
  sector_category: "",
  deal_status: "Announced",
  GDP: "Stable",
  Inflation: "Stable",
  Treasury: "Stable",
  target: "T1D",

  revenue_category: "",
  revenue_growth_category: "",
  net_profit_margin_category: "",
  issue_price: 0,
  previous_day_close_price: 0,
  issue_to_pre_day_close_return_category: 0,
  t1d_open_return_category: null as number | null,
  t1d_return_from_bloomberg_category: null as number | null,

  t1d_open_price: null as number | null,
  t1d_close_price: null as number | null,
  t1d_low_price: null as number | null,
  t1d_high_price: null as number | null,
  t1d_vwap_price: null as number | null,

  request_from: "ai_ml",
  create_new_record: true,
};

const defaultIPOValues = {
  ticker: "",
  pricing_date: null as Date | null,
  deal_type: "IPO",
  region: "US",
  deal_size_category: "",
  percentage_primary_category: "",
  allocation_deal_size_percentage_category: "",
  allocation_percentage_category: "",
  selected_bank_category: "",
  sponsor_yn_category: "",
  sector_category: "",
  deal_status: "Announced",
  GDP: "Stable",
  Inflation: "Stable",
  Treasury: "Stable",
  target: "T1D",
  revenue_category: "",
  revenue_growth_category: "",
  net_profit_margin_category: "",
  issue_price: 0,
  t1d_open_return_category: null as number | null,
  t1d_return_from_bloomberg_category: null as number | null,

  t1d_open_price: null as number | null,
  t1d_close_price: null as number | null,
  t1d_low_price: null as number | null,
  t1d_high_price: null as number | null,
  t1d_vwap_price: null as number | null,

  // create new record flag
  request_from: "ai_ml",
  create_new_record: true,
};

interface OptionsData {
  region: string[];
  selected_bank: string[];
  sponsor: string[];
  sector: string[];
  target: string[];
  deal_status: string[];
}

interface PredictionLayoutProps {
  options: OptionsData;
  prefillTicker?: { ticker: string; pricing_date?: string | null } | null;
}

const PredictionLayout: React.FC<PredictionLayoutProps> = ({
  options,
  prefillTicker,
}) => {
  const [selectedType, setSelectedType] = useState<"IPO" | "FO">("FO");
  const [foValues, setFoValues] = useState({ ...defaultFOValues });
  const [ipoValues, setIpoValues] = useState({ ...defaultIPOValues });
  const [foAutoPredict, setFoAutoPredict] = useState(false);
  const [ipoAutoPredict, setIpoAutoPredict] = useState(false);
  const [foFormKey, setFoFormKey] = useState(0);
  const [ipoFormKey, setIpoFormKey] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  const [sentiment, setSentiment] = useState("");
  const [sentimentPdfUrl, setSentimentPdfUrl] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRecentRefresh = () => setRefreshKey((k) => k + 1);

  const sentimentBlocks = useMemo(() => parseSentimentBlocks(sentiment), [sentiment]);

  useEffect(() => {
    if (!prefillTicker?.ticker) return;
    const trimmedTicker = prefillTicker.ticker.trim();
    setFoValues((prev) => ({ ...prev, ticker: trimmedTicker }));
    setIpoValues((prev) => ({ ...prev, ticker: trimmedTicker }));
  }, [prefillTicker]);

  const handleTypeChange = (type: "IPO" | "FO") => {
    setSelectedType(type);
    setSentimentPdfUrl("");
  };

  // ---- When a recent card is clicked: prefill + scroll to form ----
  const handlePredictionSelect = (item: any) => {
    const type = (item.deal_type || "").toUpperCase() as "IPO" | "FO";
    setSentiment(item?.sentiment || "");

    if (type === "FO") {
      setFoValues({
        ...defaultFOValues,
        ticker: item.ticker || "",
        pricing_date: item.pricing_date ? new Date(item.pricing_date) : null,
        deal_type: "FO",
        region: item.region || "US",

        sponsor_yn_category:
          item.sponsor === "Y" ? "Y" : item.sponsor === "N" ? "N" : "",

        deal_size_category: item.deal_size ? String(item.deal_size) : "0",
        percentage_primary_category:
          item.primary_percentage != null
            ? String(item.primary_percentage)
            : "",

        sector_category: item.sector || "",

        discount_from_announcement_price_category:
          item.discount_from_announcement_price != null
            ? String(item.discount_from_announcement_price)
            : "",

        allocation_deal_size_percentage_category:
          item.allocation_as_percentage_of_deal_size != null
            ? String(item.allocation_as_percentage_of_deal_size)
            : "",

        allocation_percentage_category:
          item.allocation_as_percentage_of_ioi != null
            ? String(item.allocation_as_percentage_of_ioi)
            : "",

        selected_bank_category: item.lead_bank || "",
        deal_status: item.deal_status || "Announced",

        GDP: "Stable",
        Inflation: "Stable",
        Treasury: "Stable",
        target: "T1D",

        revenue_category: item.revenue != null ? String(item.revenue) : "",
        revenue_growth_category:
          item.revenue_growth != null ? String(item.revenue_growth) : "",
        net_profit_margin_category:
          item.net_profit_margin != null ? String(item.net_profit_margin) : "",

        // numeric base fields
        issue_price:
          item.issue_price != null ? Number(item.issue_price) : 0,

        previous_day_close_price:
          item.previous_day_close_price != null
            ? Number(item.previous_day_close_price)
            : 0,

        issue_to_pre_day_close_return_category:
          item.issue_to_previous_day_close != null
            ? Number(item.issue_to_previous_day_close)
            : 0,

        // new nullable price fields
        t1d_open_price: toNullableNumber(
          pick(item, ["t1d_open_price"])
        ),
        t1d_close_price: toNullableNumber(
          pick(item, ["t1d_close_price"])
        ),
        t1d_low_price: toNullableNumber(
          pick(item, ["t1d_low_price"])
        ),
        t1d_high_price: toNullableNumber(
          pick(item, ["t1d_high_price"])
        ),
        t1d_vwap_price: toNullableNumber(
          pick(item, ["t1d_vwap_price"])
        ),

        // returns (nullable)
        t1d_open_return_category: toNullableNumber(
          pick(item, ["t1d_open_return", "t1d_open_return_category"])
        ),
        t1d_return_from_bloomberg_category: toNullableNumber(
          pick(item, ["t1d_return_from_bloomberg_category"])
        ),

        request_from: "ai_ml",
        create_new_record: true,
      });

      setSelectedType("FO");
      setFoAutoPredict(true);
      setFoFormKey((k) => k + 1); // remount FO form to clear old internal state
    } else {
      setIpoValues({
        ...defaultIPOValues,
        ticker: item.ticker || "",
        pricing_date: item.pricing_date ? new Date(item.pricing_date) : null,
        deal_type: "IPO",
        region: item.region || "US",

        deal_size_category: item.deal_size ? String(item.deal_size) : "0",
        percentage_primary_category:
          item.primary_percentage != null
            ? String(item.primary_percentage)
            : "",

        allocation_deal_size_percentage_category:
          item.allocation_as_percentage_of_deal_size != null
            ? String(item.allocation_as_percentage_of_deal_size)
            : "",

        allocation_percentage_category:
          item.allocation_as_percentage_of_ioi != null
            ? String(item.allocation_as_percentage_of_ioi)
            : "",

        selected_bank_category: item.lead_bank || "",
        sponsor_yn_category:
          item.sponsor === "Y" ? "Y" : item.sponsor === "N" ? "N" : "",
        sector_category: item.sector || "",
        deal_status: item.deal_status || "Announced",

        GDP: "Stable",
        Inflation: "Stable",
        Treasury: "Stable",
        target: "T1D",

        revenue_category: item.revenue != null ? String(item.revenue) : "",
        revenue_growth_category:
          item.revenue_growth != null ? String(item.revenue_growth) : "",
        net_profit_margin_category:
          item.net_profit_margin != null ? String(item.net_profit_margin) : "",

        // base price + returns
        issue_price:
          item.issue_price != null ? Number(item.issue_price) : 0,

        t1d_open_return_category: toNullableNumber(
          pick(item, ["t1d_open_return", "t1d_open_return_category"])
        ),
        t1d_return_from_bloomberg_category: toNullableNumber(
          pick(item, ["t1d_return_from_bloomberg_category"])
        ),

        // new price fields for IPO
        t1d_open_price: toNullableNumber(
          pick(item, ["t1d_open_price"])
        ),
        t1d_close_price: toNullableNumber(
          pick(item, ["t1d_close_price"])
        ),
        t1d_low_price: toNullableNumber(
          pick(item, ["t1d_low_price"])
        ),
        t1d_high_price: toNullableNumber(
          pick(item, ["t1d_high_price"])
        ),
        t1d_vwap_price: toNullableNumber(
          pick(item, ["t1d_vwap_price"])
        ),

        request_from: "ai_ml",
        create_new_record: true,
      });

      setSelectedType("IPO");
      setIpoAutoPredict(true);
      setIpoFormKey((k) => k + 1); // remount IPO form to clear old internal state
    }
    setSentiment(item.sentiment)
    setSentimentPdfUrl((item.sentiment_pdf || "").trim());

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sentimentPdfHref = (sentimentPdfUrl || "").trim();
  const hasSentimentPdf = Boolean(sentimentPdfHref);

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <FormSwitcher
          selectedType={selectedType}
          onChangeType={handleTypeChange}
        />

        {/* {hasSentimentPdf && (
          <Button
            component="a"
            href={sentimentPdfHref}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 999,
              px: 3,
              py: 1.05,
              color: "#fff",
              backgroundImage:
                "linear-gradient(135deg, #1f3b8f 0%, #3a6cf6 45%, #2fb5d2 100%)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              border: "1px solid rgba(255,255,255,0.22)",
              position: "relative",
              top: "-2px",
              "&:hover": {
                backgroundImage:
                  "linear-gradient(135deg, #1c347f 0%, #325fda 45%, #2a9eb7 100%)",
                boxShadow: "0 6px 14px rgba(0,0,0,0.22)",
              },
            }}
          >
            Click Here for Sentiment Analysis
          </Button>
        )} */}
      </Box>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} md={9}>
          <Box ref={formRef} sx={{ scrollMarginTop: 16 }}>
            {selectedType === "FO" ? (
              <FOForm
                key={foFormKey}
                values={foValues}
                setValues={setFoValues}
                options={options}
                sentimentBlocks={sentimentBlocks}
                autoPredict={foAutoPredict}
                onAutoPredictComplete={() => setFoAutoPredict(false)}
                onPredicted={bumpRecentRefresh}
              />
            ) : (
              <IPOForm
                key={ipoFormKey}
                values={ipoValues}
                setValues={setIpoValues}
                options={options}
                sentimentBlocks={sentimentBlocks}
                autoPredict={ipoAutoPredict}
                onAutoPredictComplete={() => setIpoAutoPredict(false)}
                onPredicted={bumpRecentRefresh}
              />
            )}
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={3}
          sx={{
            position: { md: "sticky" },
            top: { md: 20 },
            height: "fit-content",
          }}
        >
          <RecentPredictionsPanel
            selectedType={selectedType}
            onSelect={handlePredictionSelect}
            refreshKey={refreshKey}
            prefillTicker={prefillTicker || undefined}
            onTypeChange={handleTypeChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PredictionLayout;
