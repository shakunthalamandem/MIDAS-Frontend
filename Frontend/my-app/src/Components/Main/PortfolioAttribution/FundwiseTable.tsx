import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
// import { result } from "lodash"; // This import is not needed

const FundWiseTable: React.FC = () => {
  const { fund } = useParams(); // Get the fund from the URL params
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  // Get the API URL and token from environment variables or storage
  const apiUrl = process.env.REACT_APP_API_URL; // or your defined API URL
  const token = localStorage.getItem('token');  // or your global state/context

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/detailed_fund_pnl/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }), 
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
  
        const result = await response.json();

        setData(result);

      } catch (error) {
        setError((error as any).message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };
  
    if (fund) {
      fetchData();
    }
  }, [fund, apiUrl, token]);  // Ensure fund is used correctly as a dependency
  

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box>
          <Typography variant="h4">{`Details for Fund: ${fund}`}</Typography>

          {/* Displaying detailed fund data in a table */}
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Region</b></TableCell>
                  <TableCell><b>Jan-2025</b></TableCell>
                  <TableCell><b>2025 YTD</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.broad_region}</TableCell>
                    <TableCell>{row.pnl}</TableCell>
                    <TableCell>{row.aum}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default FundWiseTable;
