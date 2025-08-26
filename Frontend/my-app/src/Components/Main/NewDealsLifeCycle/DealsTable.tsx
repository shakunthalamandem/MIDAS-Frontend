import React from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";


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


const formatDateCell = (params: GridRenderCellParams<any>) => {
  if (!params.value) return "";
  const date = new Date(params.value);
  if (isNaN(date.getTime())) return params.value;

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  // Add suffix (st, nd, rd, th)
  const getDaySuffix = (d: number) => {
    if (d > 3 && d < 21) return "th"; // catch 11th–19th
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${day}${getDaySuffix(day)} ${month} ${year}`;
};

// Define columns
const getColumns = (): GridColDef[] => [
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
    renderCell: formatDateCell, 
  },
  {
    field: "pricing_date",
    headerName: "Pricing Date",
    renderHeader: () => formatHeader("Pricing Date"),
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: formatDateCell, 
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
  field: "price_range",
  headerName: "Price Range",
  renderHeader: () => formatHeader("Price Range"),
  flex: 1,
  headerAlign: "center",
  align: "center",
  valueGetter: (params: any) => {
    if (!params || !params.row) return "-"; 
    const min = params.row.pricing_range_min;
    const max = params.row.pricing_range_max;

    if (typeof min === "number" && typeof max === "number") {
      return `${min.toFixed(2)}-${max.toFixed(2)}`;
    }
    return "-";
  },
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

interface DealsTableProps {
  rows: any[];
  loading: boolean;
  onRowSelect: (row: any) => void;
}

const DealsTable: React.FC<DealsTableProps> = ({ rows, loading, onRowSelect }) => {
  const columns = getColumns();

  const handleRowSelection = (selection: GridRowSelectionModel) => {
    const selectedId = selection[0];
    const selectedRow = rows.find((row) => row.id === selectedId);
    if (selectedRow) onRowSelect(selectedRow);
  };

  return (
    <div style={{ maxHeight: 600, width: "100%", overflow: "auto" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight={false}
        checkboxSelection={true}
        onRowSelectionModelChange={handleRowSelection}
        sx={{
          "& .MuiDataGrid-container--top [role='row']": {
            backgroundColor: "#002060",
            color: "#FFFFFF",
          },
        }}
      />
    </div>
  );
};

export default DealsTable;
