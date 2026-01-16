import React from "react";
import { Box, Paper, Stack } from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import type { CapitalStructure, MeetingOverview, InvestmentSnapshot } from "./MeetingNoteFormTypes";
import { LabeledTextField } from "./MeetingNoteFormFields";
import { headerBg, sectionCardSx, SectionHeader } from "./MeetingNoteFormShared";

type AttendeesCardProps = {
  meetingOverview: MeetingOverview;
  setMeetingOverview: React.Dispatch<React.SetStateAction<MeetingOverview>>;
  investmentSnapshot: InvestmentSnapshot;
  setInvestmentSnapshot: React.Dispatch<React.SetStateAction<InvestmentSnapshot>>;
  capitalStructure: CapitalStructure;
  setCapitalStructure: React.Dispatch<React.SetStateAction<CapitalStructure>>;
  isEditing: boolean;
};

const AttendeesCard: React.FC<AttendeesCardProps> = ({
  meetingOverview,
  setMeetingOverview,
  investmentSnapshot,
  setInvestmentSnapshot,
  capitalStructure,
  setCapitalStructure,
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
      <SectionHeader icon={<PeopleAltOutlinedIcon fontSize="small" />} title="Attendees" />
    </Box>
    <Stack spacing={1} sx={{ padding: 2, flex: 1 }}>
      <LabeledTextField
        label="Management"
        value={meetingOverview.attendees}
        onChange={(val) => setMeetingOverview((prev) => ({ ...prev, attendees: val }))}
        isEditing={isEditing}
        options={{ multiline: true }}
      />
      <LabeledTextField
        label="Banker"
        value={meetingOverview.bankerAttendees}
        onChange={(val) => setMeetingOverview((prev) => ({ ...prev, bankerAttendees: val }))}
        isEditing={isEditing}
        options={{ multiline: true }}
      />
      <LabeledTextField
        label="IPO Lock up Expiry"
        value={capitalStructure.ipoLockupExpiry}
        onChange={(val) => setCapitalStructure((prev) => ({ ...prev, ipoLockupExpiry: val }))}
        isEditing={isEditing}
        options={{ type: "date" }}
      />
      <LabeledTextField
        label="Last deal lock up expiry"
        value={capitalStructure.lastDealLockupExpiry}
        onChange={(val) =>
          setCapitalStructure((prev) => ({ ...prev, lastDealLockupExpiry: val }))
        }
        isEditing={isEditing}
        options={{ type: "date" }}
      />
      <LabeledTextField
        label="Results"
        value={investmentSnapshot.results}
        onChange={(val) => setInvestmentSnapshot((prev) => ({ ...prev, results: val }))}
        isEditing={isEditing}
        options={{ type: "date" }}
      />
    </Stack>
  </Paper>
);

export default AttendeesCard;
