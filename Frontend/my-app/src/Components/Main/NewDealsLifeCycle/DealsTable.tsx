import React, { useState } from "react";
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
  
const handleRowClick = (params: any) => {
  setSelectedId(params.id);

  const { ticker, deal_type, region, fo_type } = params.row;

  onRowSelect({
    ticker,
    deal_type,
    region,
    fo_type,
  });
};


  const columns = getColumns(selectedOp, selectedId);

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

      {/* Legend */}
      <Legend />
    </Container>
  );
};

export default DealsTable;
