import React from "react";
import { Button, Paper, Stack, Typography } from "@mui/material";

type MeetingStatusPanelsProps = {
  noDataFound: boolean;
  loading: boolean;
  onCreateNew: () => void;
};

const MeetingStatusPanels: React.FC<MeetingStatusPanelsProps> = ({
  noDataFound,
  loading,
  onCreateNew,
}) => {
  return (
    <>
      {noDataFound ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            borderColor: "rgba(0,80,200,0.25)",
            background: "linear-gradient(90deg, rgba(0,98,255,0.06), rgba(0,194,162,0.06))",
          }}
        >
          <Stack spacing={1.5} direction={{ xs: "column", sm: "row" }} alignItems="center">
            <Stack flex={1} spacing={0.5}>
              <Typography fontWeight={700} color="#002060">
                Meeting notes do not exist for this ticker.
              </Typography>
              <Typography variant="body2" color="#000000">
                Create a new meeting note using the latest template.
              </Typography>
            </Stack>
            <Button
              variant="contained"
              onClick={onCreateNew}
              sx={{
                background: "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)",
                color: "#fff",
                borderRadius: 999,
                px: 2.5,
                textTransform: "none",
              }}
            >
              Create Meeting Note
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {loading ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            borderColor: "rgba(0,80,200,0.15)",
            background: "rgba(0,32,96,0.03)",
            textAlign: "center",
          }}
        >
          <Typography fontWeight={700} color="#002060">
            Loading meeting notes...
          </Typography>
        </Paper>
      ) : null}
    </>
  );
};

export default MeetingStatusPanels;
