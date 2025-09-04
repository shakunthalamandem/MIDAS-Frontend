import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  Alert,
  Snackbar,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { format } from "date-fns";
import DealInformation from "../DealFormDataTabs/DealInformation";
import DealAllocations from "../DealFormDataTabs/DealAllocations";
import MarketData from "../DealFormDataTabs/MarketData";
import TechnicalMarketData from "../DealFormDataTabs/TechnicalMarketData";
import DealColor from "../DealFormDataTabs/DealColor";
import axios from "axios";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";

interface FormData {
  deal_information: Record<string, any>;
  deal_allocations: Record<string, any>;
  market_data: Record<string, any>;
  technical_market_data: Record<string, any>;
  deal_color: Record<string, any>;
}

interface Props {
  formData: FormData;
  isCreate: boolean;
  selectedTicker: string;
}

const DealFormDataTabsMain: React.FC<Props> = ({
  formData,
  isCreate,
  selectedTicker,
}) => {
  const [editable, setEditable] = useState<boolean>(isCreate);
  const [localData, setLocalData] = useState<FormData>(formData);
  const [originalData] = useState<FormData>(formData);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (isCreate) {
      const emptyData: FormData = {
        deal_information: {},
        deal_allocations: {},
        market_data: {},
        technical_market_data: {},
        deal_color: {},
      };
      setLocalData(emptyData);
      setEditable(true);
    } else {
      setLocalData(formData);
      setEditable(false);
    }
  }, [isCreate, formData]);

  const handleSave = async () => {
    setLoading(true); // Start loading
    try {
      console.log("Saving data:", localData);


      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const url = isCreate
        ? `${apiUrl}/api/create_newdeal_form/`
        : `${apiUrl}/api/update_deal_unified_data/`;

      // Build payload conditionally
      const payload = isCreate
        ? { ...localData } // for create, just send the data
        : {
            operation: "new_deal_update",
            data: localData,
          };

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        setEditable(false);
        setSnackbar({
          open: true,
          message: isCreate
            ? "Deal created successfully!"
            : "Deal updated successfully!",
          severity: "success",
        });
      } else {
        throw new Error("Unexpected response");
      }
    } catch (error) {
      console.error("Save failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to save deal. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };
console.log("Original Data:", originalData);
  const handleCancel = () => {
    setLocalData(originalData);
    setEditable(false);
  };

  const handleReset = () => {
    const emptyData: FormData = {
      deal_information: {},
      deal_allocations: {},
      market_data: {},
      technical_market_data: {},
      deal_color: {
        top_allocation: "top 10",
      },
    };
    setLocalData(emptyData);
  };

  const handleEdit = () => {
    setEditable(true);
  };

  const updateSection = (
    section: keyof FormData,
    data: Record<string, any>
  ) => {
    setLocalData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const gradientBackground = {
    background:
      "linear-gradient(135deg, #A3B5E7 0%, #B9D7F4 25%, #CFF2FA 50%, #E3FAFF 75%, #F5FCFF 100%)",
    padding: 2,
    borderRadius: 4,
    boxShadow: 3,
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        {/* Title */}
<Typography
  variant="h6"
  color="#002060"
  sx={{
    fontWeight: 600,
    textAlign: "center",
    flex: 1,
  }}
>
  {isCreate
    ? "New Deal Setup — Complete the required details below."
    : `Deal Overview & Key Analytics - ${
        formData.deal_information?.issuer_name
      } (${selectedTicker || "N/A"}) on ${
        formData.deal_information?.pricing_date
          ? (() => {
              const rawDate = formData.deal_information.pricing_date;
              const dateStr = typeof rawDate === "string" ? rawDate.trim().toLowerCase() : "";
              if (!rawDate || dateStr === "to be announced") {
                return "To be Announced";
              }
              try {
                return format(new Date(rawDate), "dd MMM yyyy");
              } catch {
                return "To be Announced";
              }
            })()
          : "To be Announced"
      }`}
</Typography>


        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {editable ? (
            <>
              {/* Save */}
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : isCreate ? (
                    <AddIcon />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={loading}
                sx={{
                  background: "linear-gradient(to right, #0061a8, #00c6a7)",
                  color: "#fff",
                  fontWeight: 500,
                  px: 3,
                  borderRadius: "12px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                  "&:hover": {
                    background: "linear-gradient(to right, #004c82, #009e85)",
                  },
                }}
              >
                {loading ? "Saving..." : isCreate ? "Save" : "Save Changes"}
              </Button>

              {/* Cancel */}
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                disabled={loading}
                sx={{
                  borderColor: "#0061a8",
                  color: "#0061a8",
                  fontWeight: 500,
                  px: 3,
                  borderRadius: "12px",
                  "&:hover": {
                    borderColor: "#004c82",
                    backgroundColor: "#f0f6ff",
                  },
                }}
              >
                Cancel
              </Button>

              {/* Reset */}
              <Button
                variant="outlined"
                color="warning"
                onClick={handleReset}
                startIcon={<RestartAltIcon />}
                disabled={loading}
                sx={{
                  fontWeight: 500,
                  px: 3,
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "#fff8e1",
                  },
                }}
              >
                Reset
              </Button>
            </>
          ) : (
            /* Edit button */
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={loading}
              sx={{
                px: 3,
                fontWeight: 500,
                borderRadius: "12px",
                background: "linear-gradient(to right, #0061a8, #00c6a7)",
                color: "#fff",
                "&:hover": {
                  background: "linear-gradient(to right, #004c82, #009e85)",
                },
              }}
            >
              Edit
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={6} mb={4}>
          <Box sx={{ ...gradientBackground, height: "100%" }}>
            <DealInformation
              data={localData?.deal_information || {}}
              editable={editable}
              onChange={(data) => updateSection("deal_information", data)}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6} mb={4}>
          <Box sx={{ ...gradientBackground, height: "100%" }}>
            <DealAllocations
              data={localData?.deal_allocations || {}}
              editable={editable}
              onChange={(data) => updateSection("deal_allocations", data)}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6} mb={4}>
          <Box sx={{ ...gradientBackground, height: "100%" }}>
            <MarketData
              data={localData?.market_data || {}}
              editable={editable}
              onChange={(data) => updateSection("market_data", data)}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6} mb={4}>
          <Box sx={{ ...gradientBackground, height: "100%" }}>
            <TechnicalMarketData
              data={localData?.technical_market_data || {}}
              editable={editable}
              onChange={(data) => updateSection("technical_market_data", data)}
            />
          </Box>
        </Grid>

        <Grid item xs={12} mb={4}>
          <Box sx={gradientBackground}>
            <DealColor
              data={localData?.deal_color || {}}
              editable={editable}
              onChange={(data) => updateSection("deal_color", data)}
            />
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DealFormDataTabsMain;
