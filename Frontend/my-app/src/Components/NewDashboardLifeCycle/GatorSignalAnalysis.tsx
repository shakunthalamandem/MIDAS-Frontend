import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Typography,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Grid,
  Collapse,
  IconButton,
  Alert,
} from "@mui/material";
import DashboardStateCard from "./DashboardStateCard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EventNoteIcon from "@mui/icons-material/EventNote";

type GatorSignalAnalysisProps = {
  ticker: string;
};

interface KeyCriteria {
  id: number;
  max: number;
  name: string;
  score: number;
  rating: string;
  signal: string;
  finding: string;
  ritter_reference: string;
}

interface CompositeScore {
  max: number;
  grade: string;
  score: number;
  summary: string;
}

interface Analysis {
  sector: string;
  ticker: string;
  company: string;
  concerns: string[];
  exchange: string;
  ipo_date: string;
  strengths: string[];
  disclaimer: string;
  methodology: string;
  key_criteria: KeyCriteria[];
  scored_as_of: string;
  final_verdict: string;
  ritter_caveat: string;
  days_since_ipo: number;
  composite_score: CompositeScore;
}

interface GatorSignalResponse {
  ticker: string;
  company_name: string;
  json_data: {
    analysis: Analysis;
  };
  updated_at: string;
  created_at: string;
}

const GatorSignalAnalysis: React.FC<GatorSignalAnalysisProps> = ({ ticker }) => {
  const [signal, setSignal] = useState<GatorSignalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCriteria, setExpandedCriteria] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchGatorSignal = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        const apiUrl = process.env.REACT_APP_API_URL ;

        const response = await fetch(`${apiUrl}/api/summary_signal_board/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data: GatorSignalResponse = await response.json();

        if (!cancelled) {
          setSignal(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch Gator Signal"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchGatorSignal();

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <DashboardStateCard
        variant="no-data"
        title="Data Not Available"
        message="Data is not available for this ticker. Will update soon."
        context={[{ label: "Ticker", value: ticker }]}
      />
    );
  }

  if (!signal) {
    return (
      <DashboardStateCard
        variant="no-data"
        title="No Data Available"
        message="Gator Signal data is not available for this ticker."
        context={[{ label: "Ticker", value: ticker }]}
      />
    );
  }

  const getGradeColor = (grade: string): "success" | "error" | "warning" => {
    if (grade === "A" || grade === "B") return "success";
    if (grade === "F" || grade === "D") return "error";
    return "warning";
  };

  const getRatingColor = (rating: string): "success" | "error" | "warning" => {
    if (rating === "strong" || rating === "good") return "success";
    if (rating === "concern" || rating === "weak") return "error";
    return "warning";
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const toggleCriteria = (id: number) => {
    setExpandedCriteria(expandedCriteria === id ? null : id);
  };

  const analysis = signal.json_data.analysis;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Composite Score Card */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          backgroundColor: "#fef3c7",
          borderLeft: "4px solid #f59e0b",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "#000",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    mb: 1,
                  }}
                >
                  Gator Composite Score
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: "#000",
                      fontWeight: 700,
                    }}
                  >
                    {analysis.composite_score.score}
                  </Typography>
                  <Chip
                    label={`Grade: ${analysis.composite_score.grade}`}
                    color={getGradeColor(analysis.composite_score.grade)}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body2"
                sx={{
                  color: "#374151",
                  lineHeight: 1.6,
                  fontSize: "0.9rem",
                }}
              >
                {analysis.composite_score.summary}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Final Verdict */}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: "#1e40af",
          }}
        >
          Final Verdict
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#374151",
            lineHeight: 1.6,
          }}
        >
          {analysis.final_verdict}
        </Typography>
      </Alert>

      {/* Header Card */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          backgroundColor: "#f8fafc",
          borderLeft: "4px solid #3b82f6",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "#666",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Company
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#000",
                    fontWeight: 700,
                  }}
                >
                  {signal.company_name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#666",
                    fontSize: "0.85rem",
                  }}
                >
                  {analysis.sector}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "#666",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Exchange
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#000",
                    fontWeight: 600,
                  }}
                >
                  {analysis.exchange}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "#666",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  IPO Date
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#000",
                    fontWeight: 600,
                  }}
                >
                  {formatDate(analysis.ipo_date)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "#666",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Days Since IPO
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#000",
                    fontWeight: 600,
                  }}
                >
                  {analysis.days_since_ipo} days
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Strengths and Concerns */}
      <Grid container spacing={2}>
        {/* Strengths */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              backgroundColor: "#ecfdf5",
              borderLeft: "4px solid #10b981",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "#000",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  mb: 1.5,
                }}
              >
                Strengths
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {analysis.strengths.map((strength, idx) => (
                  <Typography
                    key={idx}
                    variant="body2"
                    sx={{
                      color: "#374151",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      "&:before": {
                        content: '"• "',
                        marginRight: "0.5rem",
                        color: "#10b981",
                        fontWeight: 700,
                      },
                    }}
                  >
                    {strength}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Concerns */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              backgroundColor: "#fef2f2",
              borderLeft: "4px solid #ef4444",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "#000",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  mb: 1.5,
                }}
              >
                Concerns
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {analysis.concerns.map((concern, idx) => (
                  <Typography
                    key={idx}
                    variant="body2"
                    sx={{
                      color: "#374151",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      "&:before": {
                        content: '"⚠ "',
                        marginRight: "0.5rem",
                        color: "#ef4444",
                        fontWeight: 700,
                      },
                    }}
                  >
                    {concern}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Criteria Breakdown */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: "#000",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "block",
              mb: 2,
            }}
          >
            Gator Framework - Key Criteria Breakdown
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {analysis.key_criteria.map((criteria) => (
              <Box
                key={criteria.id}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#f3f4f6",
                    },
                  }}
                  onClick={() => toggleCriteria(criteria.id)}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "#000",
                      }}
                    >
                      {criteria.id}. {criteria.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip
                      label={`${criteria.score}/${criteria.max}`}
                      color={getRatingColor(criteria.rating)}
                      variant="outlined"
                      sx={{ fontSize: "0.75rem" }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        transform:
                          expandedCriteria === criteria.id
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                    >
                      <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Collapse in={expandedCriteria === criteria.id}>
                  <Box sx={{ p: 2, backgroundColor: "#ffffff", borderTop: "1px solid #e5e7eb" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#374151",
                        lineHeight: 1.6,
                        mb: 1.5,
                      }}
                    >
                      {criteria.finding}
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: "#f0f9ff",
                        borderLeft: "3px solid #0284c7",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#0c4a6e",
                          fontStyle: "italic",
                          fontSize: "0.8rem",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Reference:</strong> {criteria.ritter_reference}
                      </Typography>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Ritter Caveat and Updated Date */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "#fafafa",
          border: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#000",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                mb: 1,
              }}
            >
              Methodology Note
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#374151",
                lineHeight: 1.6,
                fontSize: "0.85rem",
              }}
            >
              {analysis.disclaimer}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#000",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                mb: 1,
              }}
            >
              Gator Framework 
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#374151",
                lineHeight: 1.6,
                fontSize: "0.85rem",
              }}
            >
              {analysis.ritter_caveat}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              pt: 1,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <EventNoteIcon sx={{ fontSize: 18, color: "#999" }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                color: "#666",
                fontSize: "0.8rem",
              }}
            >
              Updated {formatDate(signal.updated_at)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default GatorSignalAnalysis;
