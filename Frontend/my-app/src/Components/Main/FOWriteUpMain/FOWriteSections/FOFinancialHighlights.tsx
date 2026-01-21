import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Container,
  Grid,
  styled,
  CardContent,
  Card,
  IconButton,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

interface ChildProps {
  ticker: string;
  deal_id: string;
}

interface FinancialHighlights {
  total_revenue_current_year: number | null;
  total_revenue_previous_year: number | null;
  total_revenue_yoy_change: number | null;
  gross_profit_current_year: number | null;
  gross_profit_previous_year: number | null;
  gross_profit_yoy_change: number | null;
  operating_income_current_year: number | null;
  operating_income_previous_year: number | null;
  operating_income_yoy_change: number | null;
  net_income_current_year: number | null;
  net_income_previous_year: number | null;
  net_income_yoy_change: number | null;
}

interface ApiResponse {
  financial_highlights: FinancialHighlights;
}

// Styled TableCell for white text in TableHead
const StyledTableCell = styled(TableCell)({
  color: "#FFFFFF",
  fontWeight: "bold",
});

const FOFinancialHighlights: React.FC<ChildProps> = ({ ticker, deal_id }) => {
  const [selectedData, setSelectedData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<keyof FinancialHighlights, string> | null>(
    null,
  );

  const toDraft = (data: FinancialHighlights) => ({
    total_revenue_current_year: data.total_revenue_current_year?.toString() ?? "",
    total_revenue_previous_year: data.total_revenue_previous_year?.toString() ?? "",
    total_revenue_yoy_change: data.total_revenue_yoy_change?.toString() ?? "",
    gross_profit_current_year: data.gross_profit_current_year?.toString() ?? "",
    gross_profit_previous_year: data.gross_profit_previous_year?.toString() ?? "",
    gross_profit_yoy_change: data.gross_profit_yoy_change?.toString() ?? "",
    operating_income_current_year: data.operating_income_current_year?.toString() ?? "",
    operating_income_previous_year: data.operating_income_previous_year?.toString() ?? "",
    operating_income_yoy_change: data.operating_income_yoy_change?.toString() ?? "",
    net_income_current_year: data.net_income_current_year?.toString() ?? "",
    net_income_previous_year: data.net_income_previous_year?.toString() ?? "",
    net_income_yoy_change: data.net_income_yoy_change?.toString() ?? "",
  });

  const parseNumberInput = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker, deal_id }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();
        setSelectedData(result);
        if (!editMode && result?.financial_highlights) {
          setDraft(toDraft(result.financial_highlights));
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, deal_id]);

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    const payloadHighlights: FinancialHighlights = {
      total_revenue_current_year: parseNumberInput(draft.total_revenue_current_year),
      total_revenue_previous_year: parseNumberInput(draft.total_revenue_previous_year),
      total_revenue_yoy_change: parseNumberInput(draft.total_revenue_yoy_change),
      gross_profit_current_year: parseNumberInput(draft.gross_profit_current_year),
      gross_profit_previous_year: parseNumberInput(draft.gross_profit_previous_year),
      gross_profit_yoy_change: parseNumberInput(draft.gross_profit_yoy_change),
      operating_income_current_year: parseNumberInput(draft.operating_income_current_year),
      operating_income_previous_year: parseNumberInput(
        draft.operating_income_previous_year,
      ),
      operating_income_yoy_change: parseNumberInput(draft.operating_income_yoy_change),
      net_income_current_year: parseNumberInput(draft.net_income_current_year),
      net_income_previous_year: parseNumberInput(draft.net_income_previous_year),
      net_income_yoy_change: parseNumberInput(draft.net_income_yoy_change),
    };

    try {
      const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker,
          deal_id,
          financial_highlights: payloadHighlights,
        }),
      });

      if (response.ok) {
        setSelectedData((prev) =>
          prev ? { ...prev, financial_highlights: payloadHighlights } : prev,
        );
        setEditMode(false);
      } else {
        console.error("Failed to update financial highlights");
      }
    } catch (err) {
      console.error("Error updating financial highlights:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      handleSave();
    } else if (selectedData?.financial_highlights) {
      setDraft(toDraft(selectedData.financial_highlights));
      setEditMode(true);
    }
  };

  const handleDraftChange = (
    key: keyof FinancialHighlights,
    value: string,
  ) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const renderTable = () => {
    if (!selectedData?.financial_highlights) return null;

    const highlights = selectedData.financial_highlights;
    const tickerUpper = ticker?.toUpperCase();
    const isSpecialTicker = ["PRAX", "CRNX", "ALMS", "CRVS US"].includes(tickerUpper || "");
    const priorPeriodLabel = isSpecialTicker
      ? "Nine months ended September 30, 2024 ($)"
      : "2024 ($)";
    const currentPeriodLabel = isSpecialTicker
      ? "Nine months ended September 30, 2025 ($)"
      : "2025 ($)";

    const rows: Array<{
      label: string;
      currentKey: keyof FinancialHighlights;
      previousKey: keyof FinancialHighlights;
      yoyKey: keyof FinancialHighlights;
    }> = [
      {
        label: "Total Revenue",
        currentKey: "total_revenue_current_year",
        previousKey: "total_revenue_previous_year",
        yoyKey: "total_revenue_yoy_change",
      },
      {
        label: "Gross Profit",
        currentKey: "gross_profit_current_year",
        previousKey: "gross_profit_previous_year",
        yoyKey: "gross_profit_yoy_change",
      },
      {
        label: "Operating Income",
        currentKey: "operating_income_current_year",
        previousKey: "operating_income_previous_year",
        yoyKey: "operating_income_yoy_change",
      },
      {
        label: "Net Income",
        currentKey: "net_income_current_year",
        previousKey: "net_income_previous_year",
        yoyKey: "net_income_yoy_change",
      },
    ];

    const formatValue = (value: number | null): string =>
      value !== null
        ? value < 0
          ? `- $${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
        : "N/A";

    const formatPercent = (value: number | null): string =>
      value !== null ? `${value.toFixed(2)}%` : "N/A";

    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table size="medium">
          {" "}
          {/* ↓ smaller height globally */}
          <TableHead sx={{ backgroundColor: "#002060" }}>
            <TableRow>
              <StyledTableCell>Metric</StyledTableCell>
              <StyledTableCell align="right">{priorPeriodLabel}</StyledTableCell>
              <StyledTableCell align="right">{currentPeriodLabel}</StyledTableCell>
              <StyledTableCell align="right">YoY Change (%)</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label} sx={{ fontSize: "1rem" }}>
                <TableCell>{row.label}</TableCell>
                <TableCell align="right">
                  {editMode ? (
                    <TextField
                      size="small"
                      value={draft?.[row.previousKey] ?? ""}
                      onChange={(e) => handleDraftChange(row.previousKey, e.target.value)}
                      disabled={saving}
                      variant="outlined"
                      inputProps={{ inputMode: "decimal" }}
                    />
                  ) : (
                    formatValue(highlights[row.previousKey])
                  )}
                </TableCell>
                <TableCell align="right">
                  {editMode ? (
                    <TextField
                      size="small"
                      value={draft?.[row.currentKey] ?? ""}
                      onChange={(e) => handleDraftChange(row.currentKey, e.target.value)}
                      disabled={saving}
                      variant="outlined"
                      inputProps={{ inputMode: "decimal" }}
                    />
                  ) : (
                    formatValue(highlights[row.currentKey])
                  )}
                </TableCell>
                <TableCell align="right">
                  {editMode ? (
                    <TextField
                      size="small"
                      value={draft?.[row.yoyKey] ?? ""}
                      onChange={(e) => handleDraftChange(row.yoyKey, e.target.value)}
                      disabled={saving}
                      variant="outlined"
                      inputProps={{ inputMode: "decimal" }}
                    />
                  ) : (
                    formatPercent(highlights[row.yoyKey])
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="xl">
      <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ background: "linear-gradient(#f0f5ff, #f0f5ff)" }}>
          <Grid container spacing={4} mb={4} mt={2}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#026269",
                    flex: 1,
                  }}
                >
                  Financial Highlights
                </Typography>
                <IconButton
                  onClick={handleEditToggle}
                  disabled={saving || loading}
                  sx={{ color: "#002060" }}
                  aria-label={editMode ? "save financial highlights" : "edit financial highlights"}
                >
                  {editMode ? <SaveIcon /> : <EditIcon />}
                </IconButton>
              </Box>

              {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              )}

              {!loading && !error && renderTable()}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FOFinancialHighlights;
