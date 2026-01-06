import React from "react";
import { Container, Paper, Typography } from "@mui/material";
import MeetingDealNoteCreate from "./MeetingDealNoteCreate";

const DealMeetingNotesMain: React.FC = () => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 1.5, md: 2 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Typography
        variant="body2"
      sx={{
        fontWeight: 500,
        color: "#FFFFFF",
        fontSize: { xs: "1rem", sm: "1.2rem" },
        backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "20px",
      }}
    >
        Welcome to 📊 Deal Meeting Notes
    </Typography>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          backgroundColor: "rgba(0,32,96,0.05)",
          border: "1px solid rgba(0,32,96,0.12)",
        }}
      >
        <MeetingDealNoteCreate />
      </Paper>
    </Container>
  );
};

export default DealMeetingNotesMain;
