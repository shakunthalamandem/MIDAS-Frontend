import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Box, Typography, Container, Card } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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

const SectorMacroChart: React.FC = () => {
  const [data, setData] = useState<ApiData[]>([]); // Data state for chart
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1y"); // Default period
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Error state

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
                sx={{ color: "#002060", border: "1px solid #002060" }}
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
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatPercentage} />
                <Tooltip formatter={formatPercentage} />
                <Legend />
                {/* Render lines for each sector */}
                <Line type="monotone" dataKey="snp_500" stroke="#8884d8" />
                <Line type="monotone" dataKey="dow_jones" stroke="#82ca9d" />
                <Line type="monotone" dataKey="russell_2000" stroke="#ffc658" />
                <Line
                  type="monotone"
                  dataKey="sp500_consumer_discretionary"
                  stroke="#ff7300"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_consumer_staples"
                  stroke="#00C49F"
                />
                <Line type="monotone" dataKey="sp500_energy" stroke="#FFBB28" />
                <Line
                  type="monotone"
                  dataKey="sp500_financials"
                  stroke="#FF8042"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_healthcare"
                  stroke="#FF0033"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_industrials"
                  stroke="#7C4DFF"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_information_technology"
                  stroke="#8E24AA"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_materials"
                  stroke="#9E9E9E"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_telecom_services"
                  stroke="#607D8B"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_utilities"
                  stroke="#039BE5"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_real_estate"
                  stroke="#4CAF50"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_technology"
                  stroke="#D32F2F"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_oil_gas"
                  stroke="#2196F3"
                />
                <Line
                  type="monotone"
                  dataKey="sp500_insurance_industry"
                  stroke="#FF5722"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default SectorMacroChart;
