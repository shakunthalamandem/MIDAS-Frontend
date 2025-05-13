import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Grid,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import HySectorTableData from "./HySectorTableData";
import NoDataPopup from "../../../Pages/NoDataPopup";
import { useNavigate } from "react-router-dom";

interface SkewTableOptions {
  "start year": number[];
  "end year": number[];
  ratings: string[];
  sector: string[];
}

const HySectorBasedTable: React.FC = () => {
  const [startYear, setStartYear] = useState<number>(2012);
  const [endYear, setEndYear] = useState<number | string>(2025);
  const [rating, setRating] = useState<string>("All");
  const [sector, setSector] = useState<string>("All");

  const [ratingOptions, setRatingOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  const [responseData, setResponseData] = useState<any>(null);
  const [noDataPopupOpen, setNoDataPopupOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate(); 


  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) throw new Error("API URL is not defined in environment variables");

        const response = await axios.get(`${apiUrl}/api/hy_skew_table_filters/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = response.data as SkewTableOptions;
        setRatingOptions(data.ratings);
        setSectorOptions(Array.isArray(data.sector) ? data.sector : []);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        navigate("/error");  

      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
  
      const requestData = {
        filters: {
          year_range: [startYear, endYear],
          rating: rating === "All" ? ratingOptions : [rating],
          sector: sector === "All" ? sectorOptions : [sector],
        },
      };
  
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
  
        if (!apiUrl) throw new Error("API URL is not defined in environment variables");
  
        const response = await axios.post(`${apiUrl}/api/hy_skewtable/calculations/`, requestData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
  
        const responseData = response.data as { detail?: string };
;

        const noData = !responseData || responseData.detail === "No data found." || Object.keys(responseData).length === 0;
        
        setResponseData(noData ? null : responseData);
        setNoDataPopupOpen(noData);
        
      } catch (error) {
        console.error("API error:", error);
        navigate("/error"); // Redirect to error page
      } finally {
        setLoading(false); // Stop loading
      }
    };
  
    fetchData();
  }, [startYear, endYear, rating, sector, ratingOptions, sectorOptions]); // Add dependencies for the filter changes
  

  const handleRatingChange = (event: SelectChangeEvent<string>) => {
    setRating(event.target.value);
  };

  const handleSectorChange = (event: SelectChangeEvent<string>) => {
    setSector(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box p={3} sx={{ backgroundColor: "#f0f4ff", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "#3b3f57", fontWeight: "bold" }}>
              Yearly Based Filtered Data
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={3} md={2}>
                <FormControl fullWidth variant="outlined" size="small" disabled={loading}>
                  <InputLabel>Rating</InputLabel>
                  <Select
                    value={rating}
                    label="Rating"
                    onChange={handleRatingChange}
                    sx={{ backgroundColor: "#e0f7fa", color: "#006064" }}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {ratingOptions.length > 0 ? (
                      ratingOptions.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No Data Available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small" disabled={loading}>
                  <InputLabel>Sector</InputLabel>
                  <Select
                    value={sector}
                    label="Sector"
                    onChange={handleSectorChange}
                    sx={{ backgroundColor: "#f9dc8f", color: "#1a237e" }}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {sectorOptions.length > 0 ? (
                      sectorOptions.map((sec) => (
                        <MenuItem key={sec} value={sec}>
                          {sec}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No Data Available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Show loading spinner while fetching data */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" mt={3} mb={3}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            responseData && <HySectorTableData data={responseData} />
          )}

          {/* No Data Message */}
          {noDataPopupOpen && !loading && (
           <>
           <NoDataPopup open={noDataPopupOpen} onClose={() => setNoDataPopupOpen(false)} /></>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default HySectorBasedTable;
