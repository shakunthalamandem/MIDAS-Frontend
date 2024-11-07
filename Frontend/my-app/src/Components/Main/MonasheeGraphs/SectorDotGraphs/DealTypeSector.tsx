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
  CommunicationServices: number;
  ConsumerDiscretionary: number;
  ConsumerStaples: number;
  Energy: number;
  Financials: number;
  HealthCare: number;
  Industrials: number;
  InformationTechnology: number;
  Materials: number;
  RealEstate: number;
  Utilities: number;
};

type APIResponse = {
  [key: string]: SectorData;
};

const sectorNameMap: Record<string, string> = {
  CommunicationServices: "Communication Services",
  ConsumerDiscretionary: "Consumer Discretionary",
  ConsumerStaples: "Consumer Staples",
  Energy: "Energy",
  Financials: "Financials",
  HealthCare: "Health Care",
  Industrials: "Industrials",
  InformationTechnology: "Information Technology",
  Materials: "Materials",
  RealEstate: "Real Estate",
  Utilities: "Utilities",
};

// Define colors for each sector
const sectorColors: Record<string, string> = {
  "Communication Services": "#3B2A45", // Dark purple
  "Consumer Discretionary": "#a70278", // Deep teal
  "Consumer Staples": "#090078", // Dark violet
  Energy: "#fd0110", // Deep red
  Financials: "#590005", // Dark slate blue
  "Health Care": "#320059", // Olive green
  Industrials: "#027f53", // Dark cyan
  "Information Technology": "#dfc100", // Charcoal gray
  Materials: "#7a3a01", // Slate gray
  RealEstate: "#1f5d5e", // Golden yellow
  Utilities: "#7334a7", // Dark green
};

// Mapping between displayed names and API keys (no spaces)
const DealTypeSector: React.FC = () => {
  const [data, setData] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([
    "CommunicationServices",
    "ConsumerDiscretionary",
    "Energy",
    "Financials",
    "HealthCare",
  ]); // Default selected sectors

  // Fetch the data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<APIResponse>(
          "http://192.168.1.59:9000/api/sectorwise_data"
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
      <Paper elevation={3} sx={{ padding: 3, display: "flex", justifyContent: "center", alignItems: "center" }}>
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

  // Format the data for recharts
  const formattedData = Object.keys(data || {}).map((year) => ({
    year,
    ...data?.[year],
  }));

  // Handle checkbox change
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
    <Box sx={{ padding: { xs: 2, sm: 3 }, width: "100%" }}>
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
            maxWidth: "1200px", // Max width on large screens
            margin: "0 auto", // Center the Paper on the screen
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
                />
              }
              label={sectorDisplayName}
            />
          ))}
        </FormGroup>
      </Box>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={formattedData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* Remove the CartesianGrid to hide the grid lines */}
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
