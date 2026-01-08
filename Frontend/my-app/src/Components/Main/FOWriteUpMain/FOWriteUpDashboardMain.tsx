import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import FOSectionsMain from "./FOWriteUpHooks/FOSectionsMain";

interface FOData {
  ticker: string;
  issuer_name: string;
  pricing_date: string | null;
  deal_id: string;
  exchange: string | null;
  deal_size: number | null;
  expected_listing_date: string | null;
  sector: string | null;
}

interface FOWriteUpDashboardMainProps {
  ticker?: string;
}

const FOWriteUpDashboardMain: React.FC<FOWriteUpDashboardMainProps> = ({
  ticker,
}) => {
  const [rows, setRows] = useState<FOData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<{
    ticker: string;
    deal_id: string;
  } | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/fo_writeup_tickers/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch FO data");

        const json: FOData[] = await response.json();
        setRows(json);
      } catch (err) {
        console.error("Error fetching FO data:", err);
      }
    };

    fetchData();
  }, [apiUrl, token, ticker]);

  const formatDate = (dateStr: string | null): string =>
    !dateStr || isNaN(new Date(dateStr).getTime())
      ? "To Be Announced"
      : new Date(dateStr).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

  const columns: GridColDef[] = [
    {
      field: "ticker",
      headerName: "Symbol",
      flex: 1,
      renderCell: (params) => (
        <span
          style={{ color: "red", textDecoration: "underline", fontWeight: 600 }}
        >
          {params.value || "Not Available"}
        </span>
      ),
    },
    {
      field: "issuer_name",
      headerName: "Company",
      flex: 1,
      valueFormatter: (params) => params || "Not Available",
    },
    {
      field: "sector",
      headerName: "Sector",
      flex: 1,
      valueFormatter: (params) => params || "Not Available",
    },
    {
      field: "expected_listing_date",
      headerName: "Expected Listing Date",
      flex: 1.2,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "pricing_date",
      headerName: "Pricing Date",
      flex: 1,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "exchange",
      headerName: "Exchange",
      flex: 1,
      valueFormatter: (params) => params || "Not Available",
    },
    {
      field: "deal_size",
      headerName: "Deal Size ($ Million)",
      flex: 1,
      valueFormatter: (params) => {
        if (params === null || params === undefined || params === 0) {
          return "Not Available";
        }
        const millions = params / 1000000;
        return `$ ${Math.round(millions).toLocaleString()}M`;
      },
    },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingRows = rows.filter((row) => {
    if (!row.expected_listing_date) return true;
    const listingDate = new Date(row.expected_listing_date);
    if (isNaN(listingDate.getTime())) return true;
    return listingDate >= today;
  });
  const visibleRows = activeTab === 0 ? upcomingRows : rows;
  const trimmedQuery = searchTerm.trim().toLowerCase();
  const filteredRows = visibleRows.filter((row) => {
    if (!trimmedQuery) return true;
    const tickerMatch = row.ticker?.toLowerCase().includes(trimmedQuery);
    const issuerMatch = row.issuer_name?.toLowerCase().includes(trimmedQuery);
    return tickerMatch || issuerMatch;
  });

  return (
    <Container maxWidth="xl">
      <Container maxWidth="lg">
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 3,
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2, pt: 2, pb: 1, bgcolor: "#f5f7fb" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color="#002060"
                sx={{ whiteSpace: "nowrap" }}
              >
             All Upcoming and Recent Follow-On Offers
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    border: "1px solid #d0d5e2",
                    borderRadius: 1,
                    bgcolor: "#ffffff",
                    overflow: "hidden",
                  }}
                >
                  <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    TabIndicatorProps={{ style: { display: "none" } }}
                    sx={{
                      minHeight: 36,
                      "& .MuiTab-root": {
                        minHeight: 36,
                        px: 2,
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: "none",
                      },
                      "& .MuiTab-root.Mui-selected": {
                        bgcolor: "#1b1f6b",
                        color: "#ffffff",
                      },
                    }}
                  >
                    <Tab label="Upcoming" />
                    <Tab label="All" />
                  </Tabs>
                </Box>
                <TextField
                  size="small"
                  placeholder="Search ticker or company..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  sx={{
                    minWidth: 240,
                    bgcolor: "#ffffff",
                    "& .MuiOutlinedInput-root": {
                      height: 36,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ maxHeight: 500 }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row.deal_id}
              pageSizeOptions={[5, 10, 20]}
              rowHeight={40}
              disableRowSelectionOnClick
              rowSelectionModel={selected ? [selected.deal_id] : []}
              onRowClick={(params) =>
                setSelected({
                  ticker: params.row.ticker,
                  deal_id: params.row.deal_id,
                })
              }
              sx={{
                "& .MuiDataGrid-container--top [role='row']": {
                  backgroundColor: "#002060",
                  color: "#FFFFFF",
                },
                "& .Mui-selected": {
                  backgroundColor: "#cad0f1ff !important",
                },
                "& .MuiDataGrid-footerContainer": {
                  minHeight: "40px",
                  height: "40px",
                },
                "& .MuiTablePagination-toolbar": {
                  minHeight: "40px",
                  height: "40px",
                },
                cursor: "pointer",
                border: "1px solid #ccccccff",
              }}
            />
          </Box>
        </Box>
      </Container>

      {!selected ? (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px dashed #9aa4c0",
              backgroundColor: "#f8f9fc",
              textAlign: "center",
              mb: 4,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} color="#002060">
              Select a ticker to view detailed FO write-up
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click on any row in the table above to load in-depth insights,
              valuation, and commentary for that offer.
            </Typography>
          </Box>
        </Container>
      ) : (
        <Box mt={4}>
          <FOSectionsMain
            ticker={selected.ticker}
            deal_id={selected.deal_id}
            selected={selected}
            setSelected={setSelected}
          />
        </Box>
      )}
    </Container>
  );
};

export default FOWriteUpDashboardMain;
