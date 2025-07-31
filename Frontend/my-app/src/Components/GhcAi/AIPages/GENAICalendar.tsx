import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Card, CardHeader, CardContent } from "@mui/material";
import { Tooltip } from "react-tooltip";

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
          tooltipDataAttrs={(value) => {
            const label = value?.date
              ? data.find((d) => d.date === value.date)?.label || ""
              : "";
            return { "data-tip": label } as React.CalendarHeatmap.TooltipDataAttrs;
          }}
          classForValue={(value) => {
            if (!value || !value.count) return "color-empty";
            return "color-scale-4";
          }}
        />
        <Tooltip />
      </CardContent>
    </Card>
  );
};

export default GENAICalendar;
