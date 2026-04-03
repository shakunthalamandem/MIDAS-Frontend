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
import NoDataPopup from "../../../../Pages/NoDataPopup";
import ConvertsSectorTableData from "./ConvertsSectorTableData";
import { useNavigate } from "react-router-dom";  // Import useNavigate


interface SkewTableOptions {
  "start year": number[];
  "end year": number[];
  sector: string[];
}

const ConvertsYearlyBased: React.FC = () => {
  const [startYear, setStartYear] = useState<number>(2012);
  const [endYear, setEndYear] = useState<number | string>(2026);
  const [sector, setSector] = useState<string>("All");
  const navigate = useNavigate();  // Initialize navigate function


  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  const [responseData, setResponseData] = useState<any>(null);
  const [noDataPopupOpen, setNoDataPopupOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) throw new Error("API URL is not defined in environment variables");

        const response = await axios.get(`${apiUrl}/api/converts_skew_table_filters/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = response.data as SkewTableOptions;
        setSectorOptions(Array.isArray(data.sector) ? data.sector : []);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        // navigate("/error");  // Redirect to error page
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
          sector: sector === "All" ? sectorOptions : [sector],
        },
      };

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) throw new Error("API URL is not defined in environment variables");

        const response = await axios.post(`${apiUrl}/api/converts_skewtable/`, requestData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        setResponseData(response.data && Object.keys(response.data).length ? response.data : null);
        setNoDataPopupOpen(!response.data || Object.keys(response.data).length === 0);
      } catch (error) {
        // navigate("/error");  

      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (sector) fetchData();
  }, [startYear, endYear,  sector, sectorOptions]);


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
            responseData && <ConvertsSectorTableData data={responseData} />
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

export default ConvertsYearlyBased;
