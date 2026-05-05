import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";
import CumulativePnlChart from "./CumulativePnlChart";
import RealizedVolatilityChart from "./RealizedVolatilityChart";
import DrawdownChart from "./DrawdownChart";
import QuarterlyDealVolumeChart from "./QuarterlyDealVolumeChart";
import RegionSectorPieCharts from "./RegionSectorPieCharts";
import QuarterlyDealPerformanceTable from "./QuarterlyDealPerformanceTable";
import AnalystDeskPnlTable from "./AnalystDeskPnlTable";
import SectorPnlTable from "./SectorPnlTable";
import MonthlyRegionPnlTable from "./MonthlyRegionPnlTable";
import MonthlyStrategyPnlTable from "./MonthlyStrategyPnlTable";
import TopContributorsDetractorsTable from "./TopContributorsDetractorsTable";
import ExposureProgressionChart from "./ExposureProgressionChart";
import SectorExposurePnlBreakdown from "./SectorExposurePnlBreakdown";
import DeskExposurePnlBreakdown from "./DeskExposurePnlBreakdown";
import TopSingleNameExposuresTable from "./TopSingleNameExposuresTable";
import DealScreeningMetricsTable from "./DealScreeningMetricsTable";
import { fetchExposureProgression, ExposurePoint } from "./monthlyDecApi";

const FUND_OPTIONS = [
  { label: "All Funds", value: "" },
  { label: "MPAM", value: "MPAM" },
  { label: "MPF", value: "MPF" },
];

const currentYear = new Date().getFullYear();
const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;

const MonthlyDecDashboard: React.FC = () => {
  const [fund, setFund] = useState<string>("");
  const [year, setYear] = useState<number>(currentYear);
  const [quarter, setQuarter] = useState<number>(currentQuarter);
  const [exposureData, setExposureData] = useState<ExposurePoint[] | null>(null);

  // Single fetch shared across the 3 exposure-progression charts
  useEffect(() => {
    let cancelled = false;
    setExposureData(null);
    fetchExposureProgression(fund || undefined)
      .then((resp) => {
        if (!cancelled) setExposureData(resp.data || []);
      })
      .catch(() => {
        if (!cancelled) setExposureData([]);
      });
    return () => {
      cancelled = true;
    };
  }, [fund]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
            Monthly Dec — Performance & Deal Issuance
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Fund vs benchmark performance, realized volatility, drawdown depth,
            and Dealogic equity-issuance breakdown.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            label="Fund"
            size="small"
            value={fund}
            onChange={(e) => setFund(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            {FUND_OPTIONS.map((o) => (
              <MenuItem key={o.value || "all"} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Year"
            size="small"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ minWidth: 110 }}
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Quarter"
            size="small"
            value={quarter}
            onChange={(e) => setQuarter(Number(e.target.value))}
            sx={{ minWidth: 110 }}
          >
            {[1, 2, 3, 4].map((q) => (
              <MenuItem key={q} value={q}>
                Q{q}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CumulativePnlChart fund={fund || undefined} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RealizedVolatilityChart fund={fund || undefined} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DrawdownChart fund={fund || undefined} />
        </Grid>
        <Grid item xs={12}>
          <QuarterlyDealVolumeChart />
        </Grid>
        <Grid item xs={12}>
          <RegionSectorPieCharts year={year} quarter={quarter} />
        </Grid>

        <Grid item xs={12}>
          <QuarterlyDealPerformanceTable />
        </Grid>

        <Grid item xs={12} md={6}>
          <AnalystDeskPnlTable fund={fund || undefined} />
        </Grid>
        <Grid item xs={12} md={6}>
          <SectorPnlTable fund={fund || undefined} />
        </Grid>

        <Grid item xs={12}>
          <MonthlyRegionPnlTable year={year} fund={fund || undefined} />
        </Grid>
        <Grid item xs={12}>
          <MonthlyStrategyPnlTable year={year} fund={fund || undefined} />
        </Grid>

        <Grid item xs={12}>
          <TopContributorsDetractorsTable fund={fund || undefined} />
        </Grid>

        <Grid item xs={12}>
          <ExposureProgressionChart
            series="gross"
            fund={fund || undefined}
            cachedData={exposureData}
          />
        </Grid>
        <Grid item xs={12}>
          <ExposureProgressionChart
            series="delta_net"
            fund={fund || undefined}
            cachedData={exposureData}
          />
        </Grid>
        <Grid item xs={12}>
          <ExposureProgressionChart
            series="beta_net"
            fund={fund || undefined}
            cachedData={exposureData}
          />
        </Grid>

        <Grid item xs={12}>
          <SectorExposurePnlBreakdown fund={fund || undefined} />
        </Grid>

        <Grid item xs={12}>
          <DeskExposurePnlBreakdown fund={fund || undefined} />
        </Grid>

        <Grid item xs={12}>
          <TopSingleNameExposuresTable fund={fund || undefined} />
        </Grid>

        <Grid item xs={12}>
          <DealScreeningMetricsTable year={year} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default MonthlyDecDashboard;
