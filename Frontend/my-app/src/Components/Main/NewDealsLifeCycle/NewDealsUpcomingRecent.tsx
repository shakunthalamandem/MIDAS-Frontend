import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";

// API setup
const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

// Helper: Format multi-line header
const formatHeader = (label: string) => {
  const words = label.split(" ");
  return words.length === 1 ? (
    label
  ) : (
    <span style={{ textAlign: "center", display: "block" }}>
      {words[0]} <br /> {words.slice(1).join(" ")}
    </span>
  );
};

// Helper: Render check or cross icon in table
const renderCheckCell = (params: GridRenderCellParams<any>) => {
  const val = params.value?.toString().toLowerCase();
  const isValid = val && val !== "no" && val !== "-" && val !== "";

  return (
    <span
      style={{
        color: isValid ? "green" : "red",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {isValid ? `✔ (${params.value})` : "✘"}
    </span>
  );
};

// Columns Definition
const columns: GridColDef[] = [
  {
    field: "ticker",
    headerName: "Ticker",
    renderHeader: () => formatHeader("Ticker"),
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "expected_listing_date",
    headerName: "Expected Listing Date",
    renderHeader: () => formatHeader("Expected Listing Date"),
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "pricing_date",
    headerName: "Pricing Date",
    renderHeader: () => formatHeader("Pricing Date"),
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "deal_type",
    headerName: "Deal Type",
    renderHeader: () => formatHeader("Deal Type"),
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "pricing_range_min",
    headerName: "Min Price",
    renderHeader: () => formatHeader("Min Price"),
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "pricing_range_max",
    headerName: "Max Price",
    renderHeader: () => formatHeader("Max Price"),
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "allocation_as_percentage_of_deal_size",
    headerName: "Allocation %",
    renderHeader: () => formatHeader("Allocation %"),
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: renderCheckCell,
  },
  {
    field: "deal_color",
    headerName: "Deal Color",
    renderHeader: () => formatHeader("Deal Color"),
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: renderCheckCell,
  },
  {
    field: "t1d_pred",
    headerName: "T1D Prediction",
    renderHeader: () => formatHeader("T1D Prediction"),
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: renderCheckCell,
  },
  {
    field: "writeup_available",
    headerName: "Writeup Available",
    renderHeader: () => formatHeader("Writeup Available"),
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: renderCheckCell,
  },
];

// Main Component
const NewDealsUpcomingRecent: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOp, setSelectedOp] = useState("next 2 weeks");

  const fetchData = async (operation: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ operation }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      const formattedRows = result.data.map((item: any, index: number) => ({
        id: index,
        ...item,
      }));

      setRows(formattedRows);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedOp);
  }, [selectedOp]);

  const handleCheckboxChange = (value: string) => {
    if (value !== selectedOp) {
      setSelectedOp(value);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom align="center">
        New Deals - Upcoming & Recent
      </Typography>

      <Stack direction="row" spacing={4} justifyContent="center" sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedOp === "all upcoming"}
              onChange={() => handleCheckboxChange("all upcoming")}
            />
          }
          label="All Upcoming"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedOp === "next 2 weeks"}
              onChange={() => handleCheckboxChange("next 2 weeks")}
            />
          }
          label="Next 2 Weeks"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedOp === "all recent"}
              onChange={() => handleCheckboxChange("all recent")}
            />
          }
          label="All Recent"
        />
      </Stack>

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto" }} />
      ) : (
        <div style={{ height: 600, width: "100%", overflow: "auto" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight={false}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-container--top [role='row']": {
                backgroundColor: "#002060",
                color: "#FFFFFF",
              },
            }}
          />
        </div>
      )}
    </Container>
  );
};

export default NewDealsUpcomingRecent;
