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
import NoDataPopup from "../../../Pages/NoDataPopup";
import HYBarCharts from "./DealStats/HYBarCharts";
import HYSectorWisePieChart from "./DealStats/HYSectorWisePieChart";
import HYSpRatingPieChart from "./DealStats/HYSpRatingPieChart";
import HYSpRatingWiseChart from "./DealStats/HYSpRatingWiseChart";
import HYYearlySectorChart from "./DealStats/HYYearlySectorChart";


interface HyDealMainTableProps {
  selectedFilters: Record<string, string | number | (string | number)[]>; 
  handleReset: () => void;
}

const HyDealMainTable: React.FC<HyDealMainTableProps> = ({
  selectedFilters,handleReset
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

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/high_yields_graph/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.error === "No data found for the given filters.") {
            setNoDataPopupOpen(true); // Open the NoDataPopup if no data is returned
            setApiData(null); // Set data to null
          } else {
            setApiData(result);
          }
        } else {
          setNoDataPopupOpen(true); // Open the NoDataPopup if fetch fails
          setApiData(null); // Set data to null
        }
      } catch (err: any) {
        setNoDataPopupOpen(true); // Open the NoDataPopup if an error occurs
        setApiData(null); // Set data to null
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters]);
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
              "Opportunity Value ",
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
              <HYBarCharts
                data={apiData.deal_type}
                selectedMetric={selectedMetric}
              />
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <HYYearlySectorChart
                data={apiData.year_wise_sector}
                selectedMetric={selectedMetric}
              />
            </CardContent>
          </Card>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <HYSectorWisePieChart
                data={apiData.sectors}
                selectedMetric={selectedMetric}
              />
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <HYSpRatingPieChart
                data={apiData.year_wise_region}
                selectedMetric={selectedMetric}
              />
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <HYSpRatingWiseChart
                data={apiData.regions}
                selectedMetric={selectedMetric}
              />
            </CardContent>
          </Card>
        </>
      )}
     <NoDataPopup
        open={noDataPopupOpen}
        onClose={handleClosePopup} // Close the popup and reset filters when the user clicks the close button
      />
    </Container>
  );
};

export default HyDealMainTable;
