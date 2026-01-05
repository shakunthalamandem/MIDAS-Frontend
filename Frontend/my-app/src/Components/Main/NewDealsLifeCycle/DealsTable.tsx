import React, { useEffect,useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Container } from "@mui/material";
import Legend from "./DealTableData/Legend";
import { getColumns } from "./DealTableData/columns";


interface DealsTableProps {
  rows: any[];
  loading: boolean;
  onRowSelect: (row: any) => void;
  selectedOp: string;
}

const DealsTable: React.FC<DealsTableProps> = ({
  rows,
  loading,
  onRowSelect,
  selectedOp,
}) => {
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

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

    onRowSelect({
      ticker,
      deal_type,
      region,
      fo_type,
      sector,
    });

  };


  const columns = getColumns(selectedOp, selectedId);

  return (
    <Container maxWidth={false} sx={{ mt: 2, mb: 4, px: 0 }}>
      <div style={{ width: "100%", height: 450, maxHeight: "450px" }}>
        <DataGrid
          rows={rows}
          columns={columns}
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
