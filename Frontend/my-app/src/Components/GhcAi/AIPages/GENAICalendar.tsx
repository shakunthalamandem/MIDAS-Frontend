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
  if (!data.length) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>No events to display.</CardContent>
      </Card>
    );
  }

  // Derive start and end dates dynamically from data
  const dates = data.map((d) => new Date(d.date));
  const startDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const endDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  // Map data to heatmap values with label
  const values = data.map((d) => ({
    date: d.date,
    count: 1, // count used to mark presence, can extend for multiple events if needed
    label: d.label,
  }));

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values}
          showWeekdayLabels={true}
          titleForValue={(value) =>
            value && value.date ? value.label || value.date : ""
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
