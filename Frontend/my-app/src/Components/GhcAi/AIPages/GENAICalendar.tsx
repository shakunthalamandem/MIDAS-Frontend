import React from "react";
import {
  Paper,
  Box,
  Typography,
  Tooltip,
  Grid,
  useTheme,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import dayjs from "dayjs";

interface CalendarDatum {
  date: string;
  value: string;
}

interface GENAICalendarProps {
  title?: string;
  data: CalendarDatum[];
}

const GENAICalendar: React.FC<GENAICalendarProps> = ({ title, data }) => {
  const theme = useTheme();
  const calendarMap = new Map<string, string>();
  data.forEach(item => calendarMap.set(item.date, item.value));

  // Generate list of all days in a month (assumes same month/year for all entries)
  const firstDate = dayjs(data[0].date);
  const daysInMonth = firstDate.daysInMonth();
  const year = firstDate.year();
  const month = firstDate.month();

  const allDays = Array.from({ length: daysInMonth }, (_, i) =>
    dayjs(new Date(year, month, i + 1)).format("YYYY-MM-DD")
  );

  return (
    <Paper
      sx={{
        p: 2,
        m: 2,
        borderRadius: 3,
        background: "linear-gradient(135deg, #f5f7fa, #e4ecf7)",
        boxShadow: 3,
      }}
    >
      {title && (
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ color: "#2c387e", mb: 1 }}
        >
          <ReactMarkdown>{title}</ReactMarkdown>
        </Typography>
      )}

      <Grid container spacing={1} columns={7}>
        {allDays.map(date => {
          const label = calendarMap.get(date);
          return (
            <Grid item xs={1} key={date}>
              <Tooltip title={label || date}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: label ? "#60a5fa" : "#e0e0e0",
                    color: label ? "#fff" : "#000",
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    cursor: label ? "pointer" : "default",
                  }}
                >
                  {dayjs(date).date()}
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default GENAICalendar;
