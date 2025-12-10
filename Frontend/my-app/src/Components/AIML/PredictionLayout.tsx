import React, { useRef, useState } from "react";
import { Box, Grid } from "@mui/material";
import FormSwitcher from "./FormSwitcher";
import FOForm from "./FOForm";
import IPOForm from "./IPOForm";
import RecentPredictionsPanel from "./RecentPredictionsPanel";

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

  // NEW: fundamentals + feature
  revenue_category: "",
  revenue_growth_category: "",
  net_profit_margin_category: "",
  issue_price: 0,
  t1d_close_price_category: 0,
  issue_to_pre_day_close_return_category: 0,
  t1d_open_return_category: null as number | null,
  t1d_return_from_bloomberg_category: null as number | null,

  t1d_open_price: null as number | null,
  t1d_close_price: null as number | null,

  // create new record flag
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
}

const PredictionLayout: React.FC<PredictionLayoutProps> = ({ options }) => {
  const [selectedType, setSelectedType] = useState<"IPO" | "FO">("FO");
  const [foValues, setFoValues] = useState({ ...defaultFOValues });
  const [ipoValues, setIpoValues] = useState({ ...defaultIPOValues });
  const [foAutoPredict, setFoAutoPredict] = useState(false);
  const [ipoAutoPredict, setIpoAutoPredict] = useState(false);
  const [foFormKey, setFoFormKey] = useState(0); // NEW
  const [ipoFormKey, setIpoFormKey] = useState(0); // NEW
  const formRef = useRef<HTMLDivElement>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRecentRefresh = () => setRefreshKey((k) => k + 1);

  const handleTypeChange = (type: "IPO" | "FO") => {
    setSelectedType(type);
  };

  // ---- When a recent card is clicked: prefill + scroll to form ----
  const handlePredictionSelect = (item: any) => {
    const type = (item.deal_type || "").toUpperCase() as "IPO" | "FO";

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
        issue_price:
          item.issue_price != null
            ? Number(item.issue_price)
            : 0,
        t1d_close_price_category:
          item.t1d_close_price_category != null
            ? Number(item.t1d_close_price_category)
            : 0,
        issue_to_pre_day_close_return_category:
          item.issue_to_previous_day_close != null
            ? Number(item.issue_to_previous_day_close)
            : 0,
        t1d_open_return_category: toNullableNumber(
          pick(item, ["t1d_open_return", "t1d_open_return_category"])
        ),
        t1d_return_from_bloomberg_category: toNullableNumber(
          pick(item, [
            "t1d_return_from_bloomberg_category",
          ])
        ), // may be null
      });
      setSelectedType("FO");
      setFoAutoPredict(true);
      setFoFormKey((k) => k + 1); // NEW: remount FO form to clear old state
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
          t1d_open_return_category: toNullableNumber(
          pick(item, ["t1d_open_return", "t1d_open_return_category"])
        ),
        issue_price:
          item.issue_price != null
            ? Number(item.issue_price)
            : 0,
        t1d_return_from_bloomberg_category: toNullableNumber(
          pick(item, [
            "t1d_return_from_bloomberg_category",
          ])
        ),
      });
      setSelectedType("IPO");
      setIpoAutoPredict(true);
      setIpoFormKey((k) => k + 1); // NEW: remount IPO form to clear old state
    }

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 2,
        }}
      >
        <FormSwitcher
          selectedType={selectedType}
          onChangeType={handleTypeChange}
        />
      </Box>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} md={9}>
          <Box ref={formRef} sx={{ scrollMarginTop: 16 }}>
            {selectedType === "FO" ? (
              <FOForm
                key={foFormKey} // NEW
                values={foValues}
                setValues={setFoValues}
                options={options}
                autoPredict={foAutoPredict}
                onAutoPredictComplete={() => setFoAutoPredict(false)}
                onPredicted={bumpRecentRefresh}
              />
            ) : (
              <IPOForm
                key={ipoFormKey} // NEW
                values={ipoValues}
                setValues={setIpoValues}
                options={options}
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
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PredictionLayout;
  