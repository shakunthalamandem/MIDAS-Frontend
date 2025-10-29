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
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link, useParams } from "react-router-dom";
import { formatDate, formatDealSize } from "./IPOWriteUpUtils";
import IPODashboardMain from "../../IPODashboardLLM/IPODashboardMain";

interface IpoData {
  ticker: string;
  company_name: string;
  sector: string | null;
  pricing_date: string | null;
  pricing_range_min: number | null;
  pricing_range_max: number | null;
  exchange: string | null;
  deal_size: number | null;
}

type FilterType = "upcoming" | "all";

const WriteUpIPODashbaord: React.FC = () => {
  const { ticker: paramTicker } = useParams<{ ticker: string }>();
  const [ipoData, setIpoData] = useState<IpoData[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>(paramTicker || "");
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<FilterType>("upcoming");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${apiUrl}/api/ipo_dashboard_data/?type=${filterType}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch IPO data");

        const json = await response.json();
        const data: IpoData[] = json.results || [];

        const uniqueRows = Array.from(
          new Map(
            data.map((item) => [`${item.ticker}_${item.pricing_date}`, item])
          ).values()
        );

        setIpoData(uniqueRows);

        if (paramTicker) {
          setSelectedTicker(paramTicker);
        } else if (!selectedTicker && uniqueRows.length > 0) {
          setSelectedTicker(uniqueRows[0].ticker);
        }
      } catch (error) {
        console.error("Error fetching IPO data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIpoData();
  }, [apiUrl, token, paramTicker, filterType, selectedTicker]);

  return (
    <>
      {/* Header */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "40px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to detailed Insights on IPO - {selectedTicker || "Loading..."}
      </Typography>

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
<Stack
  direction="row"
  spacing={2}
  mb={2}
  alignItems="center"
  justifyContent="space-between"
  sx={{ width: "100%" }}
>
  {/* Centered heading */}
  <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
    <Typography
      variant="h6"
      fontWeight="bold"
      textAlign="center"
      color="#002060"
    >
      📅 {filterType === "all" ? "All IPOs" : "Upcoming IPOs"}
    </Typography>
  </Box>

  {/* Right-aligned toggle group */}
  <ToggleButtonGroup
    value={filterType}
    exclusive
    size="small"
    onChange={(_, v) => v && setFilterType(v)}
    sx={{ justifySelf: "flex-end" }}
  >
    <ToggleButton
      value="upcoming"
      sx={{
        "&.Mui-selected, &.Mui-selected:hover": {
          backgroundColor: "#002060",
          color: "#fff",
        },
      }}
    >
      Upcoming
    </ToggleButton>
    <ToggleButton
      value="all"
      sx={{
        "&.Mui-selected, &.Mui-selected:hover": {
          backgroundColor: "#002060",
          color: "#fff",
        },
      }}
    >
      All
    </ToggleButton>
  </ToggleButtonGroup>
</Stack>


          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="30vh">
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 2, maxHeight: 350, overflow: "auto" }}  
            >
              <Table
                stickyHeader  
                sx={{ borderCollapse: "collapse", border: "1px solid black" }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#002060" }}>
                    {[
                      "Symbol",
                      "Company",
                      "Pricing Date",
                      "Sector",
                      "Price Range",
                      "Exchange",
                      "Deal Size",
                    ].map((heading) => (
                      <TableCell
                        key={heading}
                        align="center"
                        sx={{
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "0.78rem",
                          padding: "6px 8px",
                          border: "1px solid black",
                          lineHeight: 1.2,
                          backgroundColor: "#002060",
                        }}
                      >
                        {heading}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {ipoData.map((row, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        "&:hover": { backgroundColor: "#f0f8ff" },
                        backgroundColor:
                          row.ticker === selectedTicker ? "#e6f7ff" : "inherit",
                        border: "1px solid black",
                      }}
                    >
                      {/* Symbol */}
                      <TableCell
                        align="center"
                        sx={{
                          fontSize: "0.78rem",
                          padding: "6px 8px",
                          border: "1px solid black",
                          fontWeight: 600,
                          lineHeight: 1.2,
                        }}
                      >
                        <Link
                          to={`/equity/ipo_dashboard/${row.ticker}`}
                          state={{ fromTickerClick: true }}
                          onClick={() => setSelectedTicker(row.ticker)}
                          style={{
                            color: "#d80606ff",
                            fontWeight: "bold",
                            textDecoration: "underline",
                          }}
                        >
                          {row.ticker}
                        </Link>
                      </TableCell>

                      {/* Company */}
                      <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}>
                        {row.company_name}
                      </TableCell>

                      {/* Pricing Date */}
                      <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}>
                        {formatDate(row.pricing_date)}
                      </TableCell>

                      {/* Sector */}
                      <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}>
                        {row.sector || "—"}
                      </TableCell>

                      {/* Price Range */}
                      <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}>
                        {row.pricing_range_min !== null && row.pricing_range_max !== null
                          ? `$${row.pricing_range_min} - $${row.pricing_range_max}`
                          : "TBA"}
                      </TableCell>

                      {/* Exchange */}
                      <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}>
                        {row.exchange || "—"}
                      </TableCell>

                      {/* Deal Size */}
                      <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}>
                        {formatDealSize(row.deal_size)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Info note */}
        <Typography
          variant="body2"
          textAlign="center"
          color="textSecondary"
          sx={{
            fontStyle: "italic",
            mt: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <InfoOutlinedIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          Note: IPO deals above $50M offer size.
        </Typography>
      </Container>

      {/* ✅ Render Dashboard only when data + ticker are ready */}
      <IPODashboardMain selectedTicker={selectedTicker} />
    </>
  );
};

export default WriteUpIPODashbaord;
