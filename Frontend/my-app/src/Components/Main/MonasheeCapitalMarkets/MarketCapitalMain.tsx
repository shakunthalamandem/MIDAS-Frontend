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
  CircularProgress,
} from "@mui/material";
import NumberOfDeals from "./NavigationTabs/NumberOfDeals";
import RegionWiseDeals from "./NavigationTabs/RegionWiseDeals";
import SectorWiseDeals from "./NavigationTabs/SectorWiseDeals";
import YearlySectorChart from "./YearlySectorChart";
import RegionWiseChart from "./RegionWiseChart";
import NoDataPopup from "../../../Pages/NoDataPopup";
import MarketCapitalTable from "./MarketCapitalTable";

interface MarketCapitalMainProps {
  selectedFilters: Record<string, string | number | (string | number)[]>;
  handleReset: () => void;
  onMaxPricingDateChange: (date: string | null) => void;
}

const MarketCapitalMain: React.FC<MarketCapitalMainProps> = ({
  selectedFilters,
  handleReset,
  onMaxPricingDateChange,
}) => {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("count");
  const [noDataPopupOpen, setNoDataPopupOpen] = useState(false); // State for NoDataPopup

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMetric(event.target.value);
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setNoDataPopupOpen(false); // Close popup if it's already open
      onMaxPricingDateChange(null); // Clear previous date while loading

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/dealogic_graph/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });

        if (response.ok) {
          const result = await response.json();
          onMaxPricingDateChange(result?.max_pricing_date ?? null);

          if (result.error === "No data found for the given filters.") {
            setNoDataPopupOpen(true); // Open the NoDataPopup if no data is returned
            setApiData(null); // Set data to null
          } else {
            setApiData(result);
          }
        } else {
          setNoDataPopupOpen(true); // Open the NoDataPopup if fetch fails
          setApiData(null); // Set data to null
          onMaxPricingDateChange(null);
        }
      } catch (err: any) {
        setNoDataPopupOpen(true); // Open the NoDataPopup if an error occurs
        setApiData(null); // Set data to null
        onMaxPricingDateChange(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters, onMaxPricingDateChange]);
  const handleClosePopup = () => {
    setNoDataPopupOpen(false); // Close the NoDataPopup
    handleReset();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && <p>Loading...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <Box display="flex" justifyContent="center" mb={2}>
        {["count", "deal_value", "opportunity_value_ex"].map(
          (metric, index) => {
            const labels = [
              "Deal Count",
              "Deal Volume",
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
          <Box>
            <MarketCapitalTable
              selectedFilters={selectedFilters}
              handleReset={handleReset}
            />
          </Box>
        </>
      )}
      <NoDataPopup
        open={noDataPopupOpen}
        onClose={handleClosePopup} // Close the popup and reset filters when the user clicks the close button
      />
    </Container>
  );
};

export default MarketCapitalMain;
