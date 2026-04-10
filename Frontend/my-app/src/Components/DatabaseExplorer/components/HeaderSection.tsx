import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import StorageIcon from "@mui/icons-material/Storage";
import TableChartIcon from "@mui/icons-material/TableChart";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import DatasetIcon from "@mui/icons-material/Dataset";
import { TableInfo, ColumnInfo } from "../types";
import { formatTableName } from "../utils";

const MotionBox = motion(Box);

interface HeaderSectionProps {
  tables: TableInfo[];
  selectedTable: string;
  columns: ColumnInfo[];
  activeFilterCount: number;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  tables,
  selectedTable,
  columns,
  activeFilterCount,
}) => {
  const selectedTableInfo = tables.find((t) => t.table_name === selectedTable);

  const stats = [
    {
      label: "Tables",
      value: tables.length,
      icon: <TableChartIcon sx={{ fontSize: 16 }} />,
      color: "#60a5fa",
    },
    ...(selectedTable
      ? [
          {
            label: "Selected",
            value: formatTableName(selectedTable),
            icon: <DatasetIcon sx={{ fontSize: 16 }} />,
            color: "#a78bfa",
          },
          {
            label: "Columns",
            value: columns.length,
            icon: <ViewColumnIcon sx={{ fontSize: 16 }} />,
            color: "#34d399",
          },
          {
            label: "Approx Rows",
            value: selectedTableInfo?.approx_rows?.toLocaleString() || "--",
            icon: <StorageIcon sx={{ fontSize: 16 }} />,
            color: "#fbbf24",
          },
          {
            label: "Active Filters",
            value: activeFilterCount,
            icon: <FilterListIcon sx={{ fontSize: 16 }} />,
            color: "#f87171",
          },
        ]
      : []),
  ];

  return (
    <MotionBox
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      sx={{
        background:
          "linear-gradient(135deg, #0a1628 0%, #162544 50%, #1e3a5f 100%)",
        px: { xs: 2, md: 4 },
        py: 3.5,
        color: "#fff",
      }}
    >
      <Box sx={{ maxWidth: 1600, mx: "auto" }}>
        {/* Title Row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
          <MotionBox
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
            }}
          >
            <StorageIcon sx={{ fontSize: 26, color: "#fff" }} />
          </MotionBox>
          <Box>
            <Typography
              sx={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: -0.5,
                background: "linear-gradient(90deg, #fff, #93c5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Database Explorer
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8", mt: 0.2 }}>
              Browse tables, filter data, generate queries, and export to Excel
            </Typography>
          </Box>
        </Box>

        {/* Stats Row */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {stats.map((stat, i) => (
            <MotionBox
              key={`${stat.label}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              whileHover={{ y: -2, scale: 1.02 }}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                cursor: "default",
                transition: "background 0.2s",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.58rem",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    lineHeight: 1,
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: typeof stat.value === "string" ? "0.78rem" : "0.95rem",
                    fontWeight: 800,
                    mt: 0.2,
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
            </MotionBox>
          ))}
        </Box>
      </Box>
    </MotionBox>
  );
};

export default HeaderSection;
