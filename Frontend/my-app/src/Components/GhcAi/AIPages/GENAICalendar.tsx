import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card, CardHeader, CardContent, Tooltip, Fade, Typography } from "@mui/material";
import "./GENAICalendar.css"; // CSS file for styles

interface CalendarEntry {
  date: string;
  label: string;
}

interface GENAICalendarProps {
  title: string;
  data: CalendarEntry[];
}

const GENAICalendar: React.FC<GENAICalendarProps> = ({ title, data }) => {
  const eventsMap = data.reduce<Record<string, string[]>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry.label);
    return acc;
  }, {});

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  return (
    <Card elevation={4} style={{ borderRadius: 12 }}>
      <CardHeader
        title={<Typography variant="h6" style={{ color: "#002060", fontWeight: 600 }}>{title}</Typography>}
      />
      <CardContent>
        <Calendar
          value={new Date("2025-07-01")}
          defaultView="month"
          tileDisabled={() => true}
          tileContent={({ date, view }) => {
            if (view === "month") {
              const dateKey = formatDate(date);
              const labels = eventsMap[dateKey];
              if (labels) {
                return (
                  <Tooltip
                    title={
                      <div>
                        {labels.map((label, i) => (
                          <Typography
                            key={i}
                            variant="body2"
                            style={{ fontSize: "0.8em", color: "#444" }}
                          >
                            {label}
                          </Typography>
                        ))}
                      </div>
                    }
                    placement="top"
                    arrow
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 300 }}
                  >
                    <div className="event-dot" />
                  </Tooltip>
                );
              }
            }
            return null;
          }}
        />
      </CardContent>
    </Card>
  );
};

export default GENAICalendar;
