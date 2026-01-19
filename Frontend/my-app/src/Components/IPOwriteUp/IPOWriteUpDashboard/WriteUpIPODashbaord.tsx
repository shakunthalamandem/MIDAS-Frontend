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
  CircularProgress,
  Grid
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNavigate, useParams } from "react-router-dom";
import IPOWriteUpControls from "./IPOWriteUpControls";
import IPOWriteUpTable from "./IPOWriteUpTable";
import { FilterType, IpoData } from "./types";

// ✅ Lazy-load the heavy dashboard to keep initial load blazing fast
const IPODashboardMain = React.lazy(
  () => import("../../IPODashboardLLM/IPODashboardMain")
);

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


  const [pricingDatedRows, pricingTbaRows] = useMemo(() => {
    const hasPricingDate = (value: string | null) => {
      if (!value) return false;
      const normalized = String(value).trim().toLowerCase();
      if (!normalized) return false;
      if (normalized === "tbd") return false;
      if (normalized === "to be announced") return false;
      if (normalized === "to be announce") return false;
      return true;
    };

    const dated = filteredData.filter((row) => hasPricingDate(row.pricing_date));
    const tba = filteredData.filter((row) => !hasPricingDate(row.pricing_date));
    return [dated, tba];
  }, [filteredData]);



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
          <IPOWriteUpControls
            headerTitle={headerTitle}
            regionFilter={regionFilter}
            onRegionChange={setRegionFilter}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

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
            <>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <IPOWriteUpTable
                    title="Pricing Date Available"
                    rows={pricingDatedRows}
                    emptyMessage="No IPOs with pricing dates for this filter."
                    selectedTicker={selectedTicker}
                    dashboardLocked={dashboardLocked}
                    onRowSelect={handleRowClick}
                  />
                </Grid>
                <Grid item xs={12}>
                  <IPOWriteUpTable
                    title="To Be Announced"
                    rows={pricingTbaRows}
                    emptyMessage="No TBA IPOs for this filter."
                    selectedTicker={selectedTicker}
                    dashboardLocked={dashboardLocked}
                    onRowSelect={handleRowClick}
                  />
                </Grid>
              </Grid>

            </>
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
