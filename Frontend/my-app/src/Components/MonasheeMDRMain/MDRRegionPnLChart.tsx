import React from "react";
import { Card, CardContent, CardHeader, Box } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export interface RegionPnLPoint {
  date: string;           // 'YYYY-MM-DD'
  us: number;             // in millions
  nonUsAmerica: number;   // in millions
  apac: number;           // in millions
  emea: number;           // in millions
  all: number;            // in millions
}

interface MDRRegionPnLChartProps {
  data: RegionPnLPoint[];
}

const PRIMARY_COLOR = "#002060";

// format millions with a leading minus for negatives (e.g. -$5.0M)
const formatMillions = (value: number) => {
  const abs = Math.abs(value);
  const formatted = `$${abs.toFixed(1)}M`;
  return value < 0 ? `-${formatted}` : formatted;
};

const MDRRegionPnLChart: React.FC<MDRRegionPnLChartProps> = ({ data }) => {
  return (
    <Box maxWidth="xl" mx="auto">
      <Card
        elevation={3}
        sx={{
          borderRadius: 3,
          backgroundColor: "#ffffff",
        }}
      >

        <CardContent sx={{ height: 420, pt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickMargin={8}
                tickFormatter={(value: string) => {
                  const d = new Date(value);
                  return d.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={formatMillions}
                width={70}
              />
              {/* horizontal zero line */}
              <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />

              <Tooltip
                formatter={(value: number) => formatMillions(value)}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return d.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: 11 }}
              />

              {/* Colors chosen to resemble your screenshot */}
              <Line
                type="monotone"
                dataKey="us"
                name="US"
                stroke="#8b4513" // brown
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="nonUsAmerica"
                name="Non-US America"
                stroke="#ff8c00" // orange
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="apac"
                name="APAC"
                stroke="#b3c905" // light green
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="emea"
                name="EMEA"
                stroke="#002060" // primary blue
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="all"
                name="ALL"
                stroke="#000000" // black
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MDRRegionPnLChart;
