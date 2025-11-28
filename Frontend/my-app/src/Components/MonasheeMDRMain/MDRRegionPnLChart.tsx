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

// simple currency formatter ($X.XM)
const formatMillions = (value: number) =>
  `$${value.toFixed(1)}M`;

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
        <CardHeader
          title="Regional SP&L"
          sx={{
            pb: 0,
            "& .MuiCardHeader-title": {
              fontSize: 16,
              fontWeight: 600,
              color: PRIMARY_COLOR,
            },
          }}
        />
        <CardContent sx={{ height: 420, pt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickMargin={8}
                // just show month/day like 02/01
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                }
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
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                }
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
