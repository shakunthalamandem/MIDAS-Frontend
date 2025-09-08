import React, { useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Container, Grid, Button } from "@mui/material";
import AIMLModelPredictionInfo from "./DealsCyclesSections/AIMLModelPredictionInfo";
import DealColorInfo from "./DealsCyclesSections/DealColorInfo";
import DealWriteUpInfo from "./DealsCyclesSections/DealWriteUpInfo";
import { Link } from "react-router-dom";

// Helper: Format header
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

// Helper: Render check/cross
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

// Date formatter
// Date formatter
const formatDateCell = (params: GridRenderCellParams<any>) => {
  if (!params.value) return "To Be Announced"; // ✅ If empty, show TBA
  const date = new Date(params.value);
  if (isNaN(date.getTime())) return "To Be Announced"; // ✅ If invalid date, show TBA

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const getDaySuffix = (d: number) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getDaySuffix(day)} ${month} ${year}`;
};

interface DealsTableProps {
  rows: any[];
  loading: boolean;
  onRowSelect: (row: any) => void;
}

const DealsTable: React.FC<DealsTableProps> = ({
  rows,
  loading,
  onRowSelect,
}) => {
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

  const columns: GridColDef[] = [
    {
      field: "ticker",
      headerName: "Ticker",
      renderHeader: () => formatHeader("Ticker"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params: GridRenderCellParams<any>) => (
        <span
          style={{
            color: "#96000A",
            textDecoration: selectedId === params.row.id ? "underline" : "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "region",
      headerName: "Region",
      renderHeader: () => formatHeader("Region"),
      flex: 0.75,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "sector",
      headerName: "Sector",
      renderHeader: () => formatHeader("Sector"),
      flex: 1.25,
      headerAlign: "left",
      align: "left",
    },

    {
      field: "issuer_name",
      headerName: "Issuer Name",
      renderHeader: () => formatHeader("Issuer Name"),
      flex: 2,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "expected_listing_date",
      headerName: "Expected Listing Date",
      renderHeader: () => formatHeader("Expected Listing Date"),
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: formatDateCell,
    },
    // {
    //   field: "pricing_date",
    //   headerName: "Pricing Date",
    //   renderHeader: () => formatHeader("Pricing Date"),
    //   flex: 1,
    //   headerAlign: "center",
    //   align: "center",
    //   renderCell: formatDateCell,
    // },
    {
      field: "deal_type",
      headerName: "Deal Type",
      renderHeader: () => formatHeader("Deal Type"),
      flex: 0.75,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "price_range",
      headerName: "Price Range",
      renderHeader: () => formatHeader("Price Range"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params: GridRenderCellParams<any>) => {
        const minRaw = params.row.pricing_range_min;
        const maxRaw = params.row.pricing_range_max;

        // ✅ If either value is null, undefined, or an empty string → show TBD
        if (!minRaw || !maxRaw) {
          return "TBD";
        }

        const min = Number(minRaw);
        const max = Number(maxRaw);

        if (!isNaN(min) && !isNaN(max)) {
          return `$${min.toFixed(0)} - $${max.toFixed(0)}`;
        }

        return "TBD";
      },
    },
    // {
    //   field: "allocation_as_percentage_of_deal_size",
    //   headerName: "Allocation %",
    //   renderHeader: () => formatHeader("Allocation %"),
    //   flex: 1,
    //   headerAlign: "center",
    //   align: "center",
    //   renderCell: renderCheckCell,
    // },
    // {
    //   field: "deal_color",
    //   headerName: "Deal Color",
    //   renderHeader: () => formatHeader("Deal Color"),
    //   flex: 1,
    //   headerAlign: "center",
    //   align: "center",
    //   renderCell: renderCheckCell,
    // },
      {
      field: "writeup_available",
      headerName: "Writeup Available",
      renderHeader: () => formatHeader("Writeup Available"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params: GridRenderCellParams<any>) => {
        if (params.value?.toString().toLowerCase() === "yes") {
          return (
            <Link
              to={`/ipo-dashboard/${params.row.ticker}`}
              style={{
                color: "#002060",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              <span style={{ color: "green" }}>✔</span>{" "}
              <span style={{ textDecoration: "underline" }}>View</span>
            </Link>
          );
        }
        return <span style={{ color: "red" }}>✘</span>;
      },
    },
    {
      field: "t1d_pred",
      headerName: "AIML Prediction",
      renderHeader: () => formatHeader("AI-ML Prediction"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: renderCheckCell,
    },
  
    {
      field: "track_here",
      headerName: "Track",
      renderHeader: () => formatHeader("Track"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params: GridRenderCellParams<any>) => {
        const ticker = params.row.ticker;
        const pricingDate = params.row.pricing_date;

        // Handle click
        const handleTrackHereClick = () => {
          if (ticker && pricingDate) {
            const url = `/deals/dashboard/Tracking?ticker=${ticker}&pricing_date=${pricingDate}`;
            // Open the URL in a new tab
            window.open(url, "_blank");
          }
        };

        return (
          <span
            onClick={handleTrackHereClick} // Navigate to the tracking page in a new tab
            style={{
              cursor: "pointer",
              color: "#0066cc",
              textDecoration: "underline", // Optional: Make it look like a link
            }}
          >
            Track
          </span>
        );
      },
    },
  ];

  const handleRowClick = (params: any) => {
    setSelectedId(params.id); // Update selected ID
    onRowSelect(params.row); // Pass the selected row data
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <div style={{ width: "100%", height: 450, maxHeight: "450px" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          checkboxSelection={false}
          onRowClick={handleRowClick}
          rowHeight={35}
          getRowClassName={(params) =>
            selectedId === params.id ? "Mui-selected" : ""
          }
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
      </div>
    </Container>
  );
};

export default DealsTable;
