import React, { useEffect, useState } from "react";
import { Container, Typography, Box } from "@mui/material";
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
}

const FOWriteUpDashboardMain: React.FC = () => {
  const [rows, setRows] = useState<FOData[]>([]);
  const [selected, setSelected] = useState<{ ticker: string; deal_id: string } | null>(null);

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

        const json = await response.json();
        setRows(json);
      } catch (err) {
        console.error("Error fetching FO data:", err);
      }
    };

    fetchData();
  }, [apiUrl, token]);

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
        <span style={{ color: "red", textDecoration: "underline", fontWeight: 600 }}>
          {params.value}
        </span>
      ),
    },
    { field: "issuer_name", headerName: "Company", flex: 1 },
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
    { field: "exchange", headerName: "Exchange", flex: 1 },
    {
      field: "deal_size",
      headerName: "Deal Size",
      flex: 1,
      valueFormatter: (params) => (params !== null ? params : "—"),
    },
  ];

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h6"
        fontWeight="bold"
        textAlign="center"
        color="#002060"
        mb={2}
      >
        📅 All Upcoming Follow-On Offers
      </Typography>

      <Box sx={{ maxHeight: 500, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.deal_id}
          pageSizeOptions={[5, 10, 20]}
          rowHeight={40}
          disableRowSelectionOnClick
          onRowClick={(params) =>
            setSelected({ ticker: params.row.ticker, deal_id: params.row.deal_id })
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
      </Box>

      {selected && (
        <Box mt={4}>
          <FOSectionsMain ticker={selected.ticker} deal_id={selected.deal_id} />
        </Box>
      )}
    </Container>
  );
};

export default FOWriteUpDashboardMain;
