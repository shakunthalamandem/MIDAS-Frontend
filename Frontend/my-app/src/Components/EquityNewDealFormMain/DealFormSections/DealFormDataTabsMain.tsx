import React, { useState, useEffect } from "react";
import { Box, Button, Stack, Alert, Snackbar, Grid, Typography } from "@mui/material";
import DealInformation from "../DealFormDataTabs/DealInformation";
import DealAllocations from "../DealFormDataTabs/DealAllocations";
import MarketData from "../DealFormDataTabs/MarketData";
import TechnicalMarketData from "../DealFormDataTabs/TechnicalMarketData";
import DealColor from "../DealFormDataTabs/DealColor";
import axios from "axios";
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';


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

const DealFormDataTabsMain: React.FC<Props> = ({ formData, isCreate, selectedTicker }) => {
  const [editable, setEditable] = useState<boolean>(isCreate);
  const [localData, setLocalData] = useState<FormData>(formData);
  const [originalData] = useState<FormData>(formData);
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
    try {
      console.log("Saving data:", localData);

      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const url = isCreate
        ? `${apiUrl}/api/create_newdeal_form/`
        : `${apiUrl}/api/update_new_deal_form/`;

      const payload = { ...localData };

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
    }
  };

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
    background: "linear-gradient(135deg, #A3B5E7 0%, #B9D7F4 25%, #CFF2FA 50%, #E3FAFF 75%, #F5FCFF 100%)",


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
      >
        <Typography variant="h6" color="#3b0090" sx={{ whiteSpace: "nowrap" }}>
          {isCreate
            ? "Creating a new deal – Please fill in the form below."
            : ` ${selectedTicker || "N/A"} – the following data is available for viewing or editing: Deal Information, Deal Allocation, Market Data, Technical Data, and Deal Colour`}
       
        </Typography>
        

        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {editable ? (
            <>
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={isCreate ? <AddIcon /> : <SaveIcon />}
                sx={{
                  background: "linear-gradient(to right, #00b894, #55efc4)",
                  color: "#002060",
                  fontWeight: 500,
                  px: 3,
                  boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    background: "linear-gradient(to right,rgb(0, 70, 56), #0055cc)",
                    color: "#fff",
                  },
                }}
              >
                {isCreate ? "Save" : "Save Changes"}
              </Button>

              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                sx={{
                  borderColor: "#002060",
                  color: "#002060",
                  fontWeight: 500,
                  px: 3,
                  "&:hover": {
                    borderColor: "#003080",
                    backgroundColor: "#f0f4ff",
                  },
                }}
              >
                Cancel
              </Button>

              <Button
                variant="outlined"
                color="warning"
                onClick={handleReset}
                startIcon={<RestartAltIcon />}
                sx={{
                  fontWeight: 500,
                  px: 3,
                  "&:hover": {
                    backgroundColor: "#fff3e0",
                  },
                }}
              >
                Reset
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                px: 3,
                fontWeight: 500,
                background: "#6a1b9a",
                "&:hover": {
                  background: "#7b1fa2",
                },
              }}
            >
              Edit
            </Button>
          )}
        </Stack>
      </Stack>
      <Typography
  variant="caption"
  color="#002060"
  sx={{
    fontSize: "0.95rem", // adjust as needed (e.g., "1rem" or "14px")
    fontStyle: "italic",
  }}
>
  Note: Some of the data fields are empty due to delayed data from Dealogic.
</Typography>

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
