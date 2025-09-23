import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Container,
  Button,
} from "@mui/material";

const FundamentalsTechnical: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedType(
      event.target.value as
        | "technical"
        | "fundamental"
        | "news"
        | "ipo_facset_comp_data"
        | "fo_facset_comp_data"
    );
    setResponse(null); // clear previous messages
  };

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleSubmit = async () => {
    if (!selectedType) {
      setResponse("Please select a data type first.");
      return;
    }

    setLoading(true);
    setResponse(null);

    let endpoint = "";
    let method: "GET" | "POST" = "POST"; // default is POST

    if (selectedType === "technical") {
      endpoint = `${apiUrl}/api/technical_data_download/`;
    } else if (selectedType === "fundamental") {
      endpoint = `${apiUrl}/api/fundamental_data_download/`;
    } else if (selectedType === "news") {
      endpoint = `${apiUrl}/api/upload_news/`;
    } else if (selectedType === "ipo_facset_comp_data") {
      endpoint = `${apiUrl}/api/fs_comp_data_daily_get/`;
      method = "GET"; 
    } else if (selectedType === "fo_facset_comp_data") {
      endpoint = `${apiUrl}/api/fo_fs_comp_data_daily_get/`;
      method = "GET"; 
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: method === "POST" ? JSON.stringify({}) : undefined, // only send body for POST
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to fetch data");
      }

      const data = await res.json();
      setResponse(`Success: ${data.message || "Data uploaded successfully!"}`);
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: 20 }}>
      <Box
        mt={2}
        sx={{ padding: 2, backgroundColor: "#f9f9f9", boxShadow: 3 }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6" color="#002060">
            Select Data Type to Upload
          </Typography>
          <FormControl sx={{ minWidth: 220 }} disabled={loading}>
            <InputLabel id="data-type-label">Data Type</InputLabel>
            <Select
              labelId="data-type-label"
              value={selectedType}
              label="Data Type"
              onChange={handleChange}
            >
              <MenuItem value="technical">Technicals</MenuItem>
              <MenuItem value="fundamental">Fundamentals</MenuItem>
              <MenuItem value="news">Upload News</MenuItem>
              <MenuItem value="ipo_facset_comp_data"> IPO FS Comps Update</MenuItem>
              <MenuItem value="fo_facset_comp_data">FO FS Comps Update</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !selectedType}
          >
            Submit
          </Button>

          {loading && <CircularProgress />}
          {response && <Typography>{response}</Typography>}
        </Stack>
      </Box>
    </Container>
  );
};

export default FundamentalsTechnical;
