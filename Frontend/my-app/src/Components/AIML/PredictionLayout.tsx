import React, { useRef, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import FormSwitcher from "./FormSwitcher";
import FOForm from "./FOForm";
import IPOForm from "./IPOForm";
import RecentPredictionsPanel from "./RecentPredictionsPanel";

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
  const formRef = useRef<HTMLDivElement>(null);

  // ---- Toggle between IPO and FO forms (no scroll here) ----
  const handleTypeChange = (type: "IPO" | "FO") => {
    setSelectedType(type);
    // intentionally no scroll on toggle
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
        deal_size_category: item.deal_size ? String(item.deal_size) : "",
        percentage_primary_category:
          item.primary_percentage != null ? String(item.primary_percentage) : "",
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
        sponsor_yn_category:
          item.sponsor === "Y" ? "Yes" : item.sponsor === "N" ? "No" : "",
        sector_category: item.sector || "",
        deal_status: item.deal_status || "Announced",
        GDP: "Stable",
        Inflation: "Stable",
        Treasury: "Stable",
        target: "T1D",
      });
      setSelectedType("FO");
      setFoAutoPredict(true);
    } else {
      setIpoValues({
        ...defaultIPOValues,
        ticker: item.ticker || "",
        pricing_date: item.pricing_date ? new Date(item.pricing_date) : null,
        deal_type: "IPO",
        region: item.region || "US",
        deal_size_category: item.deal_size ? String(item.deal_size) : "",
        percentage_primary_category:
          item.primary_percentage != null ? String(item.primary_percentage) : "",
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
          item.sponsor === "Y" ? "Yes" : item.sponsor === "N" ? "No" : "",
        sector_category: item.sector || "",
        deal_status: item.deal_status || "Announced",
        GDP: "Stable",
        Inflation: "Stable",
        Treasury: "Stable",
        target: "T1D",
      });
      setSelectedType("IPO");
      setIpoAutoPredict(true);
    }

    // Smooth scroll only on card click
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Top area with centered pill switcher and subtle subtitle */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
        <FormSwitcher selectedType={selectedType} onChangeType={handleTypeChange} />
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", mt: 0.5 }}
        >
          {selectedType === "IPO" ? "Initial Public Offering" : "Follow-on Offering"}
        </Typography>
      </Box>

      <Grid container spacing={2} alignItems="flex-start">
        {/* Left: 75% — form + results */}
        <Grid item xs={12} md={9}>
          <Box
            ref={formRef}
            sx={{
              // makes the scroll target sit nicely below any sticky headers
              scrollMarginTop: 16,
            }}
          >
            {selectedType === "FO" ? (
              <FOForm
                values={foValues}
                setValues={setFoValues}
                options={options}
                autoPredict={foAutoPredict}
                onAutoPredictComplete={() => setFoAutoPredict(false)}
              />
            ) : (
              <IPOForm
                values={ipoValues}
                setValues={setIpoValues}
                options={options}
                autoPredict={ipoAutoPredict}
                onAutoPredictComplete={() => setIpoAutoPredict(false)}
              />
            )}
          </Box>
        </Grid>

        {/* Right: 25% — Recent predictions (sticky) */}
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
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PredictionLayout;
