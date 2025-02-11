import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Box } from "@mui/material";

const DetailedGapData: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  console.log("Search Params:", searchParams.toString());

  let selectedFilters = {};
  try {
    const filters = JSON.parse(searchParams.get("filters") || "{}");
    selectedFilters = filters;
  } catch (error) {
    console.error("Invalid filters format", error);
  }

  console.log("Selected Filters:", selectedFilters);

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
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  return (
    <Box p={3}>
      <h2>Detailed GAP Data</h2>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <p>Error: {error}</p>
      ) : data.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
              <TableCell>Deal Type</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Deal Size</TableCell>
              <TableCell>Ticker</TableCell>
              <TableCell>Sector</TableCell>
              <TableCell>Deal Captain</TableCell>
              <TableCell>Return</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.year}</TableCell>
                <TableCell>{row.deal_type}</TableCell>
                <TableCell>{row.broad_region}</TableCell>
                <TableCell>${row.deal_size.toLocaleString()}</TableCell>
                <TableCell>{row.ticker_us}</TableCell>
                <TableCell>{row.gics_sector_from_bloomberg}</TableCell>
                <TableCell>{row.deal_captain}</TableCell>
                <TableCell>{row.total_return.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default DetailedGapData;
