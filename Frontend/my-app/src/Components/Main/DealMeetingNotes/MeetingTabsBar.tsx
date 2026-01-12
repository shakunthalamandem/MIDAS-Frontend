import React from "react";
import { Button, Paper, Stack } from "@mui/material";

type MeetingTabsBarProps = {
  totalMeetings: number;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onAddNew: () => void;
  showCancelNew: boolean;
  onCancelNew: () => void;
  container?: boolean;
};

const MeetingTabsBar: React.FC<MeetingTabsBarProps> = ({
  totalMeetings,
  selectedIndex,
  onSelectIndex,
  onAddNew,
  showCancelNew,
  onCancelNew,
  container = true,
}) => {
  if (totalMeetings === 0) return null;

  const content = (
    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
      {Array.from({ length: totalMeetings }).map((_, idx) => (
        <Button
          key={`meeting-${idx}`}
          variant={idx === selectedIndex ? "contained" : "outlined"}
          onClick={() => onSelectIndex(idx)}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            px: 2,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
            },
            background:
              idx === selectedIndex
                ? "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)"
                : undefined,
            color: idx === selectedIndex ? "#fff" : undefined,
            borderColor: idx === selectedIndex ? "transparent" : "#0062ff",
          }}
        >
          {`Meeting ${idx + 1}`}
        </Button>
      ))}
      <Button
        variant="outlined"
        onClick={onAddNew}
        sx={{
          borderRadius: 999,
          textTransform: "none",
          px: 2,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
          },
          borderColor: "#f28c28",
          color: "#f28c28",
        }}
      >
        + New Meeting Note
      </Button>
      {showCancelNew ? (
        <Button
          variant="text"
          color="error"
          onClick={onCancelNew}
          sx={{ textTransform: "none" }}
        >
          Cancel New Meeting
        </Button>
      ) : null}
    </Stack>
  );

  if (!container) return content;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 999,
        border: "1px solid #d8deef",
        backgroundColor: "rgba(0,32,96,0.04)",
      }}
    >
      {content}
    </Paper>
  );
};

export default MeetingTabsBar;
