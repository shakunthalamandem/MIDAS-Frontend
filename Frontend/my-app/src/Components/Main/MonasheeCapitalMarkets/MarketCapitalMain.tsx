import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  Card,
  CardContent,
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
  const [selectedMetric, setSelectedMetric] = useState<string>("count");

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
              "Opportunity Value (T + 1M Excess)",
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
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <NumberOfDeals
                data={apiData.deal_type}
                selectedMetric={selectedMetric}
              />
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <YearlySectorChart
                data={apiData.year_wise_sector}
                selectedMetric={selectedMetric}
              />
            </CardContent>
          </Card>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <SectorWiseDeals
                data={apiData.sectors}
                selectedMetric={selectedMetric}
              />
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <RegionWiseChart
                data={apiData.year_wise_region}
                selectedMetric={selectedMetric}
              />
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <RegionWiseDeals
                data={apiData.regions}
                selectedMetric={selectedMetric}
              />
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default MarketCapitalMain;
