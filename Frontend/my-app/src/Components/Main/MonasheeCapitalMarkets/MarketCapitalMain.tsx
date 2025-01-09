import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import NumberOfDeals from "./NavigationTabs/NumberOfDeals";
import RegionWiseDeals from "./NavigationTabs/RegionWiseDeals";
import SectorWiseDeals from "./NavigationTabs/SectorWiseDeals";
import YearlySectorChart from "./YearlySectorChart";
import RegionWiseChart from "./RegionWiseChart";

interface MarketCapitalMainProps {
  selectedFilters: Record<string, string | number | (string | number)[]>;
}

const MarketCapitalMain: React.FC<MarketCapitalMainProps> = ({
  selectedFilters,
}) => {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("count"); // Default to "count" (Deal Count)

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMetric(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/dealogic_graph/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedFilters),
        });

        if (response.ok) {
          const result = await response.json();
          setApiData(result);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && <p>Loading...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <Box display="flex" justifyContent="center" mb={2}>
        {["count", "deal_value", "opportunity_value_ex"].map(
          (metric, index) => {
            const labels = [
              "Deal Count",
              "Deal Value",
              "Opportunity Excess Value",
            ];
            const colors = ["#9b0000", "#9b0000", "#9b0000"];
            return (
              <FormControlLabel
                key={metric}
                control={
                  <Checkbox
                    checked={selectedMetric === metric}
                    onChange={handleCheckboxChange}
                    value={metric}
                    sx={{
                      color: "#3f51b5",
                      "&.Mui-checked": { color: colors[index] },
                      "&:hover": { backgroundColor: "transparent" },
                      transition: "color 0.3s ease",
                    }}
                  />
                }
                label={labels[index]}
              />
            );
          }
        )}
      </Box>

      {apiData && (
        <>
          <Grid item xs={12} md={6}>
            <NumberOfDeals
              data={apiData.deal_type}
              selectedMetric={selectedMetric}
            />
          </Grid>
          <Box sx={{ px: 4, py: 2 }}>
  <Grid container spacing={6}> {/* Increased spacing between items */}
    <Grid item xs={12} md={8}> {/* Increased size of RegionWiseChart */}
      <RegionWiseChart
        data={apiData.year_wise_region}
        selectedMetric={selectedMetric}
        checkedItems={
          Array.isArray(selectedFilters?.region)
            ? selectedFilters.region.filter(
                (item): item is string => typeof item === "string"
              )
            : typeof selectedFilters?.region === "string"
            ? [selectedFilters.region]
            : []
        }
      />
    </Grid>
    <Grid item xs={12} md={4}> {/* Decreased size of RegionWiseDeals */}
      <RegionWiseDeals
        data={apiData.regions}
        selectedMetric={selectedMetric}
      />
    </Grid>
  </Grid>
</Box>

<Box sx={{ px: 4, py: 2 }}>
  <Grid container spacing={6}> {/* Increased spacing */}
    <Grid item xs={12} md={8}> {/* Increased space for YearlySectorChart */}
      <YearlySectorChart
        data={apiData.year_wise_sector}
        selectedMetric={selectedMetric}
        checkedItems={
          Array.isArray(selectedFilters?.sector)
            ? selectedFilters.sector.filter(
                (item): item is string => typeof item === "string"
              )
            : typeof selectedFilters?.sector === "string"
            ? [selectedFilters.sector]
            : []
        }
      />
    </Grid>
    <Grid item xs={12} md={4}> {/* Reduced space for SectorWiseDeals */}
      <SectorWiseDeals
        data={apiData.sectors}
        selectedMetric={selectedMetric}
      />
    </Grid>
  </Grid>
</Box>

        </>
      )}
    </Container>
  );
};

export default MarketCapitalMain;
