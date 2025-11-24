import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DealDetailsPanel from "./DealDetailsPanel";
import PredictionCell from "./PredictionCell";

export interface DealRecord {
  ticker: string;
  issuer_name: string;
  deal_type: string;
  fo_type: string;
  pricing_date: string;
  region: string;
  sector: string;
  deal_size: number | string;
  issue_price: number | string;
  discount_from_announcement_price: number | string;
  allocation_as_percentage_of_deal_size: number | string;
  allocation_as_percentage_of_ioi: number | string;
  t1d_pred: string;
  t1d_confidence: number | string;
  t1d_actual_return: number | string;
  t1d_openprice_pred: string;
  t1d_openprice_confidence: number | string;
  t1d_openprice_actual_return: number | string;
  t1w_pred: string;
  t1w_confidence: number | string;
  t1w_actual_return: number | string;
  t1m_pred: string;
  t1m_confidence: number | string;
  t1m_actual_return: number | string;
}

type Align = "left" | "center" | "right";

interface ColumnConfig {
  key: string;
  label: string;
  align?: Align;
  width?: number;
  render?: (row: DealRecord) => React.ReactNode;
}

const TABLE_COLUMNS: ColumnConfig[] = [
  { key: "ticker", label: "Ticker", align: "left", width: 90 },
  { key: "pricing_date", label: "Pricing Date", align: "center", width: 110 },
  { key: "issuer_name", label: "Issuer", align: "left", width: 220 },
  { key: "sector", label: "Sector", align: "left", width: 180 },
  {
    key: "t1d_close",
    label: "1st Day Close from Issue Price",
    align: "center",
    width: 130,
    render: (row) => (
      <PredictionCell pred={row.t1d_pred} confidence={row.t1d_confidence} />
    ),
  },
  {
    key: "t1d_open",
    label: "1st Day Close from Open Price",
    align: "center",
    width: 160,
    render: (row) => (
      <PredictionCell
        pred={row.t1d_openprice_pred}
        confidence={row.t1d_openprice_confidence}
      />
    ),
  },
  {
    key: "t1w",
    label: "1 Week from 1st Day Close",
    align: "center",
    width: 120,
    render: (row) => (
      <PredictionCell pred={row.t1w_pred} confidence={row.t1w_confidence} />
    ),
  },
  {
    key: "t1m",
    label: "1 Month from 1st Day Close",
    align: "center",
    width: 120,
    render: (row) => (
      <PredictionCell pred={row.t1m_pred} confidence={row.t1m_confidence} />
    ),
  },
];

/* ---------- Main component ---------- */

const DealsPredictionsTable: React.FC = () => {
  const [data, setData] = useState<DealRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<DealRecord | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiUrl}/api/ai_ml_results/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json = await res.json();
        setData(json || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch deals");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [apiUrl, token]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => row.ticker.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <Box>
      {/* Header + search */}
      <Box
        mb={2}
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            IPO & FO Deals – Prediction Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quick view of key deals with model predictions. Click a row to see
            the full breakdown below.
          </Typography>
        </Box>

        <TextField
          size="small"
          label="Search by ticker"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && filteredData.length === 0 && (
        <Alert severity="info">No deals found for the selected criteria.</Alert>
      )}

      {!loading && !error && filteredData.length > 0 && (
        <>
          {/* Table */}
          <Paper elevation={1}>
            <TableContainer
              sx={{
                maxHeight: 420,
                overflowX: "auto",
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {TABLE_COLUMNS.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align || "center"}
                        sx={{
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          width: col.width,
                          maxWidth: col.width,
                          minWidth: col.width,
                          backgroundColor: (theme) => theme.palette.grey[100],
                        }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row, idx) => {
                    const isSelected =
                      selectedDeal?.ticker === row.ticker &&
                      selectedDeal?.pricing_date === row.pricing_date;
                    return (
                      <TableRow
                        key={`${row.ticker}-${idx}`}
                        hover
                        onClick={() => setSelectedDeal(row)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor: (theme) =>
                            isSelected
                              ? theme.palette.action.selected
                              : "inherit",
                        }}
                      >
                        {TABLE_COLUMNS.map((col) => {
                          const value = col.render
                            ? col.render(row)
                            : (row as any)[col.key];

                          return (
                            <TableCell
                              key={col.key}
                              align={col.align || "center"}
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Details panel */}
          <Box mt={2}>
            <DealDetailsPanel deal={selectedDeal} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default DealsPredictionsTable;
