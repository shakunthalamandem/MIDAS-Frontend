import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Typography,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import BusinessIcon from "@mui/icons-material/Business";
import PublicIcon from "@mui/icons-material/Public";
import CategoryIcon from "@mui/icons-material/Category";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type DealUnifiedSummaryTableDashboardProps = {
  data?: {
    sector?: string;
    region?: string;
    deal_type?: string;
    fo_type?: string;
  };
};

type MddSummaryRow = {
  id: number;
  ticker: string;
  gics_sector_from_bloomberg: string;
  deal_type: string;
  broad_region: string;
  allocated_capital: number;
  allocation_percentage: number;
  allocation_deal_size_percentage: number;
  am_capital_committed: number;
  am_return: number;
  total_return: number;
  model_am_capital: number;
  model_am_return: number;
  model_return_1_allocation: number;
  model_actual_return: number;
  ioi_deal_size: number;
};

const DealUnifiedSummaryTableDashboard: React.FC<
  DealUnifiedSummaryTableDashboardProps
> = ({ data }) => {
  const sector = data?.sector || "-";
  const region = data?.region || "-";
  const dealtype = data?.deal_type || "-";
  const fo_type = data?.fo_type || "";

  const [rows, setRows] = useState<MddSummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!sector || !region || !dealtype) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/summary_mdd_table/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            sector,
            region,
            dealtype,
            fo_type,
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch MDD data");

        const result: Omit<MddSummaryRow, "id">[] = await response.json();

        const rowsWithId: MddSummaryRow[] = result.map((item, index) => ({
          id: index,
          ...item,
        }));

        setRows(rowsWithId);
      } catch (error) {
        console.error("MDD Summary API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sector, region, dealtype, fo_type]);

  const columns: GridColDef[] = [
    { field: "ticker", headerName: "Ticker", width: 100 },



 
    { field: "allocation_deal_size_percentage", headerName: "Allocation as % of Deal Size", width: 130, type: "number" },
    { field: "allocation_percentage", headerName: "Allocation as % of IOI ", width: 130, type: "number" },
    { field: "ioi_deal_size", headerName: "IOI as % Deal Size", width: 130, type: "number" },
    { field: "allocated_capital", headerName: "Allocated Capital ($)", width: 150, type: "number" },
    { field: "am_capital_committed", headerName: "AM Capital ($)", width: 130, type: "number" },
    { field: "allocation_return", headerName: "Allocation P&L ($)", width: 130, type: "number" },
    { field: "am_return", headerName: "AM P&L ($)", width: 130, type: "number" },
    { field: "total_return", headerName: "Total P&L ($)", width: 130, type: "number" },
    { field: "model_return_1_allocation", headerName: "Model Allocation Capital ($)", width: 180, type: "number" },
    { field: "model_am_capital", headerName: "Model AM Capital($)", width: 150, type: "number" },
    { field: "model_return_1_allocation", headerName: "Model P&L with Model Allocation ($)", width: 180, type: "number" },
    { field: "model_am_return", headerName: "Model P&L with Model AM ($)", width: 150, type: "number" },
    { field: "model_actual_return", headerName: "Model Actual P&L", width: 160, type: "number" },
  ];

  return (
    <Container maxWidth="xl" sx={{ mb: 4, mt: 2 }}>
      {/* Info Section Above Table */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          backgroundColor: "#f8f9fb",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={4}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <BusinessIcon color="primary" />
            <Typography variant="body1" fontWeight={500}>
              Sector: <strong>{sector}</strong>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <PublicIcon color="success" />
            <Typography variant="body1" fontWeight={500}>
              Region: <strong>{region}</strong>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <CategoryIcon color="secondary" />
            <Typography variant="body1" fontWeight={500}>
              Deal Type: <strong>{dealtype}</strong>
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" mt={2}>
          <InfoOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            Below table consists of past 2 years of performance for tickers
            Monashee participated in.
          </Typography>
        </Stack>
      </Paper>

      {/* DataGrid Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            checkboxSelection={false}
            sortingOrder={["asc", "desc"]}
            rowHeight={35}
            sx={{
              "& .MuiDataGrid-container--top [role='row']": {
                backgroundColor: "#002060",
                color: "#FFFFFF",
              },
              "& .Mui-selected": {
                backgroundColor: "#cad0f1ff !important",
              },
              cursor: "pointer",
              border: "1px solid #ccccccff",
            }}
          />
        </Box>
      )}
    </Container>
  );
};

export default DealUnifiedSummaryTableDashboard;
