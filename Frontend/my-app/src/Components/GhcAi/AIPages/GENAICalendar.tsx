import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Card, CardHeader, CardContent } from "@mui/material";

interface CalendarEntry {
  date: string;
  label: string;
}

interface GENAICalendarProps {
  title: string;
  data: CalendarEntry[];
}

const GENAICalendar: React.FC<GENAICalendarProps> = ({ title, data }) => {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <CalendarHeatmap
          startDate={new Date("2025-01-01")}
          endDate={new Date("2025-12-31")}
          values={data.map((d) => ({ date: d.date, count: 1 }))}
          titleForValue={(value) =>
            value && value.date
              ? data.find((d) => d.date === value.date)?.label || value.date
              : ""
          }
          classForValue={(value) =>
            value && value.count ? "color-scale-4" : "color-empty"
          }
        />
      </CardContent>
    </Card>
  );
};

export default GENAICalendar;
