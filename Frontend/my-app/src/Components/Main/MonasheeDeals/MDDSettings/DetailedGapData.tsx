import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import Marquee from "react-fast-marquee";
import DetailedGapDataTable from "./DetailedGapDataTable";

interface SelectedFilters {
  years?: number[]; // Ensures 'years' is recognized as an optional array of numbers
}

const DetailedGapData: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate(); 



  let selectedFilters: SelectedFilters = {}; // Explicitly using the typed interface

  try {
    const filters = JSON.parse(searchParams.get("filters") || "{}");
    selectedFilters = filters;
  } catch (error) {
    console.error("Invalid filters format", error);
    // navigate("/error");  

  }

  useEffect(() => {
    if (!Object.keys(selectedFilters).length) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/api/detailed_gap_analysis/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        // navigate("/error");  

        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  return (
    <Box>
      <Box  sx={{
            color: "#fff",
            textAlign: "center",
            fontWeight: "bold",
            background:
              "linear-gradient(45deg, rgb(0, 63, 134), rgb(56, 138, 88))",
            borderRadius: "5px",
          }}>
    <Marquee gradient={false} speed={100}>
    <Typography
          variant="h5"
          sx={{
            color: "#fff",
            textAlign: "center",
            fontWeight: "bold",
            borderRadius: "5px",
            display: "inline-block",
            padding:1
          }}
        >
          Deal Details for {selectedFilters.years?.[0] || "N/A"}
        </Typography>
        </Marquee>
        </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <p>Error: {error}</p>
      ) : data.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <DetailedGapDataTable data={data} />
      )}
    </Box>
  );
};

export default DetailedGapData;
