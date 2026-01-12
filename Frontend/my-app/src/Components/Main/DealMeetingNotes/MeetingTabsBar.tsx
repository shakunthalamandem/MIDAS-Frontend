import React from "react";
import { Button, Stack } from "@mui/material";

type MeetingTabsBarProps = {
  totalMeetings: number;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onAddNew: () => void;
  showCancelNew: boolean;
  onCancelNew: () => void;
};

const MeetingTabsBar: React.FC<MeetingTabsBarProps> = ({
  totalMeetings,
  selectedIndex,
  onSelectIndex,
  onAddNew,
  showCancelNew,
  onCancelNew,
}) => {
  if (totalMeetings === 0) return null;

  return (
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
          borderColor: "#f28c28",
          color: "#f28c28",
        }}
      >
        + New Meeting Note
      </Button>
      {showCancelNew ? (
        <Button variant="text" color="error" onClick={onCancelNew} sx={{ textTransform: "none" }}>
          Cancel New Meeting
        </Button>
      ) : null}
    </Stack>
  );
};

export default MeetingTabsBar;
