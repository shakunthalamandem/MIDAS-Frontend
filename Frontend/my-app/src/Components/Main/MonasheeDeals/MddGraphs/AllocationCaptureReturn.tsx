import React, { useState } from "react";
import MddMain from "../MDDSettings/MddMain";
import {
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";

const AllocationCaptureReturn: React.FC = () => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            boxShadow: theme.shadows[4],
            p: 2,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.25rem",
            color: theme.palette.primary.main,
            textAlign: "center",
            pb: 0,
          }}
        >
          GAP Analysis - Model Assumptions
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              lineHeight: 1.6,
              textAlign: "justify",
              mt: 1,
            }}
          >
            The following assumptions are used for this GAP Analysis:
          </Typography>
          <ul style={{ paddingLeft: "1.25rem", margin: "0.5rem 0" }}>
            <li><strong>IPO Allocation:</strong> 0.5%</li>
            <li><strong>FO (Follow-On) Allocation:</strong> 1%</li>
            <li><strong>After Market (AM):</strong> 0.5% for both IPOs and FOs</li>
            <li><strong>Position Limit:</strong> $30M</li>
            <li><strong>Stop Loss:</strong> -10% for IPO and FO trades</li>
          </ul>
          <Typography variant="body2" sx={{ mt: 1 }}>
            For Model Assumptions, <strong>After Market Allocation is not applicable</strong> for IPOs of type
            <strong> Moonshot</strong> or <strong>Deathstar</strong>.
            <br /><br />
            Only deals issued within the year are considered. While actual PnL exits may happen in later years,
            the model assumes an exit at <strong>T+1 month</strong> from issuance.
            <br /><br />
            <strong>Note:</strong> SPACs and PIPEs are excluded.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mt: 1 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              px: 4,
              py: 0.75,
              fontSize: "0.95rem",
            }}
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Content */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          py: 3,
          px: isMobile ? 2 : 4,
        }}
      >
        <MddMain apiName="gap_analysis" />
      </Box>
    </>
  );
};

export default AllocationCaptureReturn;
