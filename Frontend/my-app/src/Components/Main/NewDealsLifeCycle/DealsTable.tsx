import React, { useEffect,useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Container } from "@mui/material";
import Legend from "./DealTableData/Legend";
import { getColumns } from "./DealTableData/columns";


interface DealsTableProps {
  rows: any[];
  loading: boolean;
  onRowSelect: (row: any, rowId: number | string | null) => void;
  selectedOp: string;
  hideRegionColumn?: boolean;
  hidePricingDate?: boolean;
  showAllColumns?: boolean;
  selectedRowId?: number | string | null;
  onSelectedRowIdChange?: (rowId: number | string | null) => void;
}

const DealsTable: React.FC<DealsTableProps> = ({
  rows,
  loading,
  onRowSelect,
  selectedOp,
  hideRegionColumn = false,
  hidePricingDate = false,
  showAllColumns = false,
  selectedRowId,
  onSelectedRowIdChange,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<
    number | string | null
  >(null);
  const selectedId =
    selectedRowId !== undefined ? selectedRowId : internalSelectedId;
  const setSelectedId = (rowId: number | string | null) => {
    if (onSelectedRowIdChange) {
      onSelectedRowIdChange(rowId);
      return;
    }
    setInternalSelectedId(rowId);
  };

  // Clear selection if current rows no longer contain the selected id (e.g., after filtering)
  useEffect(() => {
    if (selectedId && !rows.some((row) => row.id === selectedId)) {
      setSelectedId(null);
    }
  }, [rows, selectedId]);

  // Ensure DataGrid never receives a selection model that points to a missing row
  const selectionModel =
    selectedId && rows.some((row) => row.id === selectedId) ? [selectedId] : [];

  const handleRowClick = (params: any) => {
    setSelectedId(params.id);

    const { ticker, deal_type, region, fo_type, sector } = params.row;

    onRowSelect(
      {
      ticker,
      deal_type,
      region,
      fo_type,
      sector,
    },
      params.id
    );

  };


  const columns = getColumns(selectedOp, selectedId);
  const visibleColumns = showAllColumns
    ? columns
    : columns.filter((col) => {
  // hide region column if needed
  if (hideRegionColumn && col.field === "region") return false;

  // hide First Trade Date for Upcoming
  if (selectedOp === "upcoming" && col.field === "trade_date") {
    return false;
  }

  if (
    selectedOp === "upcoming" &&
    (col.field === "deal_type" ||
      col.field === "fo_type" ||
      col.field === "deal_size" ||
      col.field === "price_range" ||
      col.field === "t1d_pred" ||
      col.field === "deal_status")
  ) {
    return false;
  }

  // hide Pricing Date for Live or when explicitly requested
  if ((selectedOp === "live" || hidePricingDate) && col.field === "pricing_date") {
    return false;
  }

  return true;
});


  return (
    <Container maxWidth={false} sx={{ mt: 2, mb: 4, px: 0 }}>
<div
  style={{
    width: "100%",
    height: rows.length > 6 ? 450 : "auto",
    maxHeight: rows.length > 6 ? 450 : "none",
    overflowY: rows.length > 6 ? "auto" : "hidden",
  }}
>
     <DataGrid
          rows={rows}
          columns={visibleColumns}
          loading={loading}
          checkboxSelection={false}
          onRowClick={handleRowClick}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(model) => setSelectedId(model[0] ?? null)}
          disableRowSelectionOnClick
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
            "& .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon": {
              color: "#FFFFFF",
            },
            cursor: "pointer",
            border: "1px solid #ccccccff",
          }}
        />

      </div>

      {/* Legend */}
      <Legend />
    </Container>
  );
};

export default DealsTable;
