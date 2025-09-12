import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type DealUnifiedSummaryTableDashboardProps = {
  data?: {
    gics_sector_from_bloomberg?: string;
    broad_region?: string;
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
};

const DealUnifiedSummaryTableDashboard: React.FC<DealUnifiedSummaryTableDashboardProps> = ({ data }) => {
  // Map input props to API-compatible keys
  const sector = data?.gics_sector_from_bloomberg;
  const region = data?.broad_region;
  const dealtype = data?.deal_type;
  const fo_type = data?.fo_type || "";

  const [rows, setRows] = useState<MddSummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
     console.log("Effect running with:", { sector, region, dealtype, fo_type });
    // Prevent API call if essential values are missing
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
    { field: "gics_sector_from_bloomberg", headerName: "Sector", width: 150 },
    { field: "deal_type", headerName: "Deal Type", width: 100 },
    { field: "broad_region", headerName: "Region", width: 100 },
    { field: "allocated_capital", headerName: "Allocated Capital", width: 150, type: "number" },
    { field: "allocation_percentage", headerName: "Allocation %", width: 130, type: "number" },
    { field: "allocation_deal_size_percentage", headerName: "Deal Size %", width: 130, type: "number" },
    { field: "am_capital_committed", headerName: "AM Capital", width: 130, type: "number" },
    { field: "am_return", headerName: "AM Return", width: 130, type: "number" },
    { field: "total_return", headerName: "Total Return", width: 130, type: "number" },
    { field: "model_am_capital", headerName: "Model AM Capital", width: 150, type: "number" },
    { field: "model_am_return", headerName: "Model AM Return", width: 150, type: "number" },
    { field: "model_return_1_allocation", headerName: "Model Return 1 Alloc", width: 180, type: "number" },
    { field: "model_actual_return", headerName: "Model Actual Return", width: 160, type: "number" },
  ];

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        MDD Summary Table
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowHeight={() => "auto"}
          />
        </Box>
      )}
    </Paper>
  );
};

export default DealUnifiedSummaryTableDashboard;
