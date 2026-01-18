import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  TableSortLabel
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import LanguageIcon from "@mui/icons-material/Language";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate, formatDealSize } from "./IPOWriteUpUtils";

// ✅ Lazy-load the heavy dashboard to keep initial load blazing fast
const IPODashboardMain = React.lazy(
  () => import("../../IPODashboardLLM/IPODashboardMain")
);

interface IpoData {
  ticker: string;
  company_name: string;
  sector: string | null;
  region: string | null;
  pricing_date: string | null;
  pricing_range_min: number | null;
  pricing_range_max: number | null;
  exchange: string | null;
  deal_size: number | null;
}

type FilterType = "upcoming" | "all";
type Order = "asc" | "desc";

const WriteUpIPODashbaord: React.FC = () => {
  const { ticker: paramTicker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();

  const [ipoData, setIpoData] = useState<IpoData[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>(
    paramTicker || ""
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<FilterType>("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("US");
  const [dashboardLocked, setDashboardLocked] = useState<boolean>(
    Boolean(paramTicker)
  );

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const [orderBy, setOrderBy] = useState<keyof IpoData>("sector");
  const [order, setOrder] = useState<Order>("asc");
  const ellipsisCellSx = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

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

        // Keep URL param behaviour, but do NOT auto-select first row.
        if (paramTicker) {
          setSelectedTicker(paramTicker);
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

  useEffect(() => {
    if (paramTicker) {
      setDashboardLocked(true);
    } else {
      setDashboardLocked(false);
    }
  }, [paramTicker]);

  const handleSort = (property: keyof IpoData) => {
  const isAsc = orderBy === property && order === "asc";
  setOrder(isAsc ? "desc" : "asc");
  setOrderBy(property);
};


  // Filter by ticker or company name
  const filteredData = useMemo(() => {
    let data = ipoData;

    // ✅ region filter
    if (regionFilter !== "all") {
      const normalizedFilter =
        regionFilter === "NON_US_AMERICA"
          ? "NON-US AMERICA"
          : regionFilter.toUpperCase();
      data = data.filter((row) => {
        const normalizedRow = row.region
          ? String(row.region).trim().toUpperCase()
          : "";
        if (normalizedFilter === "NON-US AMERICA") {
          return normalizedRow === "NON-US AMERICA" || normalizedRow === "LATAM";
        }
        return normalizedRow === normalizedFilter;
      });
    }

    // existing search filter
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;

    return data.filter(
      (row) =>
        row.ticker.toLowerCase().includes(q) ||
        (row.company_name || "").toLowerCase().includes(q)
    );
  }, [ipoData, searchQuery, regionFilter]);

  const sortedData = useMemo(() => {
  return [...filteredData].sort((a, b) => {
    const valA = a[orderBy];
    const valB = b[orderBy];

    const isEmptyA =
      valA === null || valA === "" || valA === "To Be Announced";
    const isEmptyB =
      valB === null || valB === "" || valB === "To Be Announced";

    // Both empty
    if (isEmptyA && isEmptyB) return 0;

    // ASC: numbers/dates up, strings/TBA down
    if (order === "asc") {
      if (isEmptyA) return 1;
      if (isEmptyB) return -1;
    }

    // DESC: strings/TBA up, numbers/dates down
    if (order === "desc") {
      if (isEmptyA) return -1;
      if (isEmptyB) return 1;
    }

    // 🔢 Number comparison
    if (typeof valA === "number" && typeof valB === "number") {
      return order === "asc" ? valA - valB : valB - valA;
    }

    // 📅 Date comparison (valid date strings only)
    const dateA = typeof valA === "string" ? Date.parse(valA) : NaN;
    const dateB = typeof valB === "string" ? Date.parse(valB) : NaN;

    if (!isNaN(dateA) && !isNaN(dateB)) {
      return order === "asc" ? dateA - dateB : dateB - dateA;
    }

    // 🔤 String comparison (fallback)
    return order === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });
}, [filteredData, order, orderBy]);



  const headerTitle =
    filterType === "all"
      ? "Explore All IPO Listings"
      : "Upcoming IPO Opportunities";

  // ✅ When clicking any part of the row, update state + URL
  const handleRowClick = (ticker: string) => {
    if (dashboardLocked && ticker !== selectedTicker) return;
    if (ticker === selectedTicker) return;

    setDashboardLocked(true);
    setSelectedTicker(ticker);
    navigate(`/equity/ipo_dashboard/${ticker}`, {
      state: { fromTickerClick: true },
    });
  };

  const handleDashboardLoadComplete = useCallback(
    (status: "success" | "error") => {
      if (status === "success") {
        setDashboardLocked(false);
        return;
      }
      // Unlock so users can pick another ticker even if load failed.
      setDashboardLocked(false);
    },
    []
  );

  const isRowSelected = (ticker: string) => ticker === selectedTicker;

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
Welcome to detailed Insights on IPO Write-Ups!
        </Typography>
      </Box>

      <Container maxWidth="xl">
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
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{ mb: 2, flexWrap: "wrap" }}
          >
            {[
              { label: "US", value: "US", icon: <PublicIcon fontSize="small" /> },
              { label: "APAC", value: "APAC", icon: <LanguageIcon fontSize="small" /> },
              { label: "EMEA", value: "EMEA", icon: <TravelExploreIcon fontSize="small" /> },
              { label: "Others", value: "NON_US_AMERICA", icon: <Diversity3Icon fontSize="small" /> },
            ].map((item) => {
              const isSelected = regionFilter === item.value;
              return (
                <Paper
                  key={item.value}
                  onClick={() => setRegionFilter(item.value)}
                  sx={{
                    px: 2,
                    py: 0.6,
                    borderRadius: 999,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    border: isSelected ? "1px solid #2b146f" : "1px solid #d7ddea",
                    backgroundColor: isSelected ? "#2b146f" : "#ffffff",
                    color: isSelected ? "#ffffff" : "#1f2a44",
                    boxShadow: isSelected ? "0 8px 18px rgba(43,20,111,0.18)" : "none",
                    transition: "all 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    "&:hover": {
                      backgroundColor: isSelected ? "#24105f" : "#f6f8fc",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    {item.icon}
                    <Typography fontWeight={600} color="inherit">
                      {item.label}
                    </Typography>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>

          {/* Top controls: title | toggle + search */}
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
                onChange={(_, v: FilterType | null) => v && setFilterType(v)}
                sx={{
                  borderRadius: 2,
                  "& .MuiToggleButton-root": {
                    px: 1.5,
                    py: 0.9,
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
                  tableLayout: "fixed",
                  width: "100%",
                }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#0b2a6b" }}>
                    {[
                      { label: "Symbol", key: "ticker" },
                      { label: "Company", key: "company_name" },
                      { label: "Pricing Date", key: "pricing_date" },
                      { label: "Sector", key: "sector" },
                      { label: "Price Range", key: "pricing_range_max" }, // not sortable
                      { label: "Exchange", key: "exchange" },
                      { label: "Deal Size", key: "deal_size" },
                    ].map((h) => {
                        const key = h.key as keyof IpoData | undefined;

                      return (
                        <TableCell
                          key={h.label}
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
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                    {key ? (
                      <TableSortLabel
                        active={orderBy === key}
                        direction={orderBy === key ? order : "asc"}
                        onClick={() => handleSort(key)}
                      sx={{
                        color: "#fff !important",
                          "& .MuiTableSortLabel-icon": {
                              color: "#fff !important",
                            },
                          }}
                        >
                        {h.label}
                  </TableSortLabel>
                  ) : (
                  h.label
                  )}
                </TableCell>
              );
                })}

                  </TableRow>
                </TableHead>

                <TableBody>
                {sortedData.map((row, index) => {
                  const selected = isRowSelected(row.ticker);
                  const rowDisabled =
                    dashboardLocked && row.ticker !== selectedTicker;
                  return (
                    <TableRow
                      key={`${row.ticker}_${row.pricing_date}_${index}`}
                      hover
                      onClick={() => handleRowClick(row.ticker)}
                      sx={{
                        cursor: rowDisabled ? "not-allowed" : "pointer",
                        opacity: rowDisabled ? 0.55 : 1,
                        backgroundColor: selected ? "#81e67eff" : "inherit",
                        "&:hover": {
                          backgroundColor: selected ? "#ffe9c2" : "#f3f8ff",
                        },
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
                            textDecoration: "underline",
                            ...ellipsisCellSx,
                            maxWidth: 120,
                          }}
                        >
                          {row.ticker}
                        </TableCell>

                        {/* Company */}
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: "0.82rem",
                            padding: "7px 8px",
                            border: "1px solid black",
                            lineHeight: 1.2,
                            ...ellipsisCellSx,
                            maxWidth: 260,
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
                            ...ellipsisCellSx,
                            maxWidth: 160,
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
                            ...ellipsisCellSx,
                            maxWidth: 180,
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
                            ...ellipsisCellSx,
                            maxWidth: 160,
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
                            ...ellipsisCellSx,
                            maxWidth: 180,
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
                            ...ellipsisCellSx,
                            maxWidth: 140,
                          }}
                        >
                          {formatDealSize(row.deal_size)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {dashboardLocked && selectedTicker && (
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            sx={{ display: "block", mt: 1 }}
          >
            Loading detailed view for {selectedTicker}...
          </Typography>
        )}

        {/* Info note */}
        <Typography
          variant="body2"
          textAlign="center"
          color="textSecondary"
          sx={{
            fontStyle: "italic",
            mt: 1,
            mb: 3,
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

      {/* ✅ Below-table section:
          - If no ticker selected: show guidance text.
          - If ticker selected: lazy-load IPODashboardMain with a small spinner.
          - Width now matches your original setup (no maxWidth constraint).
      */}
      <Box sx={{ mb: 6, px: 2 }}>
        {!selectedTicker ? (
          <Box
            sx={{
              borderRadius: 2,
              border: "1px dashed #cbd5e1",
              backgroundColor: "#fdfdfd",
              py: 4,
              px: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Select a ticker to view detailed IPO write-up
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click on any row in the table above to load in-depth insights,
              valuation, and commentary for that IPO.
            </Typography>
          </Box>
        ) : (
          <Suspense
            fallback={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 4,
                }}
              >
                <CircularProgress />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1.5 }}
                >
                  Loading IPO write-up for <strong>{selectedTicker}</strong>…
                </Typography>
              </Box>
            }
          >
            <IPODashboardMain
              selectedTicker={selectedTicker}
              onLoadComplete={handleDashboardLoadComplete}
            />
          </Suspense>
        )}
      </Box>
    </>
  );
};

export default WriteUpIPODashbaord;
