import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import { Deal, dealGridColumns } from "../types"; // adjust as per your folder structure

interface DealTypeFundMainProps {
  fund: string;
}

const DealTypeFundMain: React.FC<DealTypeFundMainProps> = ({ fund }) => {
  const [ipoDeals, setIpoDeals] = useState<Deal[]>([]);
  const [foDeals, setFoDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/fund-trades-deals/`, {
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
      } catch (err) {
        console.error("Failed to fetch deals", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund]);

  const renderTable = (rows: Deal[], title: string, id: string) => (
    <Box my={4} id={id} width="100%">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            background: "linear-gradient(to right, #cfd9ff, #a1c4fd)",
            px: 2,
            py: 0.5,
            color: "#002060",
            borderRadius: 1,
            fontWeight: 500,
            fontSize: "0.85rem",
            display: "inline-block",
            mb: 1,
          }}
        >
          {title}
        </Typography>
      </motion.div>

      <Divider sx={{ mb: 2 }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Box
          sx={{
            width: "100%",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 3,
            backgroundColor: "#ffffff",

            "& .MuiDataGrid-root": {
              border: "none",
              fontSize: "0.72rem",
            },

            // Gradient header
            "& .MuiDataGrid-columnHeaders": {
              background: "linear-gradient(to right, #77B0FC, #dbe9ff)",
              color: "#002060",
              fontWeight: 600,
              fontSize: "0.72rem",
              lineHeight: 1.2,
              minHeight: "36px !important",
              maxHeight: "36px !important",
            },

            // Make header text wrap if long
            "& .MuiDataGrid-columnHeaderTitle": {
              whiteSpace: "normal",
              lineHeight: "1.1rem",
              fontSize: "0.72rem",
              textAlign: "center",
              padding: "0 4px",
            },

            // Style for rows/cells
            "& .MuiDataGrid-cell": {
              whiteSpace: "normal",
              wordWrap: "break-word",
              lineHeight: 1.2,
              fontSize: "0.7rem",
              // padding: "4px 6px",
              display: "flex",
              alignItems: "center",   // ✅ Vertically center cell content
            },

            "& .MuiDataGrid-row": {
              minHeight: "38px !important",
              maxHeight: "38px !important",
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
            columns={dealGridColumns}
            autoHeight
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooterPagination
          />
        </Box>
      </motion.div>
    </Box>
  );

  return (
<Box width="100%" px={0} mx={0}>
      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {ipoDeals.length > 0 &&
            renderTable(
              ipoDeals,
              "IPOs (New Issues or Incremental AM Participation Deals)",
              "ipo"
            )}
          {foDeals.length > 0 &&
            renderTable(
              foDeals,
              "FOs (New Issues or Incremental AM Participation Deals)",
              "fo"
            )}
          {ipoDeals.length === 0 && foDeals.length === 0 && (
            <Typography align="center" color="textSecondary" mt={4}>
              No deal data available for this fund.
            </Typography>
          )}
        </>
      )}
</Box>
  );
};

export default DealTypeFundMain;
