import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Alert,
} from "@mui/material";

interface IpoData {
  ticker: string;
  company_name: string;
  expected_listing_date: string;
  price: string | number | null;
  exchange: string | null;
  deal_size: number | null;
  deal_type: string | null;
}

interface Props {
  selectedTickers: { ticker: string }[];
  setSelectedTickers: React.Dispatch<React.SetStateAction<{ ticker: string }[]>>;
}

const UpcomingIpoTable: React.FC<Props> = ({
  selectedTickers,
  setSelectedTickers,
}) => {
  const [ipoData, setIpoData] = useState<IpoData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/unified_new_deal_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ type: "upcoming_ipo" }),
        });

        if (!response.ok) throw new Error("Failed to fetch IPO data");

        const data: IpoData[] = await response.json();

        const uniqueRows = Array.from(
          new Map(data.map((item) => [item.ticker, item])).values()
        );

        setIpoData(uniqueRows);
      } catch (error) {
        console.error("Error fetching IPO data:", error);
      }
    };

    fetchIpoData();
  }, [apiUrl, token]);

  const handleCheckboxChange = async (ticker: string) => {
    const isSelected = selectedTickers.some((item) => item.ticker === ticker);

    if (!isSelected && selectedTickers.length >= 3) {
      setError("You can select a maximum of 3 IPOs.");
      return;
    }

    const updatedSelection = isSelected
      ? selectedTickers.filter((item) => item.ticker !== ticker)
      : [...selectedTickers, { ticker }];

    setSelectedTickers(updatedSelection);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/unified_new_deal_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          type: "ticker_status",
          ticker,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update ticker status");
      }

      const result = await response.json();
      console.log("API success:", result);
    } catch (err) {
      console.error("Error posting ticker status:", err);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          backgroundColor: "#f9f9f9",
          borderRadius: 3,
          boxShadow: 2,
          p: 3,
          mt: 2,
          mb: 4,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          color="#002060"
          mb={2}
        >
          📅 Upcoming IPO's and FO's
        </Typography>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#002060" }}>
                <TableCell sx={headerStyle}></TableCell>
                {[
                  "Symbol",
                  "Company",
                  "Deal Type",
                  "Expected Date",
                  "Offer Price",
                  "Exchange",
                  "Deal Size",
                ].map((heading) => (
                  <TableCell key={heading} align="center" sx={headerStyle}>
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ipoData.map((row) => {
                const isChecked = selectedTickers.some(
                  (item) => item.ticker === row.ticker
                );

                return (
                  <TableRow key={row.ticker}>
                    <TableCell align="center" sx={cellStyle}>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(row.ticker)}
                      />
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {row.ticker}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {row.company_name}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {row.deal_type || "—"}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {row.expected_listing_date}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {row.price || "—"}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {row.exchange || "—"}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {row.deal_size || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

const headerStyle = {
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.78rem",
  padding: "6px 8px",
  border: "1px solid black",
};

const cellStyle = {
  fontSize: "0.80rem",
  padding: "2px 8px",
  border: "1px solid black",
};

export default UpcomingIpoTable;
