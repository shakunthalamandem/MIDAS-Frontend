import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer, { renderArrayTable } from "./GenericDataRenderer";

interface Props {
  data: any;
}

const modernFont = `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

const normalizeRowsByColumns = (columns: string[] | undefined, rows: any[] | undefined) => {
  if (!rows || rows.length === 0) return [];
  if (!columns || columns.length === 0) return rows;

  return rows.map((row) => {
    if (Array.isArray(row)) {
      return columns.reduce<Record<string, any>>((acc, col, idx) => {
        acc[col] = row[idx];
        return acc;
      }, {});
    }
    return row;
  });
};

const MacroRegimeSectorRotation: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const model = data.macro_score_model;
  const sectorPerformance = data.sector_performance;
  const macroAlignment = data.macro_sector_alignment;
  const portfolioAlignment = data.portfolio_alignment_assessment;
  const dataStatus = data.data_status;

  const sectorRows = normalizeRowsByColumns(
    sectorPerformance?.columns,
    sectorPerformance?.rows
  );

  const renderModelSummary = () => {
    if (!model) return null;
    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 700,
            color: "#0f172a",
            mb: 1,
            fontFamily: modernFont,
          }}
        >
          Macro Score Model
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#1e293b", mb: 0.5 }}>
          Composite Score: {model.composite_score ?? "Data unavailable"}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#1e293b", mb: 0.5 }}>
          Regime Classification: {model.regime_classification ?? "Data unavailable"}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#1e293b" }}>
          Regime Direction: {model.regime_direction ?? "Data unavailable"}
        </Typography>
        {Array.isArray(model.components) && model.components.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: "#0f172a",
                mb: 2,
              }}
            >
              Component Signals
            </Typography>
            {renderArrayTable(model.components, "#c084fc")}
          </Box>
        )}
      </Box>
    );
  };

  const renderSectorPerformance = () => {
    if (!sectorPerformance || sectorRows.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 700,
            color: "#0f172a",
            mb: 2,
            fontFamily: modernFont,
          }}
        >
          Sector Performance
        </Typography>
        {renderArrayTable(sectorRows, "#0284c7")}
      </Box>
    );
  };

  return (
    <Box sx={{ fontFamily: modernFont }}>
      {renderModelSummary()}
      {renderSectorPerformance()}
      {macroAlignment && (
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: "#0f172a",
              mb: 1,
            }}
          >
            Macro Sector Alignment
          </Typography>
          <GenericDataRenderer data={macroAlignment} accentColor="#f97316" />
        </Box>
      )}
      {portfolioAlignment && (
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: "#0f172a",
              mb: 1,
            }}
          >
            Portfolio Alignment Assessment
          </Typography>
          <GenericDataRenderer data={portfolioAlignment} accentColor="#0f172a" />
        </Box>
      )}
      {dataStatus && (
        <Box
          sx={{
            backgroundColor: "#f8fafc",
            border: "1px solid #c7d2fe",
            borderRadius: 3,
            p: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              mb: 1,
            }}
          >
            Data Status
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#0f172a" }}>{dataStatus}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MacroRegimeSectorRotation;
