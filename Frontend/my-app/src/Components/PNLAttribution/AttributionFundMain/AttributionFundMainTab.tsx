import React, { useState } from "react";
import {
  Box,
  Select,
  MenuItem,
  Typography,
  Grid,
} from "@mui/material";
import DealTypeFundMain from "./DealTypeFundMain";
import Top10ExposureChart from "./Top10ExposureChart";
import BottomStocksPNLMain from "./BottomStocksPNLMain";
import MostAgedStocksTable from "./MostAgedStocksTable";
import PortfolioDataTableMain from "./PortfolioDataTableMain";
import PnlAndDaysHeldGraph from "./PnlAndDaysHeldGraph";
import ExposureDtdMtdChartMain from "./ExposureDtdMtdChartMain";
import ExposureByDealTypeChart from "./ExposureByDealTypeChart";
import ExposureDtdMtdBySectorChart from "./ExposureDtdMtdBySectorChart";
import RegionWiseChartPnl from "./RegionWiseChartPnl";
import FundSummaryTable from "./FundSummaryTable";

const AttributionFundMainTab = () => {
  const [selectedFund, setSelectedFund] = useState("FMAP");
  const [maxTradeDate, setMaxTradeDate] = useState<string | null>(null);

  const fundOptions = ["BEMAP2", "FMAP", "Mission Pure Alpha LP", "Monashee Pure Alpha SPV I LP", "MPAM"];

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };
    return `${day}${getOrdinal(day)} ${month} ${year}`;
  };

  return (
    <Box
      sx={{
        p: 4,
        background: "#f5f7fa",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Fund selector */}
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <Grid item />
              {/* Header section from child maxTradeDate */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
        mb={1}
        textAlign="center"
      >
        <Typography
          variant="h5"
          sx={{
            background: "linear-gradient(to right, rgba(8, 85, 70, 1), #9e3f00ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 600,
          }}
        >
          {selectedFund}  Performance & Attribution Dashboard
        </Typography>
        {maxTradeDate && (
          <Typography variant="body1" sx={{ fontWeight: 500, color:'#991200ff'}}>
            (Data as of: {formatDate(maxTradeDate)})
          </Typography>
        )}
      </Box>
        <Grid item>
          <Select
            value={selectedFund}
            onChange={(e) => setSelectedFund(e.target.value)}
            size="small"
            sx={{
              minWidth: 250,
              backgroundColor: "white",
              borderRadius: 1,
              boxShadow: 1,
              "& .MuiSelect-select": {
                padding: "8px 12px",
              },
              "& fieldset": {
                borderColor: "#002060",
              },
              "&:hover fieldset": {
                borderColor: "#002060",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#002060",
              },
            }}
          >
            {fundOptions.map((fund) => (
              <MenuItem key={fund} value={fund}>
                {fund}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>



      {/* Main content */}
      <Box>
        <DealTypeFundMain fund={selectedFund} onMaxTradeDateChange={setMaxTradeDate} />
        <RegionWiseChartPnl fund={selectedFund} />
        <FundSummaryTable fund={selectedFund} />
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} md={6}>
            <Top10ExposureChart fund={selectedFund} />
          </Grid>
          <Grid item xs={12} md={6}>
            <PortfolioDataTableMain fund={selectedFund} />
          </Grid>
          <Grid item xs={12} md={6}>
            <MostAgedStocksTable fund={selectedFund} />
          </Grid>
          <Grid item xs={12} md={6}>
            <BottomStocksPNLMain fund={selectedFund} />
          </Grid>
        </Grid>
        <PnlAndDaysHeldGraph fund={selectedFund} />
        <ExposureDtdMtdChartMain fund={selectedFund} />
        <ExposureByDealTypeChart fund={selectedFund} />
        <ExposureDtdMtdBySectorChart fund={selectedFund} />
      </Box>
    </Box>
  );
};

export default AttributionFundMainTab;
