import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  data: any;
}

const SectorNewsMap: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const sectors: any[] = Array.isArray(data) ? data : data.sectors || data.items || [];

  return (
    <Box>
      {sectors.map((sector: any, i: number) => (
        <Box
          key={i}
          sx={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            p: 2.5,
            mb: 2,
          }}
        >
          {/* Sector Header */}
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1e293b", mb: 0.5 }}>
            {sector.sector || sector.name}
            {sector.allocation && (
              <Box
                component="span"
                sx={{ fontWeight: 400, fontSize: 13, color: "#64748b", ml: 1 }}
              >
                ({sector.allocation}
                {sector.positions !== undefined && ` — ${sector.positions} positions`})
              </Box>
            )}
          </Typography>

          {/* Columns: Strong, Weak, Threats/Catalysts */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
              mt: 1.5,
            }}
          >
            {/* Strong */}
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  color: "#059669",
                  textTransform: "uppercase",
                  mb: 0.8,
                }}
              >
                STRONG
              </Typography>
              {(sector.strong || []).map((item: string, j: number) => (
                <Typography
                  key={j}
                  sx={{ fontSize: 13, color: "#059669", mb: 0.3 }}
                >
                  {item}
                </Typography>
              ))}
              {(!sector.strong || sector.strong.length === 0) && (
                <Typography sx={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                  —
                </Typography>
              )}
            </Box>

            {/* Weak */}
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  color: "#dc2626",
                  textTransform: "uppercase",
                  mb: 0.8,
                }}
              >
                WEAK
              </Typography>
              {(sector.weak || []).map((item: string, j: number) => (
                <Typography
                  key={j}
                  sx={{ fontSize: 13, color: "#dc2626", mb: 0.3 }}
                >
                  {item}
                </Typography>
              ))}
              {(!sector.weak || sector.weak.length === 0) && (
                <Typography sx={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                  —
                </Typography>
              )}
            </Box>

            {/* Threats / Catalysts */}
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  color: "#64748b",
                  textTransform: "uppercase",
                  mb: 0.8,
                }}
              >
                {sector.threats ? "THREATS" : "CATALYSTS"}
              </Typography>
              {(sector.threats || sector.catalysts || []).map(
                (item: string, j: number) => (
                  <Typography
                    key={j}
                    sx={{ fontSize: 13, color: "#475569", mb: 0.3 }}
                  >
                    {typeof item === "string" ? item : (item as any)?.text || JSON.stringify(item)}
                  </Typography>
                )
              )}
              {(!sector.threats && !sector.catalysts) && (
                <Typography sx={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                  —
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SectorNewsMap;
