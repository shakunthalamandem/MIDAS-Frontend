import React, { useState, useMemo } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { Container, Box, Tooltip, Typography } from "@mui/material";

// ✅ Helper: Format header
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

// ✅ Helper: Render check/cross
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

// ✅ Helper: Date formatter
const formatDateCell = (params: GridRenderCellParams<any>) => {
  if (!params.value) return "To Be Announced";
  const date = new Date(params.value);
  if (isNaN(date.getTime())) return "To Be Announced";

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const getDaySuffix = (d: number) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${day}${getDaySuffix(day)} ${month} ${year}`;
};

// ✅ Deal Status Circle Renderer
const statusConfig: Record<string, { color: string; label: string }> = {
  Announced: { color: "#002060", label: "A" }, // Dark Blue
  Priced: { color: "orange", label: "P" },
  Issued: { color: "green", label: "I" },
};

const renderDealStatsCell = (params: GridRenderCellParams<any>) => {
  const value = params.value; // "Announced" | "Priced" | "Issued"
  const config = statusConfig[value as keyof typeof statusConfig];

  if (!config) {
    // ❌ Empty → red ✘
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 0.5,
        }}
      >
        <span style={{ color: "red", fontWeight: "bold" }}>✘</span>

      </Box>
    );
  }

  // ✅ Valid → green ✔ before circle
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 0.5,
      }}
    >
      <span style={{ color: "green", fontWeight: "bold" }}>✔</span>
      <Tooltip title={value}>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: config.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "10px",
          }}
        >
          {config.label}
        </Box>
      </Tooltip>
    </Box>
  );
};

interface DealsTableProps {
  rows: any[];
  loading: boolean;
  onRowSelect: (row: any) => void;
  selectedOp: string; // <-- new prop from DealsFilters
}

const DealsTable: React.FC<DealsTableProps> = ({
  rows,
  loading,
  onRowSelect,
  selectedOp,
}) => {
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

  // ✅ Dynamic date column (based on filter)
  const dateColumn: GridColDef = useMemo(() => {
    if (selectedOp === "Last 1 Month") {
      return {
        field: "pricing_date",
        headerName: "Pricing Date",
        renderHeader: () => formatHeader("Pricing Date"),
        flex: 1.5,
        headerAlign: "center",
        align: "center",
        renderCell: formatDateCell,
      };
    }
    return {
      field: "expected_listing_date",
      headerName: "Expected Listing Date",
      renderHeader: () => formatHeader("Expected Listing Date"),
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: formatDateCell,
    };
  }, [selectedOp]);

  const columns: GridColDef[] = [
    {
      field: "ticker",
      headerName: "Ticker",
      renderHeader: () => formatHeader("Ticker"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
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
    { field: "region", headerName: "Region", renderHeader: () => formatHeader("Region"), flex: 0.75, headerAlign: "center", align: "center" },
    { field: "sector", headerName: "Sector", renderHeader: () => formatHeader("Sector"), flex: 1.25, headerAlign: "left", align: "left" },
    { field: "issuer_name", headerName: "Issuer Name", renderHeader: () => formatHeader("Issuer Name"), flex: 2, headerAlign: "left", align: "left" },

    // ✅ Insert dynamic date column
    dateColumn,

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
      renderCell: (params) => {
        const minRaw = params.row.pricing_range_min;
        const maxRaw = params.row.pricing_range_max;
        if (!minRaw || !maxRaw) return "TBD";
        const min = Number(minRaw);
        const max = Number(maxRaw);
        return !isNaN(min) && !isNaN(max)
          ? `$${min.toFixed(0)} - $${max.toFixed(0)}`
          : "TBD";
      },
    },
    {
      field: "writeup_available",
      headerName: "Writeup Available",
      renderHeader: () => formatHeader("Writeup Available"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) =>
        params.value?.toString().toLowerCase() === "yes" ? (
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
        ) : (
          <span style={{ color: "red" }}>✘</span>
        ),
    },
    {
      field: "deal_stats",
      headerName: "Deal Status",
      renderHeader: () => formatHeader("Deal Status"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: renderDealStatsCell,
    },
    {
      field: "t1d_pred",
      headerName: "AI-ML Prediction",
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
      renderCell: (params) => {
        const ticker = params.row.ticker;
        const pricingDate = params.row.pricing_date;
        const handleTrackHereClick = () => {
          if (ticker) {
            const cleanPricingDate =
              pricingDate === '""' || !pricingDate ? '""' : pricingDate;
            const url = `/deals/dashboard/Tracking?ticker=${ticker}&pricing_date=${cleanPricingDate}`;
            window.open(url, "_blank");
          }
        };
        return (
          <span
            onClick={handleTrackHereClick}
            style={{
              cursor: "pointer",
              color: "#0066cc",
              textDecoration: "underline",
            }}
          >
            Track
          </span>
        );
      },
    },
  ];

  const handleRowClick = (params: any) => {
    setSelectedId(params.id);
    onRowSelect(params.row);
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

    {/* Legend / Note */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        mt: 2,
        ml: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "#002060",
          }}
        />
        <Typography variant="body2" color="text.secondary">
          A - Announced
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "orange",
          }}
        />
        <Typography variant="body2" color="text.secondary">
          P - Priced
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "green",
          }}
        />
        <Typography variant="body2" color="text.secondary">
          I - Issued
        </Typography>
      </Box>
    </Box>
  </Container>
);

  
};

export default DealsTable;
