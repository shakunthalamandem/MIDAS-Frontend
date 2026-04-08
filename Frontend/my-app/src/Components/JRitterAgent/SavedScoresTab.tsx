import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import ScorecardView from "./ScorecardView";

interface SavedRecord {
  id: number;
  ticker: string;
  company_name: string;
  json_data: any;
  created_at: string;
}

const SavedScoresTab: React.FC = () => {
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [filterTicker, setFilterTicker] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const url = filterTicker
        ? `${apiUrl}/api/jritter_agent/list/?ticker=${filterTicker}`
        : `${apiUrl}/api/jritter_agent/list/`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();
      setRecords(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filterTicker]);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${apiUrl}/api/jritter_agent/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (selectedId === id) {
        setSelectedId("");
      }
    } catch {
      // ignore
    }
  };

  const selectedRecord = records.find((r) => r.id === selectedId);
  const uniqueTickers = Array.from(new Set(records.map((r) => r.ticker)));

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#005166" }} />
      </Box>
    );
  }

  if (records.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" sx={{ color: "#999" }}>
          No saved scores yet
        </Typography>
        <Typography variant="body2" sx={{ color: "#bbb", mt: 1 }}>
          Paste a Ritter IPO JSON in the first tab to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Controls row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center", flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Filter Ticker</InputLabel>
          <Select
            value={filterTicker}
            label="Filter Ticker"
            onChange={(e) => {
              setFilterTicker(e.target.value);
              setSelectedId("");
            }}
          >
            <MenuItem value="">All</MenuItem>
            {uniqueTickers.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tooltip title="Refresh">
          <IconButton onClick={fetchRecords} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <Typography variant="body2" sx={{ color: "#888" }}>
          {records.length} record{records.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left: record list */}
        <Grid item xs={12} md={3}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {records.map((rec) => (
              <Card
                key={rec.id}
                onClick={() => setSelectedId(rec.id)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 2,
                  border:
                    selectedId === rec.id
                      ? "2px solid #005166"
                      : "2px solid transparent",
                  boxShadow:
                    selectedId === rec.id
                      ? "0 2px 8px rgba(0,81,102,0.15)"
                      : "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "all 0.15s",
                  "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#1a2d4a" }}
                      >
                        {rec.ticker}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#888", display: "block" }}
                      >
                        {rec.company_name || "—"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        {new Date(rec.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      {rec.json_data?.ritter_scores?.composite_score !== undefined && (
                        <Chip
                          label={`${rec.json_data.ritter_scores.composite_score}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor: getScoreColor(
                              rec.json_data.ritter_scores.composite_score
                            ),
                            color: "#fff",
                            mb: 0.5,
                          }}
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(rec.id);
                        }}
                        sx={{ color: "#ccc", "&:hover": { color: "#e53935" } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Right: scorecard */}
        <Grid item xs={12} md={9}>
          {selectedRecord ? (
            <ScorecardView data={selectedRecord.json_data} />
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" sx={{ color: "#999" }}>
                Select a record to view the scorecard
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

function getScoreColor(score: number): string {
  if (score >= 75) return "#2e7d32";
  if (score >= 55) return "#ed6c02";
  return "#d32f2f";
}

export default SavedScoresTab;
