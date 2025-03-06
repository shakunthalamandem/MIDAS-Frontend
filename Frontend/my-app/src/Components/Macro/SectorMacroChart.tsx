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

const SectorMacroChart: React.FC = () => {
  const [data, setData] = useState<ApiData[]>([]); // Data state for chart
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1y"); // Default period
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Error state

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
        setData(responseData); // Set chart data
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
            {["5y", "3y", "1y", "6m", "3m", "1m"].map((period) => (
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
            ))}
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
                <LineChart data={data}>
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatPercentage} />
                  <Tooltip formatter={formatPercentage} />
                  <Legend />
                  {/* Render lines for each sector if the line is visible */}
                  {visibleLines.snp_500 && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="snp_500"
                      stroke="#8884d8"
                    />
                  )}
                  {visibleLines.dow_jones && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="dow_jones"
                      stroke="#82ca9d"
                    />
                  )}
                  {visibleLines.russell_2000 && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="russell_2000"
                      stroke="#ffc658"
                    />
                  )}
                  {visibleLines.sp500_consumer_discretionary && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_consumer_discretionary"
                      stroke="#ff7300"
                    />
                  )}
                  {visibleLines.sp500_consumer_staples && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_consumer_staples"
                      stroke="#00C49F"
                    />
                  )}
                  {visibleLines.sp500_energy && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_energy"
                      stroke="#FFBB28"
                    />
                  )}
                  {visibleLines.sp500_financials && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_financials"
                      stroke="#FF8042"
                    />
                  )}
                  {visibleLines.sp500_healthcare && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_healthcare"
                      stroke="#FF0033"
                    />
                  )}
                  {visibleLines.sp500_industrials && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_industrials"
                      stroke="#7C4DFF"
                    />
                  )}
                  {visibleLines.sp500_information_technology && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_information_technology"
                      stroke="#8E24AA"
                    />
                  )}
                  {visibleLines.sp500_materials && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_materials"
                      stroke="#9E9E9E"
                    />
                  )}
                  {visibleLines.sp500_telecom_services && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_telecom_services"
                      stroke="#607D8B"
                    />
                  )}
                  {visibleLines.sp500_utilities && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_utilities"
                      stroke="#039BE5"
                    />
                  )}
                  {visibleLines.sp500_real_estate && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_real_estate"
                      stroke="#4CAF50"
                    />
                  )}
                  {visibleLines.sp500_technology && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_technology"
                      stroke="#D32F2F"
                    />
                  )}
                  {visibleLines.sp500_oil_gas && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_oil_gas"
                      stroke="#2196F3"
                    />
                  )}
                  {visibleLines.sp500_insurance_industry && (
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey="sp500_insurance_industry"
                      stroke="#FF5722"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
              <Box mb={2}>
      <Grid container spacing={1}>
        {sectors.map((line) => (
          <Grid item xs={12} sm={6} md={3}>
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
  label={line.replace(/_/g, " ").toUpperCase()}
  componentsProps={{
    typography: {
      sx: { fontSize: "0.725rem" }, // Correct way to set label font size
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
    </Container>
  );
};

export default SectorMacroChart;
