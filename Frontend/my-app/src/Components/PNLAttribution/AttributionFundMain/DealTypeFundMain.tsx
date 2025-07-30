import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import { Deal, dealGridColumns } from "../types";

interface DealTypeFundMainProps {
  fund: string;
  onMaxTradeDateChange?: (date: string | null) => void;
}

const CustomNoRowsOverlay: React.FC<{ message: string }> = ({ message }) => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      py: 3,
      color: "text.secondary",
      fontSize: "0.85rem",
    }}
  >
    {message}
  </Box>
);

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  return `${day}${getOrdinal(day)} ${month} ${year}`;
};

// 🔧 Filter columns based on deal type
const getFilteredColumns = (type: "IPO" | "FO"): GridColDef[] => {
  if (type === "IPO") {
    return dealGridColumns.filter(
      (col) =>
        col.field !== "fo_type" &&
        col.field !== "discount_from_announcement_price"
    );
  } else {
    return dealGridColumns.filter(
      (col) => col.field !== "initial_pricing_range"
    );
  }
};

const DealTypeFundMain: React.FC<DealTypeFundMainProps> = ({
  fund,
  onMaxTradeDateChange,
}) => {
  const [ipoDeals, setIpoDeals] = useState<Deal[]>([]);
  const [foDeals, setFoDeals] = useState<Deal[]>([]);
  const [maxTradeDate, setMaxTradeDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/fundwise_deal_types/`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fund }),
        });

        const data = await res.json();
        setIpoDeals(data.IPODeals || []);
        setFoDeals(data.FODeals || []);
        setMaxTradeDate(data.max_trade_date || null);

        if (onMaxTradeDateChange) {
          onMaxTradeDateChange(data.max_trade_date || null);
        }
      } catch (err) {
        console.error("Failed to fetch deals", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund]);

  const renderTable = (
    rows: Deal[],
    title: string,
    id: string,
    emptyMessage: string,
    type: "IPO" | "FO"
  ) => (
    <Box my={4} id={id}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box textAlign="center" mb={2}>
          <Typography
            variant="h6"
            sx={{
              background: "linear-gradient(to right, #cfd9ff, #a1c4fd)",
              px: 3,
              py: 1,
              color: "#002060",
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "1rem",
              display: "inline-block",
            }}
          >
            {title}
          </Typography>
        </Box>
      </motion.div>

      <Divider sx={{ mb: 2 }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
      <Box
  sx={{
    width: "100%",
    overflowX: "auto",
    backgroundColor: "#ffffff",
    borderRadius: 2,
    boxShadow: 3,
    "& .MuiDataGrid-root": {
      border: "none",
      fontSize: "0.72rem",
    },
    "& .MuiDataGrid-container--top": {
      backgroundColor: "#002060",
      color: "#940000ff",
      fontWeight: 600,
    },
    "& .MuiDataGrid-columnHeaders": {
      background: "#002060",
      color: "#ffffff",
      fontWeight: 600,
      fontSize: "0.72rem",
      lineHeight: 1.2,
      minHeight: "36px !important",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#ffffff",
      whiteSpace: "normal",
      lineHeight: "1.1rem",
      fontSize: "0.72rem",
      textAlign: "center",
      padding: "0 4px",
    },
    "& .MuiDataGrid-cell": {
      whiteSpace: "normal",
      wordWrap: "break-word",
      lineHeight: 1.4,
      fontSize: "0.75rem",
      padding: "6px 8px",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiDataGrid-row": {
      minHeight: "42px !important",
    },
    "& .MuiDataGrid-row:nth-of-type(even)": {
      backgroundColor: "#f5f8fc",
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: "#dee7f7",
      transition: "background-color 0.3s ease",
    },
  }}
>


<DataGrid
  rows={rows.map((row, index) => ({ id: index, ...row }))}
  columns={getFilteredColumns(type)}
  autoHeight
  disableRowSelectionOnClick
  disableColumnMenu
  hideFooterPagination
  hideFooter
  getRowHeight={() => "auto"}
  slots={{
    noRowsOverlay: () => (
      <CustomNoRowsOverlay message={emptyMessage} />
    ),
  }}
  sx={{
    border: "none",
    fontSize: "0.72rem",
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#002060",   // ✅ Header background
      color: "#ffffff",             // ✅ Header text color
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#ffffff",             // ✅ Ensure header title is white
    },
    "& .MuiDataGrid-columnHeader": {
      backgroundColor: "#002060",   // ✅ Header cell background
    },
    "& .MuiDataGrid-cell": {
      whiteSpace: "normal",
      wordWrap: "break-word",
      lineHeight: 1.4,
      fontSize: "0.75rem",
      padding: "6px 8px",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiDataGrid-row": {
      minHeight: "42px !important",
    },
    "& .MuiDataGrid-row:nth-of-type(even)": {
      backgroundColor: "#f5f8fc",
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: "#dee7f7",
      transition: "background-color 0.3s ease",
    },
  }}
/>

        </Box>
      </motion.div>
    </Box>
  );

  return (
    <Box width="100%" px={1}>
      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {renderTable(
            ipoDeals,
            "IPOs (New Issues or Incremental AM Participation Deals)",
            "ipo",
            maxTradeDate
              ? `No IPO deals available for this fund on ${formatDate(maxTradeDate)}.`
              : "No IPO deals available.",
            "IPO"
          )}

          {renderTable(
            foDeals,
            "FOs (New Issues or Incremental AM Participation Deals)",
            "fo",
            maxTradeDate
              ? `No FO deals available for this fund on ${formatDate(maxTradeDate)}.`
              : "No FO deals available.",
            "FO"
          )}
        </>
      )}
    </Box>
  );
};

export default DealTypeFundMain;
