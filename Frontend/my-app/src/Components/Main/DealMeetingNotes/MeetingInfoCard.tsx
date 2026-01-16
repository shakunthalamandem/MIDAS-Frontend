import React from "react";
import { Box, Paper, Stack } from "@mui/material";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import type { MeetingOverview } from "./MeetingNoteFormTypes";
import { LabeledTextField } from "./MeetingNoteFormFields";
import { headerBg, sectionCardSx, SectionHeader } from "./MeetingNoteFormShared";

type MeetingInfoCardProps = {
  meetingOverview: MeetingOverview;
  setMeetingOverview: React.Dispatch<React.SetStateAction<MeetingOverview>>;
  isEditing: boolean;
};

const MeetingInfoCard: React.FC<MeetingInfoCardProps> = ({
  meetingOverview,
  setMeetingOverview,
  isEditing,
}) => (
  <Paper sx={{ ...sectionCardSx, minHeight: { xs: 420, md: 460 } }}>
    <Box
      sx={{
        backgroundColor: headerBg,
        borderRadius: 1.5,
        py: 0.75,
        px: 1,
      }}
    >
      <SectionHeader icon={<EventNoteOutlinedIcon fontSize="small" />} title="Meeting Information" />
    </Box>
    <Stack spacing={1} sx={{ padding: 2 }}>
      <LabeledTextField
        label="Ticker"
        value={meetingOverview.ticker}
        onChange={(val) => setMeetingOverview((prev) => ({ ...prev, ticker: val }))}
        isEditing={isEditing}
        options={{
          required: true,
          error: isEditing && !meetingOverview.ticker.trim(),
          helperText: isEditing && !meetingOverview.ticker.trim() ? "Ticker is required." : "",
        }}
      />
      <LabeledTextField
        label="Meeting Name"
        value={meetingOverview.name}
        onChange={(val) => setMeetingOverview((prev) => ({ ...prev, name: val }))}
        isEditing={isEditing}
        options={{
          required: true,
          error: isEditing && !meetingOverview.name.trim(),
          helperText:
            isEditing && !meetingOverview.name.trim() ? "Meeting name is required." : "",
        }}
      />
      <LabeledTextField
        label="Meeting Date"
        value={meetingOverview.date}
        onChange={(val) => setMeetingOverview((prev) => ({ ...prev, date: val }))}
        isEditing={isEditing}
        options={{
          type: "date",
          required: true,
          error: isEditing && !meetingOverview.date.trim(),
          helperText:
            isEditing && !meetingOverview.date.trim() ? "Meeting date is required." : "",
        }}
      />
      <LabeledTextField
        label="Location"
        value={meetingOverview.location}
        onChange={(val) => setMeetingOverview((prev) => ({ ...prev, location: val }))}
        isEditing={isEditing}
      />
      <LabeledTextField
        label="Meeting Reason"
        value={meetingOverview.reason}
        onChange={(val) => setMeetingOverview((prev) => ({ ...prev, reason: val }))}
        isEditing={isEditing}
      />
      <LabeledTextField
        label="Broker"
        value={meetingOverview.broker}
        onChange={(val) => setMeetingOverview((prev) => ({ ...prev, broker: val }))}
        isEditing={isEditing}
      />
    </Stack>
  </Paper>
);

export default MeetingInfoCard;
