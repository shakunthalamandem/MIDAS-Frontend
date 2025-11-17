import React, { useState, useCallback, FormEvent } from "react";
import { Box, Button, Grid, Autocomplete, TextField } from "@mui/material";
import ABBModelResponseData from "./ABBModelResponseData";

interface CompanyOption {
  ticker: string;
  name: string;
}

const ABBModelMain = () => {
  const [companyQuery, setCompanyQuery] = useState("");
  const [options, setOptions] = useState<CompanyOption[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);

  // Loading for search
  const [loading, setLoading] = useState(false);

  // API response
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 🔍 COMPANY SEARCH
  const handleSearch = async (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${apiUrl}/api/fs_ticker_search/?search=${query}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await res.json();

      // Expecting list like: [{ticker: "AAPL", name: "Apple Inc"}]
      setOptions(data || []);
    } catch (err) {
      console.error(err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // SUBMIT API
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setResponseData(null);

      if (!selectedCompany) {
        setError("Please select a company.");
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        setError("API URL missing");
        return;
      }

      const payload = {
        ticker: selectedCompany.ticker,
      };

      try {
        setSubmitLoading(true);

        const res = await fetch(`${apiUrl}/api/abb_factset_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        setResponseData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch ABB model data");
      } finally {
        setSubmitLoading(false);
      }
    },
    [selectedCompany]
  );

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>

          {/* 🔍 SEARCH BAR */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={options}
              loading={loading}
              getOptionLabel={(opt) => `${opt.ticker} - ${opt.name}`}
              onInputChange={(e, value) => {
                setCompanyQuery(value);
                handleSearch(value);
              }}
              onChange={(e, value) => setSelectedCompany(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Company / Ticker"
                  variant="standard"
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: "#1d2b54", fontWeight: 600 },
                  }}
                />
              )}
            />
          </Grid>

          {/* SUBMIT */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              type="submit"
              disabled={submitLoading}
              sx={{
                background: "#0b2b57",
                borderRadius: "18px",
                px: 3.5,
                py: 1.25,
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {submitLoading ? "Processing..." : "Submit"}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* RESPONSE TABLE */}
      {responseData && <ABBModelResponseData data={responseData} />}
      
    </Box>
  );
};

export default ABBModelMain;
