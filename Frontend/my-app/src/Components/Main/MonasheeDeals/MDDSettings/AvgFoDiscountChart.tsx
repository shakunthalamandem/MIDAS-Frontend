import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, useTheme, Card, CardContent, Container } from "@mui/material";
import NoDataPopup from "../../../../Pages/NoDataPopup";
import { resetFilters } from "./MDDFilters";  

interface YearData {
  [year: string]: {
    count: number;
    avg_fo_discount: number;
  };
}

interface Props {
  data: YearData | { message: string };
  handleCancel: () => void;  // Accept handleCancel as a prop here
}

const AvgFoDiscountChart: React.FC<Props> = ({ data, handleCancel }) => {  // Accept handleCancel here as well
  const theme = useTheme();

  const [noDataPopupOpen, setNoDataPopupOpen] = useState(false);

  useEffect(() => {
    if ('message' in data && data.message === "No data found for the given filters.") {
      setNoDataPopupOpen(true); // Open the NoDataPopup
    }
  }, [data]);

  const chartData = Object.entries(data).map(([year, values]) => ({
    year,
    avgFoDiscount: values.avg_fo_discount,
    count: values.count,
  }));

  if ('message' in data && data.message === "No data found for the given filters.") {
    return (
      <NoDataPopup
        open={noDataPopupOpen}
        onClose={() => {
          resetFilters(handleCancel); // Pass handleCancel here
          setNoDataPopupOpen(false);
        }}
      />
    );
  }

  if (chartData.length === 0) {
    return (
      <>
        <NoDataPopup
          open={noDataPopupOpen}
          onClose={() => {
            setNoDataPopupOpen(false);
            resetFilters(handleCancel); // Pass handleCancel here
          }}
        />
      </>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { year, avgFoDiscount, count } = payload[0].payload;
      return (
        <Box
          sx={{
            padding: 2,
            backgroundColor: "#FFFFFF",
            color:'#002060',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "4px",
            boxShadow: theme.shadows[1],
          }}
        >
          <Typography variant="body1" fontWeight="bold" color="#68021d">
            Year: {year}
          </Typography>
          <Typography variant="body2">
            Avg FO Discount: <span style={{fontWeight:'bold'}}>{avgFoDiscount.toFixed(2)}</span>
          </Typography>
          <Typography variant="body2">Count: <span style={{fontWeight:'bold'}}>{count}</span></Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
        <Card
          elevation={4}
          sx={{
            width: "100%",
            maxWidth: 800,
            padding: 2,
            backgroundColor: theme.palette.background.default,
            borderRadius: "8px",
            boxShadow: theme.shadows[2],
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                marginBottom: 2,
                textAlign: "center",
                fontWeight: "bold",
                color: "#002060",
              }}
            >
              Average FO Discount by Year
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="year"
                  tick={{
                    fill: "#002060",
                    fontSize: 12,
                  }}
                  tickLine={false}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis
                  tick={{
                    fill: "#002060",
                    fontSize: 12,
                  }}
                  tickLine={false}
                  axisLine={{ stroke: theme.palette.divider }}
                  width={50}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: theme.palette.action.hover }}
                />
                <Bar
                  dataKey="avgFoDiscount"
                  fill="#68021d"
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Container>

      <NoDataPopup
        open={noDataPopupOpen}
        onClose={() => {
          setNoDataPopupOpen(false);
          resetFilters(handleCancel); // Pass handleCancel here
        }}
      />
    </>
  );
};

export default AvgFoDiscountChart;
