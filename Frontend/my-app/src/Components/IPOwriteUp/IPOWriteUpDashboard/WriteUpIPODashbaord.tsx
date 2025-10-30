import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
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
  const [selectedTicker, setSelectedTicker] = useState<string>(
    paramTicker || ""
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<FilterType>("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

        // De-dup by ticker + pricing_date
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
    // Note: exclude selectedTicker from deps to avoid re-fetch loops
  }, [apiUrl, token, paramTicker, filterType]);

  // Filter by ticker or company name
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ipoData;
    return ipoData.filter(
      (row) =>
        row.ticker.toLowerCase().includes(q) ||
        (row.company_name || "").toLowerCase().includes(q)
    );
  }, [ipoData, searchQuery]);

  const headerTitle =
    filterType === "all"
      ? "Explore All IPO Listings"
      : "Upcoming IPO Opportunities";

  return (
    <>
      {/* Header bar (simple, clean) */}
      <Box
        sx={{
          backgroundColor: "#0b2a6b",
          color: "#fff",
          py: 1.2,
          textAlign: "center",
          mb: 3,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, letterSpacing: 0.2 }}
        >
          IPO Insights — {selectedTicker || "Select a symbol"}
        </Typography>
      </Box>

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
          {/* Top controls: title (left) | chips (center) | toggle + search (right) */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            mb={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            {/* Heading */}
            <Typography
              variant="h6"
              fontWeight="bold"
              color="#0b2a6b"
              sx={{ lineHeight: 1 }}
            >
              {headerTitle}
            </Typography>

            {/* Right controls: Toggle + Search */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="flex-end"
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <ToggleButtonGroup
                value={filterType}
                exclusive
                size="small"
                onChange={(_, v) => v && setFilterType(v)}
                sx={{
                  borderRadius: 2,
                  "& .MuiToggleButton-root": {
                    px: 1.5,
                    py: 0.5,
                    fontSize: "0.8rem",
                    textTransform: "none",
                    borderColor: "#cbd5e1",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#0b2a6b !important",
                    color: "#fff !important",
                    borderColor: "#0b2a6b !important",
                  },
                }}
              >
                <ToggleButton value="upcoming">Upcoming</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
              </ToggleButtonGroup>

              <TextField
                placeholder="Search ticker or company…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{ minWidth: 260, backgroundColor: "#fff", borderRadius: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Stack>

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="30vh"
            >
              <CircularProgress color="primary" />
            </Box>
          ) : filteredData.length === 0 ? (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
                color: "text.secondary",
                border: "1px dashed #cbd5e1",
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                No IPOs match your search/filter.
              </Typography>
              <Typography variant="body2">
                Try clearing the search or switching filters.
              </Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 2, maxHeight: 380, overflow: "auto" }}
            >
              <Table
                stickyHeader
                sx={{
                  borderCollapse: "collapse",
                  border: "1px solid black",
                }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#0b2a6b" }}>
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
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          padding: "7px 8px",
                          border: "1px solid black",
                          lineHeight: 1.2,
                          backgroundColor: "#0b2a6b",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow
                      key={`${row.ticker}_${row.pricing_date}_${index}`}
                      hover
                      onClick={() => setSelectedTicker(row.ticker)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#f3f8ff" },
                        backgroundColor:
                          row.ticker === selectedTicker ? "#e6f3ff" : "inherit",
                        border: "1px solid black",
                      }}
                    >
                      {/* Symbol */}
                      <TableCell
                        align="center"
                        sx={{
                          fontSize: "0.82rem",
                          padding: "7px 8px",
                          border: "1px solid black",
                          fontWeight: 700,
                          lineHeight: 1.2,
                          color: "#b10f0f",
                        }}
                      >
                        <Link
                          to={`/equity/ipo_dashboard/${row.ticker}`}
                          state={{ fromTickerClick: true }}
                          style={{
                            color: "inherit",
                            fontWeight: 700,
                            textDecoration: "underline",
                          }}
                        >
                          {row.ticker}
                        </Link>
                      </TableCell>

                      {/* Company */}
                      <TableCell
                        align="center"
                        sx={{
                          fontSize: "0.82rem",
                          padding: "7px 8px",
                          border: "1px solid black",
                          lineHeight: 1.2,
                        }}
                      >
                        {row.company_name}
                      </TableCell>

                      {/* Pricing Date */}
                      <TableCell
                        align="center"
                        sx={{
                          fontSize: "0.82rem",
                          padding: "7px 8px",
                          border: "1px solid black",
                          lineHeight: 1.2,
                        }}
                      >
                        {formatDate(row.pricing_date)}
                      </TableCell>

                      {/* Sector */}
                      <TableCell
                        align="center"
                        sx={{
                          fontSize: "0.82rem",
                          padding: "7px 8px",
                          border: "1px solid black",
                          lineHeight: 1.2,
                        }}
                      >
                        {row.sector || "—"}
                      </TableCell>

                      {/* Price Range */}
                      <TableCell
                        align="center"
                        sx={{
                          fontSize: "0.82rem",
                          padding: "7px 8px",
                          border: "1px solid black",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.pricing_range_min !== null &&
                        row.pricing_range_max !== null
                          ? `$${row.pricing_range_min} – $${row.pricing_range_max}`
                          : "TBA"}
                      </TableCell>

                      {/* Exchange */}
                      <TableCell
                        align="center"
                        sx={{
                          fontSize: "0.82rem",
                          padding: "7px 8px",
                          border: "1px solid black",
                          lineHeight: 1.2,
                        }}
                      >
                        {row.exchange || "—"}
                      </TableCell>

                      {/* Deal Size */}
                      <TableCell
                        align="center"
                        sx={{
                          fontSize: "0.82rem",
                          padding: "7px 8px",
                          border: "1px solid black",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                        }}
                      >
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
            gap: 0.5,
          }}
        >
          <InfoOutlinedIcon fontSize="small" color="action" />
          Note: IPO deals above $50M offer size.
        </Typography>
      </Container>

      {/* Dashboard (below table) */}
      <IPODashboardMain selectedTicker={selectedTicker} />
    </>
  );
};

export default WriteUpIPODashbaord;
