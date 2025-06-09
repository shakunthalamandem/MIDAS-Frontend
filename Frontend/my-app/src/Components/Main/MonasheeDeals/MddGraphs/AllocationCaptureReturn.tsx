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
} from "@mui/material";

const AllocationCaptureReturn = () => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Mirror Glass Style Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backdropFilter: "blur(50px)",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            borderRadius: 4,
            color: "#fff",
            p: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.25rem",
            color: "#8b037f",
            textAlign: "center",
          }}
        >
          GAP Analysis Info
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "1rem",
              textAlign: "justify",
              color: "#FFF",
              padding: "8px 0",
              lineHeight: 1.6,
            }}
          >
            As for the below GAP Analysis, we have assumed that 0.5% IPO
            Allocation, 1% for FO Allocation, and 0.5% AM for both IPOs and
            FOs. There is a Position limit of $30M. Also note that, for each
            year deals issued in that year are considered, and the EXIT date
            for actual PnL could be in future years. For Model, the EXIT date
            is always T+1Month. This analysis excludes SPACs and PIPEs.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
              color: "#fff",
              backgroundColor: "#002060",
              px: 3,
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
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        sx={{
          width: "100%",
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#f4f6fa",
          minHeight: "100vh",
          p: 2,
        }}
      >
        <MddMain apiName="gap_analysis" />
      </Box>
    </>
  );
};

export default AllocationCaptureReturn;
