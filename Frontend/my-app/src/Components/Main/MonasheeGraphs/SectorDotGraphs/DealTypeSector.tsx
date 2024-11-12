import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Paper,
  Typography,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";

// Define the data types
type SectorData = {
  deal_count: number;
  total_deal_value: string; // Changed to string to accommodate values like "9.61B"
  total_opportunity_value_ex: string; // Changed to string to accommodate values like "805.35M"
  total_opportunity_value_on_abs_basis: string; // Changed to string to accommodate values like "507.97M"
};

type APIResponse = {
  [key: string]: Record<string, SectorData>;
};

// Helper function to parse values with units (B, M)
const parseValue = (value: string): number => {
  const unit = value.slice(-1);
  const number = parseFloat(value.slice(0, -1));

  switch (unit) {
    case "B":
      return number * 1e9;
    case "M":
      return number * 1e6;
    default:
      return number;
  }
};

// Helper function to format values back to string with suffixes (B, M)
const formatValue = (value: number): string => {
  const isNegative = value < 0;
  const absValue = Math.abs(value); // Get the absolute value for formatting

  let formattedValue = '';

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(2)}M`;
  } else {
    formattedValue = absValue.toString();
  }

  // If the value is negative, prepend a negative sign
  return isNegative ? `-${formattedValue}` : formattedValue;
};

const sectorNameMap: Record<string, string> = {
  "Communication Services": "Communication Services",
  "Consumer Discretionary": "Consumer Discretionary",
  "Consumer Staples": "Consumer Staples",
  Energy: "Energy",
  Financials: "Financials",
  "Health Care": "Health Care",
  Industrials: "Industrials",
  "Information Technology": "Information Technology",
  Materials: "Materials",
  RealEstate: "Real Estate",
  Utilities: "Utilities",
};

// Define colors for each sector
const sectorColors: Record<string, string> = {
  "Communication Services": "#3B2A45",
  "Consumer Discretionary": "#a70278",
  "Consumer Staples": "#090078",
  Energy: "#fd0110",
  Financials: "#590005",
  "Health Care": "#320059",
  Industrials: "#027f53",
  "Information Technology": "#dfc100",
  Materials: "#7a3a01",
  RealEstate: "#1f5d5e",
  Utilities: "#7334a7",
};

interface DealTypeSectorProps {
  yAxisType: "deal_count" | "deal_value" | "opportunity_value_ex" | "opportunity_value_on_abs_basis"; // New prop to decide which data to show on the Y-axis
}

const DealTypeSector: React.FC<DealTypeSectorProps> = ({ yAxisType }) => {
  const [data, setData] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([
    "Information Technology",
    "Consumer Discretionary",
    "Energy",
    "Financials",
    "Health Care",
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<APIResponse>(
          "http://192.168.1.59:9000/api/sectorwise_data/"
        );
        setData(response.data);
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  // Format the data for recharts based on yAxisType (deal_count, deal_value, opportunity_value_ex, opportunity_value_on_abs_basis)
  const formattedData = Object.keys(data || {}).map((year) => {
    const yearData = data?.[year];
    const yearFormattedData: any = { year };

    // Loop through the selected sectors and format the data
    selectedSectors.forEach((sector) => {
      const sectorData = yearData?.[sector];

      if (sectorData) {
        // Depending on the yAxisType prop, we will display the corresponding data
        if (yAxisType === "deal_count") {
          yearFormattedData[sectorNameMap[sector]] = sectorData.deal_count;
        } else if (yAxisType === "deal_value") {
          yearFormattedData[sectorNameMap[sector]] = parseValue(sectorData.total_deal_value);
        } else if (yAxisType === "opportunity_value_ex") {
          yearFormattedData[sectorNameMap[sector]] = parseValue(sectorData.total_opportunity_value_ex);
        } else if (yAxisType === "opportunity_value_on_abs_basis") {
          yearFormattedData[sectorNameMap[sector]] = parseValue(sectorData.total_opportunity_value_on_abs_basis);
        }
      }
    });

    return yearFormattedData;
  });

  const handleCheckboxChange = (sector: string) => {
    setSelectedSectors((prevSelectedSectors) => {
      if (prevSelectedSectors.includes(sector)) {
        return prevSelectedSectors.filter((item) => item !== sector);
      } else {
        return [...prevSelectedSectors, sector];
      }
    });
  };

  return (
    <>
      <Box sx={{ width: "100%", marginBottom: "30px" }}>
        <Typography variant="h6" gutterBottom align="center" color="#002060">
          Sector-wise Data Over the Years
        </Typography>

        {/* Fully responsive Box container */}
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Paper
            elevation={3}
            sx={{
              padding: { xs: 2, sm: 3 },
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <Box sx={{ marginBottom: 3 }}>
              <FormGroup row>
                {Object.keys(sectorNameMap).map((sectorDisplayName) => (
                  <FormControlLabel
                    key={sectorDisplayName}
                    control={
                      <Checkbox
                        checked={selectedSectors.includes(sectorDisplayName)}
                        onChange={() => handleCheckboxChange(sectorDisplayName)}
                        name={sectorDisplayName}
                        sx={{
                          color: "#166802",
                          "&.Mui-checked": {
                            color: "#166802",
                          },
                          "&:hover": {
                            color: "#166802",
                          },
                        }}
                      />
                    }
                    label={sectorDisplayName}
                    sx={{
                      color: "#002060",
                      fontSize: 12,
                      fontWeight: "bold",
                      fontFamily: "Roboto, Arial, sans-serif",
                    }}
                  />
                ))}
              </FormGroup>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={formattedData}>
                <XAxis dataKey="year" tick={{ fill: "#002060", fontSize: 12 }} />
                <YAxis tickFormatter={formatValue} tick={{ fill: "#002060", fontSize: 12 }} />
                <Tooltip formatter={(value: any) => formatValue(value)} />
                <Legend />
                {selectedSectors.map((sectorDisplayName) => {
                  const sectorKey = sectorNameMap[sectorDisplayName];
                  return (
                    <Line
                      key={sectorKey}
                      type="monotone"
                      dataKey={sectorKey}
                      stroke={sectorColors[sectorKey]}
                      activeDot={{ r: 8 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default DealTypeSector;
