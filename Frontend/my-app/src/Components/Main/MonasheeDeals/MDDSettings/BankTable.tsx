import React, { useEffect, useState } from "react";
import { Card, CardContent, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel } from "@mui/material";

interface FilterTableProps {
  selectedFilters: Record<string, any>; // Replace with specific filter types if needed
}

const formatValue = (value: number): string => {
    const isNegative = value < 0;
    const absValue = Math.abs(value); // Get the absolute value for formatting
  
    let formattedValue = '';
  
    if (absValue >= 1e9) {
      formattedValue = `${(absValue / 1e9).toFixed(2)}B`;
    } else if (absValue >= 1e6) {
      formattedValue = `${(absValue / 1e6).toFixed(2)}M`;
    } else {
      formattedValue = absValue.toString();
    }
  
    // If the value is negative, prepend a negative sign
    return isNegative ? `-${formattedValue}` : formattedValue;
  };

interface BankData {
  selected_bank: string;
  count: number;
  deal_size: number;
  "Weighted Allocation as % of Deal Size": number;
  "Weighted Allocation as % of IOI": number;
  t1m_return_from_dealogic: number;
}

const BankTable: React.FC<FilterTableProps> = ({ selectedFilters }) => {
  const [data, setData] = useState<BankData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof BankData | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/api/by_bank/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters]);

  const handleSort = (column: keyof BankData) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(column);
    
    const sortedData = [...data].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];
      return (isAsc ? valueA > valueB : valueA < valueB) ? 1 : -1;
    });

    setData(sortedData);
  };

  return (
    <Card sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h5" marginBottom="20px" color="#002060" fontWeight="bold">Top 10 Banks</Typography>
        {loading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && data.length === 0 && <Typography>No data available</Typography>}
        {!loading && !error && data.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: "auto" }}>
            <Table sx={{ borderCollapse: "collapse" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#466675" }}>
                  {[
                    "selected_bank",
                    "count",
                    "deal_size",
                    "Weighted Allocation as % of Deal Size",
                    "Weighted Allocation as % of IOI",
                    "t1m_return_from_dealogic",
                  ].map((col, index) => (
                    <TableCell key={index} sx={{ border: "1px solid #ddd", color: "white", fontWeight: "bold" }}>
                      <TableSortLabel
                        active={sortColumn === col}
                        direction={sortColumn === col ? sortDirection : 'asc'}
                        onClick={() => handleSort(col as keyof BankData)}
                      >
                        {col.replace(/_/g, " ").toUpperCase()}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ border: "1px solid #ddd" }}>{row.selected_bank}</TableCell>
                    <TableCell sx={{ border: "1px solid #ddd" }}>{row.count}</TableCell>
                    <TableCell sx={{ border: "1px solid #ddd" }}>{formatValue(Number(row.deal_size.toFixed(0)))}</TableCell>
                    <TableCell sx={{ border: "1px solid #ddd" }}>{row["Weighted Allocation as % of Deal Size"].toFixed(2)}%</TableCell>
                    <TableCell sx={{ border: "1px solid #ddd" }}>{row["Weighted Allocation as % of IOI"].toFixed(2)}%</TableCell>
                    <TableCell sx={{ border: "1px solid #ddd" }}>{row.t1m_return_from_dealogic.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default BankTable;
