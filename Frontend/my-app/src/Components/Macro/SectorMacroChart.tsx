import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  Container,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import USMarketIndexTable from "./USMarketIndexTable";


// Define data interface
interface ApiData {
  date: string;
  snp_500: number;
  dow_jones: number;
  russell_2000: number;
  sp500_consumer_discretionary: number;
  sp500_consumer_staples: number;
  sp500_energy: number;
  sp500_financials: number;
  sp500_healthcare: number;
  sp500_industrials: number;
  sp500_information_technology: number;
  sp500_materials: number;
  sp500_telecom_services: number;
  sp500_utilities: number;
  sp500_real_estate: number;
  sp500_technology: number;
  sp500_oil_gas: number;
  sp500_insurance_industry: number;
}

interface MarketData {
  latest_date: string;
  snp_500: number;
  dow_jones: number;
  russell_2000: number;
  top_gainers: Record<string, number>;
  top_losers: Record<string, number>;
}

// List of the sectors
const sectors = [
  "snp_500",
  "dow_jones",
  "russell_2000",
  "sp500_consumer_discretionary",
  "sp500_consumer_staples",
  "sp500_energy",
  "sp500_financials",
  "sp500_healthcare",
  "sp500_industrials",
  "sp500_information_technology",
  "sp500_materials",
  "sp500_telecom_services",
  "sp500_utilities",
  "sp500_real_estate",
  "sp500_technology",
  "sp500_oil_gas",
  "sp500_insurance_industry",
] as const;

// Type that includes only the sector names
type SectorKey = (typeof sectors)[number];

// Helper function to prettify keys
const formatLabel = (label: string): string => {
  // Define common replacements for sector names
  const replacements: Record<string, string> = {
    snp_500: "S&P 500",
    dow_jones: "Dow Jones",
    russell_2000: "Russell 2000",
    sp500_consumer_discretionary: "S&P 500 Consumer Discretionary",
    sp500_consumer_staples: "S&P 500 Consumer Staples",
    sp500_energy: "S&P 500 Energy",
    sp500_financials: "S&P 500 Financials",
    sp500_healthcare: "S&P 500 Healthcare",
    sp500_industrials: "S&P 500 Industrials",
    sp500_information_technology: "S&P 500 Info Tech",
    sp500_materials: "S&P 500 Materials",
    sp500_telecom_services: "S&P 500 Telecom Services",
    sp500_utilities: "S&P 500 Utilities",
    sp500_real_estate: "S&P 500 Real Estate",
    sp500_technology: "S&P 500 Technology",
    sp500_oil_gas: "S&P 500 Oil & Gas",
    sp500_insurance_industry: "S&P 500 Insurance Industry",
  };

  // Return formatted label or prettify with fallback
  return replacements[label] || label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const SectorMacroChart: React.FC = () => {
  const [data, setData] = useState<ApiData[]>([]); // Data state for chart
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1Y"); // Default period
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Error state
  const [usMarketIndexData, setUsMarketIndexData] = useState<MarketData>({
    latest_date: "",
    snp_500: 0,
    dow_jones: 0,
    russell_2000: 0,
    top_gainers: {},
    top_losers: {},
  });

  const [visibleLines, setVisibleLines] = useState<Record<SectorKey, boolean>>(
    sectors.reduce(
      (acc, sector) => {
        acc[sector] = ["snp_500", "dow_jones", "russell_2000"].includes(sector);
        return acc;
      },
      {} as Record<SectorKey, boolean>
    )
  );

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        setLoading(false);
        return;
      }

      const payload = {
        selectedPeriod: selectedPeriod,
      };

      try {
        setLoading(true); // Start loading
        const response = await fetch(`${apiUrl}/api/sector_macro/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const responseData = await response.json();
        setData(responseData.data); // Set chart data
        setUsMarketIndexData(responseData.us_market_data);
        setError(null); // Clear error if data is fetched successfully
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching the data.");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchData();
  }, [selectedPeriod]);

  // Handle button clicks to change the period
  const handleButtonClick = (period: string) => {
    setSelectedPeriod(period);
  };

  // Handle checkbox change for toggling line visibility
  const handleCheckboxChange = (line: SectorKey) => {
    setVisibleLines((prev) => ({
      ...prev,
      [line]: !prev[line],
    }));
  };

  // Formatter function to display numbers with 2 decimals and append '%'
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Helper function to get color for each sector line
  const getLineColor = (line: SectorKey) => {
    const colors: Record<SectorKey, string> = {
      snp_500: "#8884d8",
      dow_jones: "#82ca9d",
      russell_2000: "#ffc658",
      sp500_consumer_discretionary: "#ff7300",
      sp500_consumer_staples: "#00C49F",
      sp500_energy: "#FFBB28",
      sp500_financials: "#FF8042",
      sp500_healthcare: "#FF0033",
      sp500_industrials: "#7C4DFF",
      sp500_information_technology: "#8E24AA",
      sp500_materials: "#9E9E9E",
      sp500_telecom_services: "#607D8B",
      sp500_utilities: "#039BE5",
      sp500_real_estate: "#4CAF50",
      sp500_technology: "#D32F2F",
      sp500_oil_gas: "#2196F3",
      sp500_insurance_industry: "#FF5722",
    };

    return colors[line] || "#000000"; // Default to black if no color is found
  };

  return (
    <Container>
      <Card
        elevation={3}
        sx={{
          width: "100%",
          marginTop: 2,
          marginBottom: 2,
          borderRadius: 3,
          padding: 5,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Box>
          <Typography variant="h5" color="#002060" align="center" mb={2}>
            Sector Performance ({selectedPeriod})
          </Typography>

          <Box display="flex" gap={2} mb={2}>
            {["1D", "1W", "1M", "3M", "6M", "YTD", "1Y", "3Y", "5Y"].map(
              (period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "contained" : "outlined"}
                  onClick={() => handleButtonClick(period)}
                  sx={{
                    color: "#3f51b5",
                    border: "1px solid #3f51b5",
                    "&.MuiButton-contained": {
                      backgroundColor: "#3f51b5",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#303f9f",
                      },
                    },
                  }}
                >
                  {period}
                </Button>
              )
            )}
          </Box>

          {/* Error state */}
          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}

          {/* Loading state */}
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatPercentage} />
                  <Tooltip
                    labelFormatter={(label) => formatLabel(label)}
                    formatter={formatPercentage}
                  />
                  <Legend formatter={(value) => formatLabel(value)} />
                  {/* Render lines for each sector if the line is visible */}
                  {sectors.map(
                    (line) =>
                      visibleLines[line] && (
                        <Line
                          key={line}
                          dot={false}
                          dataKey={line} // Dynamically use the line as the dataKey
                          stroke={getLineColor(line)} 
                          strokeWidth={2}// Dynamically set the stroke color
                        />
                      )
                  )}
                </LineChart>
              </ResponsiveContainer>
              <Box mb={2}>
                <Grid container spacing={1}>
                  {sectors.map((line) => (
                    <Grid item xs={12} sm={6} md={3} key={line}>
                      <Box
                        p={0.5}
                        border={1}
                        borderColor="#ddd"
                        borderRadius={1}
                        fontSize="0.75rem"
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={visibleLines[line]}
                              onChange={() => handleCheckboxChange(line)}
                              name={line}
                              sx={{
                                transform: "scale(0.7)",
                                color: "#9b0000",
                                "&.Mui-checked": {
                                  color: "#9b0000",
                                },
                              }}
                            />
                          }
                          label={formatLabel(line)}
                          componentsProps={{
                            typography: {
                              sx: { fontSize: "0.725rem" },
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </>
          )}
        </Box>
      </Card>
      <>{usMarketIndexData && <USMarketIndexTable latest_data={usMarketIndexData} time_frame={selectedPeriod} />}</>
    </Container>
  );
};

export default SectorMacroChart;
