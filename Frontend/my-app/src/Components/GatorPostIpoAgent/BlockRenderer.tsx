import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import GaugeIcon from "@mui/icons-material/Speed";
import AlertTriangleIcon from "@mui/icons-material/WarningAmberOutlined";
import ClockIcon from "@mui/icons-material/AccessTime";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import ZapIcon from "@mui/icons-material/BoltOutlined";
import CpuIcon from "@mui/icons-material/MemoryOutlined";
import BuildingIcon from "@mui/icons-material/BusinessOutlined";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

/* ═══════════════ Types ═══════════════ */
export type GatorBlock =
  | GatorTextBlock
  | GatorCardBlock
  | GatorTableBlock
  | GatorChartBlock;

export interface GatorBlockBase {
  row?: number;
  column?: number;
  total_columns?: number;
}

export interface GatorTextBlock extends GatorBlockBase {
  type: "text";
  content: string;
}

export interface GatorCardBlock extends GatorBlockBase {
  type: "card";
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
}

export interface GatorTableBlock extends GatorBlockBase {
  type: "table";
  title?: string;
  headers: string[];
  rows: (string | number | null)[][];
}

export interface GatorChartBlock extends GatorBlockBase {
  type: "chart";
  chartType: "bar" | "line" | "pie" | "doughnut";
  title?: string;
  data: any;
}

/* ═══════════════ Helpers ═══════════════ */
const ICON_MAP: Record<string, React.ReactNode> = {
  gauge: <GaugeIcon />,
  "alert-triangle": <AlertTriangleIcon />,
  clock: <ClockIcon />,
  shield: <ShieldIcon />,
  zap: <ZapIcon />,
  cpu: <CpuIcon />,
  building: <BuildingIcon />,
  info: <InfoIcon />,
};

/** Group blocks by row so we can lay them out in a grid. */
const groupByRow = (blocks: GatorBlock[]) => {
  const rows: Record<number, GatorBlock[]> = {};
  let autoRow = 0;
  blocks.forEach((b) => {
    const r = typeof b.row === "number" ? b.row : ++autoRow;
    if (!rows[r]) rows[r] = [];
    rows[r].push(b);
  });
  return Object.keys(rows)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => ({
      row: Number(k),
      blocks: rows[Number(k)].sort(
        (a, b) => (a.column ?? 0) - (b.column ?? 0),
      ),
    }));
};

const inferSubtitleTone = (subtitle?: string, title?: string) => {
  const s = `${subtitle || ""} ${title || ""}`.toLowerCase();
  if (/bullish|pass|strong|positive|healthy|bright|favorable|yes/.test(s))
    return { color: "#047857", bg: "#ecfdf5", border: "#a7f3d0" };
  if (/bearish|fail|weak|negative|cautious|below|avoid/.test(s))
    return { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" };
  if (/neutral|moderate|mixed|pending|inconclusive|partial|medium/.test(s))
    return { color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
  return { color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" };
};

const VERDICT_CELL_TONE = (val: string) => {
  const v = val.toLowerCase().trim();
  if (v === "partial" || v === "partial pass") return { bg: "#fffbeb", color: "#b45309" };
  if (v === "pass" || v === "tracking") return { bg: "#ecfdf5", color: "#047857" };
  if (v === "inconclusive" || v === "pending") return { bg: "#f1f5f9", color: "#475569" };
  if (v === "fail" || v === "avoid") return { bg: "#fef2f2", color: "#b91c1c" };
  return { bg: "#eff6ff", color: "#1e40af" };
};

/** Only short, standalone verdict keywords render as chips. Sentences render as plain text. */
const VERDICT_KEYWORDS = new Set([
  "pass",
  "fail",
  "partial",
  "partial pass",
  "inconclusive",
  "pending",
  "tracking",
  "avoid",
]);

const isVerdictCell = (value: string, header: string | undefined) => {
  const v = (value || "").trim().toLowerCase();
  if (!v || v.length > 20) return false;
  if (!VERDICT_KEYWORDS.has(v)) return false;
  // If a header is available, only treat as chip when it really is a verdict / signal column.
  if (header) {
    const h = header.toLowerCase();
    if (!/verdict|signal|status|rating|outcome/.test(h)) return false;
  }
  return true;
};

/** Severity chip for Risk Register ("Severity" column: Low / Medium / High / Medium-High …). */
const SEVERITY_TONE = (val: string) => {
  const v = val.toLowerCase();
  if (/high/.test(v) && !v.includes("low")) return { bg: "#fef2f2", color: "#b91c1c" };
  if (/medium/.test(v)) return { bg: "#fffbeb", color: "#b45309" };
  if (/low/.test(v)) return { bg: "#ecfdf5", color: "#047857" };
  return null;
};
const isSeverityCell = (value: string, header: string | undefined) => {
  if (!header) return false;
  if (!/severity|impact|risk level/.test(header.toLowerCase())) return false;
  const v = (value || "").trim();
  return v.length > 0 && v.length <= 20 && /^(low|medium|high)[\s\-–—\w]*$/i.test(v);
};

/* ═══════════════ Individual Block Components ═══════════════ */

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

const TextBlockCmp: React.FC<{ block: GatorTextBlock; isHeadline?: boolean }> = ({
  block,
  isHeadline,
}) => {
  if (isHeadline) {
    // Split pipe-separated metadata into chips for a cleaner, scannable header.
    const segments = (block.content || "")
      .split(/\s*\|\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <Box
        sx={{
          px: { xs: 1.5, md: 2 },
          py: 1.2,
          borderRadius: 2,
          background:
            "linear-gradient(135deg, rgba(14,90,128,0.05) 0%, rgba(8,145,178,0.05) 100%)",
          border: "1px solid #cfeafd",
        }}
      >
        {segments.length > 1 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, alignItems: "center" }}>
            {segments.map((seg, i) => (
              <React.Fragment key={i}>
                {i === 0 ? (
                  <Typography
                    sx={{
                      fontSize: { xs: "0.74rem", md: "0.78rem" },
                      fontWeight: 700,
                      color: "#0c4a6e",
                      letterSpacing: "-0.005em",
                      lineHeight: 1.4,
                    }}
                  >
                    {renderBold(seg)}
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      fontSize: { xs: "0.66rem", md: "0.7rem" },
                      fontWeight: 500,
                      color: "#0c4a6e",
                      bgcolor: "rgba(255,255,255,0.7)",
                      border: "1px solid #cfeafd",
                      borderRadius: 1,
                      px: 0.8,
                      py: 0.2,
                      lineHeight: 1.4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {renderBold(seg)}
                  </Box>
                )}
              </React.Fragment>
            ))}
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: { xs: "0.74rem", md: "0.78rem" },
              fontWeight: 600,
              color: "#0c4a6e",
              lineHeight: 1.45,
              letterSpacing: "-0.005em",
            }}
          >
            {renderBold(block.content)}
          </Typography>
        )}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        px: 2.5,
        py: 2,
        borderRadius: 2.5,
        bgcolor: "#fff",
        border: "1px solid #e2e8f0",
      }}
    >
      <Typography sx={{ fontSize: "0.9rem", color: "#1e293b", lineHeight: 1.7 }}>
        {renderBold(block.content)}
      </Typography>
    </Box>
  );
};

const CardBlockCmp: React.FC<{ block: GatorCardBlock }> = ({ block }) => {
  const tone = inferSubtitleTone(block.subtitle, block.title);
  const iconNode = block.icon ? ICON_MAP[block.icon] : null;

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: `1px solid ${tone.border}`,
        borderRadius: 3,
        p: 2.2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        height: "100%",
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": {
          boxShadow: "0 6px 20px rgba(8,145,178,0.12)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, minWidth: 0 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.015em",
              lineHeight: 1.25,
              // Numbers/symbols like "$14.00" shouldn't break mid-token.
              wordBreak: "normal",
              overflowWrap: "break-word",
              // If the title fits on one line, keep it there; otherwise wrap cleanly.
              hyphens: "manual",
            }}
          >
            {block.title}
          </Typography>
          {block.subtitle && (
            <Box
              sx={{
                display: "inline-flex",
                mt: 0.6,
                px: 1.2,
                py: 0.3,
                borderRadius: 1.5,
                bgcolor: tone.bg,
                border: `1px solid ${tone.border}`,
                maxWidth: "100%",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: tone.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  lineHeight: 1.35,
                }}
              >
                {block.subtitle}
              </Typography>
            </Box>
          )}
        </Box>
        {iconNode && (
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: tone.bg,
              color: tone.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              "& svg": { fontSize: 20 },
            }}
          >
            {iconNode}
          </Box>
        )}
      </Box>
      {block.description && (
        <Typography
          sx={{
            fontSize: "0.78rem",
            color: "#475569",
            lineHeight: 1.55,
            mt: 0.5,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            flex: 1,
          }}
        >
          {block.description}
        </Typography>
      )}
    </Box>
  );
};

// Detect a token that *looks* numeric/financial — handles $, %, ×, x, M/K/B suffixes,
// negatives, leading +, and tolerates trailing notes ("$14.00 priced").
const NUMERIC_TOKEN = /^[-+]?\$?\d{1,3}(?:[,]?\d{3})*(?:\.\d+)?[%xX×]?[KMB]?$/;
const isNumericCell = (val: string) => {
  const t = (val || "").trim();
  if (!t) return false;
  if (NUMERIC_TOKEN.test(t)) return true;
  // Allow numeric prefix with a short trailing word, e.g. "$14.00 priced", "1.91M shares".
  const head = t.split(/\s+/)[0];
  return head !== t && NUMERIC_TOKEN.test(head);
};

const NUMERIC_HEADER = /price|open|high|low|close|volume|return|change|%|offer|score|cap|shares|count|raise|discount|ratio|adv|adtv|day\b|d\d/i;

const TABLE_DEFAULT_VISIBLE = 8;
const TABLE_COLLAPSE_THRESHOLD = 12;

const TableBlockCmp: React.FC<{ block: GatorTableBlock }> = ({ block }) => {
  const totalRows = block.rows.length;
  const collapsible = totalRows > TABLE_COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(false);
  const visibleRows = collapsible && !expanded ? block.rows.slice(0, TABLE_DEFAULT_VISIBLE) : block.rows;

  // Decide column alignment from header AND from sampled cells (majority numeric → right-align).
  const colAlignRight = useMemo(() => {
    return block.headers.map((h, ci) => {
      if (ci === 0) return false; // first column is always the row label
      if (NUMERIC_HEADER.test(h || "")) return true;
      let numeric = 0;
      let total = 0;
      for (const row of block.rows) {
        const cell = row[ci];
        if (cell === null || cell === undefined || cell === "" || cell === "—" || cell === "TBD") continue;
        total++;
        if (isNumericCell(String(cell))) numeric++;
      }
      return total > 0 && numeric / total >= 0.5;
    });
  }, [block.headers, block.rows]);

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
      }}
    >
      {block.title && (
        <Box
          sx={{
            px: 2.2,
            py: 1.5,
            bgcolor: "#0f2d4a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 800,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              lineHeight: 1.4,
            }}
          >
            {block.title}
          </Typography>
          {collapsible && (
            <Box
              component="button"
              type="button"
              onClick={() => setExpanded((v) => !v)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#e0f2fe",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 999,
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                px: 1.4,
                py: 0.5,
                cursor: "pointer",
                transition: "background 0.15s ease, transform 0.15s ease",
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
                "&:active": { transform: "translateY(1px)" },
              }}
            >
              {expanded ? (
                <>
                  <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
                  Show less
                </>
              ) : (
                <>
                  <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                  Show all ({totalRows})
                </>
              )}
            </Box>
          )}
        </Box>
      )}
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 640, tableLayout: "auto" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f1f5f9" }}>
              {block.headers.map((h, i) => (
                <TableCell
                  key={i}
                  align={colAlignRight[i] ? "right" : "left"}
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    py: 1.3,
                    px: 1.6,
                    borderBottom: "2px solid #cbd5e1",
                    whiteSpace: "nowrap",
                    verticalAlign: "bottom",
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row, ri) => (
              <TableRow
                key={ri}
                sx={{
                  "&:nth-of-type(even)": { bgcolor: "#f8fafc" },
                  "&:hover": { bgcolor: "#ecfeff" },
                }}
              >
                {row.map((cell, ci) => {
                  const cellStr = cell === null || cell === undefined ? "—" : String(cell);
                  const header = block.headers[ci];

                  if (isVerdictCell(cellStr, header)) {
                  const tone = VERDICT_CELL_TONE(cellStr);
                  return (
                    <TableCell
                      key={ci}
                      sx={{
                        py: 1.2,
                        px: 1.6,
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 1.2,
                          py: 0.3,
                          borderRadius: 1.5,
                          bgcolor: tone.bg,
                          color: tone.color,
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {cellStr}
                      </Box>
                    </TableCell>
                  );
                }

                if (isSeverityCell(cellStr, header)) {
                  const tone = SEVERITY_TONE(cellStr);
                  if (tone) {
                    return (
                      <TableCell
                        key={ci}
                        sx={{
                          py: 1.2,
                          px: 1.6,
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 1.2,
                            py: 0.3,
                            borderRadius: 1.5,
                            bgcolor: tone.bg,
                            color: tone.color,
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {cellStr}
                        </Box>
                      </TableCell>
                    );
                  }
                }

                const numeric = isNumericCell(cellStr);
                const rightAlign = colAlignRight[ci];
                return (
                  <TableCell
                    key={ci}
                    align={rightAlign ? "right" : "left"}
                    sx={{
                      py: 1.2,
                      px: 1.6,
                      fontSize: "0.8rem",
                      color: "#1e293b",
                      fontWeight: ci === 0 ? 700 : numeric ? 600 : 500,
                      lineHeight: 1.55,
                      // Numeric columns get tabular-nums + normal break behavior so digits stay aligned.
                      whiteSpace: rightAlign ? "nowrap" : "normal",
                      wordBreak: rightAlign ? "normal" : "break-word",
                      overflowWrap: rightAlign ? "normal" : "anywhere",
                      verticalAlign: "top",
                      fontVariantNumeric: rightAlign ? "tabular-nums" : "normal",
                    }}
                  >
                    {cellStr}
                  </TableCell>
                );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {collapsible && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.2,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#f8fafc",
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => setExpanded((v) => !v)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "transparent",
              color: "#0f2d4a",
              border: "1px solid #cbd5e1",
              borderRadius: 999,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              px: 1.6,
              py: 0.5,
              cursor: "pointer",
              transition: "background 0.15s ease, border-color 0.15s ease",
              "&:hover": { bgcolor: "#e2e8f0", borderColor: "#94a3b8" },
            }}
          >
            {expanded ? (
              <>
                <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
                Show less
              </>
            ) : (
              <>
                <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                Show all {totalRows} rows
              </>
            )}
          </Box>
          <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
            {expanded ? `Showing all ${totalRows}` : `Showing ${visibleRows.length} of ${totalRows}`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const PIE_PALETTE = [
  "#60a5fa", "#34d399", "#fbbf24", "#f87171",
  "#a78bfa", "#22d3ee", "#fb923c", "#94a3b8",
];

const BAR_PALETTE = [
  "#0891b2", "#34d399", "#fbbf24", "#f87171",
  "#a78bfa", "#60a5fa", "#fb923c",
];

const ChartBlockCmp: React.FC<{ block: GatorChartBlock }> = React.memo(({ block }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  const isCircular = block.chartType === "pie" || block.chartType === "doughnut";

  const chartData = useMemo(
    () => ({
      labels: block.data?.labels || [],
      datasets: (block.data?.datasets || []).map((ds: any, idx: number) => {
        const fallbackBg = isCircular ? PIE_PALETTE : BAR_PALETTE[idx % BAR_PALETTE.length];
        return {
          ...ds,
          backgroundColor: ds.backgroundColor || fallbackBg,
          borderColor: ds.borderColor || (isCircular ? "#fff" : BAR_PALETTE[idx % BAR_PALETTE.length]),
          borderWidth: ds.borderWidth ?? (isCircular ? 1 : 2),
          tension: block.chartType === "line" ? 0.3 : 0,
          pointRadius: block.chartType === "line" ? 3 : 0,
          spanGaps: true,
        };
      }),
    }),
    [block.data, block.chartType, isCircular],
  );

  const options = useMemo(() => {
    const base: any = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      resizeDelay: 150,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { font: { size: 10 }, color: "#475569", boxWidth: 10, padding: 8 },
        },
        tooltip: { enabled: true },
      },
    };
    if (isCircular) return base;
    return {
      ...base,
      layout: { padding: { bottom: 4 } },
      scales: {
        x: {
          ticks: {
            color: "#64748b",
            font: { size: 9 },
            autoSkip: false,
            maxRotation: 35,
            minRotation: 0,
            padding: 2,
          },
          grid: { display: false },
        },
        y: {
          ticks: { color: "#64748b", font: { size: 10 } },
          grid: { color: "#f1f5f9" },
          beginAtZero: false,
        },
      },
    };
  }, [isCircular]);

  let chartNode: React.ReactNode = null;
  if (block.chartType === "bar") chartNode = <Bar data={chartData} options={options} />;
  else if (block.chartType === "line") chartNode = <Line data={chartData} options={options} />;
  else if (block.chartType === "doughnut") chartNode = <Doughnut data={chartData} options={options} />;
  else chartNode = <Pie data={chartData} options={options} />;

  // Fixed pixel height: prevents flex-grow loops and matches table rows predictably.
  const canvasHeight = isCircular ? 260 : 280;

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 3,
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {block.title && (
        <Typography
          sx={{
            fontSize: "0.82rem",
            fontWeight: 800,
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            mb: 1.5,
          }}
        >
          {block.title}
        </Typography>
      )}
      <Box sx={{ position: "relative", height: canvasHeight, width: "100%" }}>
        {mounted && chartNode}
      </Box>
    </Box>
  );
});
ChartBlockCmp.displayName = "ChartBlockCmp";

/* ═══════════════ Main Renderer ═══════════════ */

const BlockRenderer: React.FC<{ blocks: GatorBlock[] }> = ({ blocks }) => {
  const rows = useMemo(() => groupByRow(blocks || []), [blocks]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2.2,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {rows.map(({ row, blocks: rowBlocks }) => {
        const totalCols =
          rowBlocks[0]?.total_columns && rowBlocks[0].total_columns > 0
            ? rowBlocks[0].total_columns
            : rowBlocks.length;
        const gridCols =
          totalCols === 1
            ? "1fr"
            : totalCols === 2
            ? { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }
            : totalCols === 3
            ? { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }
            : { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" };

        const isTextHeadline = rowBlocks.length === 1 && rowBlocks[0].type === "text" && row === 1;

        return (
          <Box
            key={row}
            sx={{
              display: "grid",
              gridTemplateColumns: gridCols,
              gap: 2,
              alignItems: "stretch",
              width: "100%",
              minWidth: 0,
            }}
          >
            {rowBlocks.map((b, i) => (
              <Box key={i} sx={{ minWidth: 0, width: "100%" }}>
                {b.type === "text" && (
                  <TextBlockCmp block={b} isHeadline={isTextHeadline} />
                )}
                {b.type === "card" && <CardBlockCmp block={b} />}
                {b.type === "table" && <TableBlockCmp block={b} />}
                {b.type === "chart" && <ChartBlockCmp block={b} />}
              </Box>
            ))}
          </Box>
        );
      })}
    </Box>
  );
};

export default BlockRenderer;
