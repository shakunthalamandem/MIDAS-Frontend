import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Card,
  CardHeader,
  CardContent,
  Tooltip,
  Fade,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import "./GENAICalendar.css";

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
    <Card
      elevation={3}
      style={{
        borderRadius: 16,
        backgroundColor: "#f5f8ff",
        padding: "8px 12px",
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="h6"
            style={{
              color: "#002060",
              fontWeight: 600,
              fontFamily: "Roboto, sans-serif",
            }}
          >
            {title}
          </Typography>
        }
        style={{ paddingBottom: 0 }}
      />
      <CardContent style={{ paddingTop: 0 }}>
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
                      <Stack direction="column" spacing={0.5}>
                        {labels.map((label, i) => (
                          <Chip
                            key={i}
                            label={label}
                            size="small"
                            style={{
                              fontSize: "0.75rem",
                              backgroundColor: "#e0e7f9",
                              color: "#002060",
                            }}
                          />
                        ))}
                      </Stack>
                    }
                    placement="top"
                    arrow
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 200 }}
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
