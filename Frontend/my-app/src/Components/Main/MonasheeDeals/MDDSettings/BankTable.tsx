import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Container,
} from "@mui/material";

interface FilterTableProps {
  selectedFilters: Record<string, any>;
}

const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  let formattedValue = "";

  if (absValue >= 1e9) formattedValue = `${(absValue / 1e9).toFixed(2)}B`;
  else if (absValue >= 1e6) formattedValue = `${(absValue / 1e6).toFixed(2)}M`;
  else formattedValue = absValue.toString();

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

interface BankData {
  selected_bank: string;
  count: number;
  deal_size: number;
  "Weighted Allocation as % of Deal Size": number;
  "Weighted Allocation as % of IOI": number;
  t1m_return_from_bloomberg: number;
}

const columns: { label: string; key: keyof BankData }[] = [
  { label: "Bank", key: "selected_bank" },
  { label: "Deal count", key: "count" },
  { label: "Deal Volume", key: "deal_size" },
  { label: "Weighted Allocation as % of Deal Size", key: "Weighted Allocation as % of Deal Size" },
  { label: "Weighted Allocation as % of IOI", key: "Weighted Allocation as % of IOI" },
  { label: "t + 1M Return (AVG)", key: "t1m_return_from_bloomberg" },
];

const BankTable: React.FC<FilterTableProps> = ({ selectedFilters }) => {
  const [data, setData] = useState<BankData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof BankData | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });
        const result = await response.json();
        setData(result);
      } catch {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters]);

  const handleSort = (column: keyof BankData) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    const direction = isAsc ? "desc" : "asc";

    const sortedData = [...data].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (typeof valueA === "string" && typeof valueB === "string") {
        return direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return direction === "asc"
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });

    setSortColumn(column);
    setSortDirection(direction);
    setData(sortedData);
  };

  return (
    <Container>
      <Card sx={{ p: 2, boxShadow: 3, borderRadius: 2, mt: 5 }}>
        <CardContent>
          <Typography variant="h6" mb={2} color="#002060" fontWeight="bold">
            Top 10 Banks
          </Typography>
          {loading && <CircularProgress sx={{ display: "block", mx: "auto", my: 2 }} />}
          {error && <Typography color="error">{error}</Typography>}
          {!loading && !error && data.length === 0 && <Typography>No data available</Typography>}
          {!loading && !error && data.length > 0 && (
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 600,
                overflowY: "auto",
                borderRadius: 1,
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: "4px" },
                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#555" },
              }}
            >
              <Table size="small" stickyHeader sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#466675" }}>
                    {columns.map(({ label, key }) => (
                      <TableCell
                        key={key}
                        sx={{ color: "#FFFFFF",bgcolor:'#466675', fontWeight: "bold", borderBottom: "2px solid #222" }}
                      >
                        <TableSortLabel
                          active={sortColumn === key}
                          direction={sortColumn === key ? sortDirection : "asc"}
                          onClick={() => handleSort(key)}
                          sx={{ color: "#FFFFFF", "&.Mui-active": { color: "orange" } }}
                        >
                          {label.toUpperCase()}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" } }}
                    >
                      {columns.map(({ key }) => {
                        let value = row[key];

                        if (key === "selected_bank") {
                          value = value && value !== "0" ? value : "Not Available";
                        } else if (key === "deal_size") {
                          value = formatValue(Number((value as number).toFixed(0)));
                        } else if (
                          key === "Weighted Allocation as % of Deal Size" ||
                          key === "Weighted Allocation as % of IOI" ||
                          key === "t1m_return_from_bloomberg"
                        ) {
                          value = `${(value as number).toFixed(2)}%`;
                        }

                        return <TableCell key={key}>{value}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default BankTable;
