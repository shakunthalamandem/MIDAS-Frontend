import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import TickerDropdown from "../Tradingview/TickerDropdown";
import TradingViewWidget from "../Tradingview/TradingViewWidget";
import { Box, Container, Typography, Grid } from "@mui/material";
import MacdCharts from "./MacdCharts";
import RsiMain from "./RsiMain";
import TradingViewData from "../Tradingview/TradingViewData";
import CompanyDetails from "./CompanyDetails";
import VolumeChart from "./VolumeChart";
import VolatilityChart from "./VolatilityChart";
import FundamentalMetricsCard from "../Tabs/FundamentalMetricsCard";
import TrendlyneWidget from "../Tradingview/TrendlyneWidget";
import TrendlyneTechnicalWidget from "../Tradingview/TrendlyneTechnicalWidget";
import TrendlyneChecklistWidget from "../Tradingview/TrendlyneChecklistWidget";
import TrendlyneQVTWidget from "../Tradingview/TrendlyneQVTWidget";

type TechnicalMainProps = {
  initialTicker?: string | null;
  initialRegion?: string | null;
};

const TechnicalMain: React.FC<TechnicalMainProps> = ({
  initialTicker = null,
  initialRegion = null,
}) => {
  const { ticker: paramTicker } = useParams<{ ticker?: string }>();
  const [selectedTicker, setSelectedTicker] = useState<string | null>(
    initialTicker ?? paramTicker ?? ""
  );
  const [region, setRegion] = useState<string | null>(initialRegion ?? null);
  // Keep original ticker for rest of the page; use a cleaned code for Trendlyne widgets only
  const widgetTicker = useMemo(() => {
    if (!selectedTicker) return selectedTicker;
    // Drop trailing "US" (e.g., "AAMI US" -> "AAMI"); otherwise return as-is
    const cleaned = selectedTicker.replace(/\s*US\b/i, "").trim();
    return cleaned || selectedTicker;
  }, [selectedTicker]);
  const allowedRegions = useMemo(() => ["emea", "apac"], []);
  const showRegionalBlock =
    !!region && allowedRegions.includes(region.toLowerCase());
  const noticeDetail = region
    ? `Technical analysis is not available for ${region.toUpperCase()} tickers yet.`
    : "Technical analysis is not available for this ticker.";

  useEffect(() => {
    if (initialTicker) {
      setSelectedTicker(initialTicker);
      return;
    }
    if (paramTicker) {
      setSelectedTicker(paramTicker);
    }
  }, [initialTicker, paramTicker]);

  useEffect(() => {
    setRegion(initialRegion ?? null);
  }, [initialRegion]);

  // Hide small Trendlyne branding badges that appear after widgets
  useEffect(() => {
    const styleId = "hide-trendlyne-branding";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .tl-branding, .tl-powered, .tl-logo-wrapper, .tl-widget-logo, .tl-branding-container {
        display: none !important;
      }
      /* Fallback: hide any direct Trendlyne anchors/images injected near widgets */
      a[href*="trendlyne.com"], a[href*="trendlyne.in"] {
        display: none !important;
      }
      img[src*="trendlyne"], img[data-src*="trendlyne"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
        {/* Header section with title and dropdown */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" style={{ color: "#002060", fontWeight: "bold" }}>
          Stock Performance Dashboard          </Typography>
          {selectedTicker && <TickerDropdown onSelectTicker={setSelectedTicker} />}
        </Box>

        {selectedTicker && (
          <>
            {showRegionalBlock ? (
              <Grid container justifyContent="center" sx={{ mt: 4 }}>
                <Grid item xs={12} md={8}>
                  <Box
                    sx={{
                      borderRadius: 3,
                      border: "1px dashed #cbd5f5",
                      background: "#f8fafc",
                      p: 4,
                      textAlign: "center",
                      boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#0f172a" }}
                    >
                      No data found for this ticker.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#475569", mt: 1, fontWeight: 600 }}
                    >
                      {noticeDetail}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <>
                {/* TradingViewData and CompanyDetails side by side */}
                <Grid container spacing={2} sx={{ marginTop: 3 }}>
                  <Grid item xs={12} md={4}>
                    <TradingViewData ticker={selectedTicker} />
                  </Grid>
                  <Grid item xs={12} md={8}>
                  </Grid>
                </Grid>

            <TradingViewWidget ticker={selectedTicker} />
            <FundamentalMetricsCard ticker={selectedTicker} />
            <MacdCharts ticker={selectedTicker} />

            {/* RSI and Volume side by side */}
            <Grid container spacing={2} sx={{ marginTop: 3 }}>
              <Grid item xs={12} sm={6}>
                <RsiMain ticker={selectedTicker} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <VolumeChart ticker={selectedTicker} />
              </Grid>
            </Grid>

                <VolatilityChart ticker={selectedTicker} />

                {/* Trendlyne widgets block */}
                <Box sx={{ mt: 4, pb: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#002060", mb: 2 }}
                  >
                    
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TrendlyneQVTWidget
                        companyCode={widgetTicker ?? undefined}
                        companyName={widgetTicker ?? ""}
                        className="flex-1 overflow-x-auto bg-white border border-blue-200 dark:bg-gray-800 shadow-md rounded-xl p-6 h-[580px]"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TrendlyneWidget
                        companyCode={widgetTicker ?? undefined}
                        companyName={widgetTicker ?? ""}
                        className="flex-1 overflow-x-auto bg-white border border-blue-200 dark:bg-gray-800 shadow-md rounded-xl p-6 h-[580px]"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TrendlyneTechnicalWidget
                        companyCode={widgetTicker ?? undefined}
                        className="flex-1 overflow-x-auto bg-white border border-blue-200 dark:bg-gray-800 shadow-md rounded-xl p-6 h-[580px]"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TrendlyneChecklistWidget
                        companyCode={widgetTicker ?? undefined}
                        companyName={widgetTicker ?? ""}
                        className="flex-1 overflow-x-auto bg-white border border-blue-200 dark:bg-gray-800 shadow-md rounded-xl p-6 h-[580px]"
                      />
                    </Grid>
                  </Grid>
                </Box>

                <CompanyDetails ticker={selectedTicker} />
              </>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default TechnicalMain;