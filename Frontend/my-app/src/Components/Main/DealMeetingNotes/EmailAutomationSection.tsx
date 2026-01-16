import React from "react";
import { Box, Checkbox, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import type { CapitalStructure } from "./MeetingNoteFormTypes";
import { checkboxSx, headerBg, sectionCardSx, uiFontFamily, SectionHeader, headingColor } from "./MeetingNoteFormShared";

type EmailAutomationSectionProps = {
  capitalStructure: CapitalStructure;
  setCapitalStructure: React.Dispatch<React.SetStateAction<CapitalStructure>>;
  isEditing: boolean;
};

const EmailAutomationSection: React.FC<EmailAutomationSectionProps> = ({
  capitalStructure,
  setCapitalStructure,
  isEditing,
}) => (
  <Paper sx={{ ...sectionCardSx }}>
    <Box
      sx={{
        backgroundColor: headerBg,
        borderRadius: 1.5,
        py: 0.75,
        px: 1,
      }}
    >
      <SectionHeader icon={<EmailOutlinedIcon fontSize="small" />} title="Email Automation" />
    </Box>
    <Paper
      variant="outlined"
      sx={{
        borderColor: "#d9deeb",
        borderRadius: 2,
        p: { xs: 1.5, md: 2 },
        background:
          "linear-gradient(135deg, rgba(11,42,111,0.06) 0%, rgba(255,255,255,0.92) 70%)",
      }}
    >
      <Stack spacing={1.25}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ borderRadius: 1.5, backgroundColor: "#ffffff", px: 1.5, py: 1 }}
        >
          <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
            IPO lockup expiry?
          </Typography>
          <Checkbox
            checked={capitalStructure.ipoLockupExpiryAutomate}
            sx={checkboxSx}
            disabled={!isEditing}
            onChange={(e) =>
              setCapitalStructure((prev) => ({
                ...prev,
                ipoLockupExpiryAutomate: e.target.checked,
              }))
            }
          />
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ borderRadius: 1.5, backgroundColor: "#ffffff", px: 1.5, py: 1 }}
        >
          <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
            Last deal lockup expiry?
          </Typography>
          <Checkbox
            checked={capitalStructure.lastDealLockupExpiryAutomate}
            sx={checkboxSx}
            disabled={!isEditing}
            onChange={(e) =>
              setCapitalStructure((prev) => ({
                ...prev,
                lastDealLockupExpiryAutomate: e.target.checked,
              }))
            }
          />
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ borderRadius: 1.5, backgroundColor: "#ffffff", px: 1.5, py: 1 }}
        >
          <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
            Results?
          </Typography>
          <Checkbox
            checked={capitalStructure.resultsAutomate}
            sx={checkboxSx}
            disabled={!isEditing}
            onChange={(e) =>
              setCapitalStructure((prev) => ({
                ...prev,
                resultsAutomate: e.target.checked,
              }))
            }
          />
        </Stack>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ borderRadius: 1.5, backgroundColor: "#ffffff", px: 1.5, py: 1 }}
        >
          <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
            Key Level
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={1}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <TextField
              value={capitalStructure.keyValueAmount}
              onChange={(e) =>
                setCapitalStructure((prev) => ({
                  ...prev,
                  keyValueAmount: e.target.value,
                }))
              }
              size="small"
              placeholder="$0"
              disabled={!isEditing}
              sx={{
                minWidth: { xs: "100%", md: 140 },
                "& .MuiInputBase-input": {
                  fontFamily: uiFontFamily,
                },
              }}
            />
            <TextField
              select
              value={capitalStructure.keyValueComparator}
              onChange={(e) =>
                setCapitalStructure((prev) => ({
                  ...prev,
                  keyValueComparator: e.target.value,
                }))
              }
              size="small"
              disabled={!isEditing}
              sx={{
                minWidth: { xs: "100%", md: 160 },
                "& .MuiInputBase-input": {
                  fontFamily: uiFontFamily,
                },
              }}
            >
              <MenuItem value="greater">Greater than</MenuItem>
              <MenuItem value="lesser">Lesser than</MenuItem>
            </TextField>
            <Checkbox
              checked={capitalStructure.keyValueAutomate}
              sx={checkboxSx}
              disabled={!isEditing}
              onChange={(e) =>
                setCapitalStructure((prev) => ({
                  ...prev,
                  keyValueAutomate: e.target.checked,
                }))
              }
            />
          </Stack>
        </Stack>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ borderRadius: 1.5, backgroundColor: "#ffffff", px: 1.5, py: 1 }}
        >
          <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
            Whom To send to Email?
          </Typography>
          <TextField
            value={capitalStructure.emailRecipients}
            onChange={(e) =>
              setCapitalStructure((prev) => ({
                ...prev,
                emailRecipients: e.target.value,
              }))
            }
            size="small"
            placeholder="Enter email recipients"
            disabled={!isEditing}
            sx={{
              minWidth: { xs: "100%", md: 260 },
              "& .MuiInputBase-input": {
                fontFamily: uiFontFamily,
              },
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  </Paper>
);

export default EmailAutomationSection;
