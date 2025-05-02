import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import axios from "axios";
import NewDealFormMainTable from "./NewDealFormMainTable";
import BasicInfo from "./BasicInfo"; 

const NewDealFormMain: React.FC = () => {
  const [ticker, setTicker] = useState("");
  const [launchDate, setLaunchDate] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<{
    ticker: string;
    launch_date: string;
  } | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const handleGetData = () => {
    setSelectedItems({ ticker, launch_date: launchDate });
  };

  const handleReset = () => {
    setTicker("");
    setLaunchDate("");
    setSelectedItems(null);
    setShowNewForm(false);
  };

  return (
    <Box mt={2}>
      <Card sx={{ padding: 2, backgroundColor: "#f9f9f9", boxShadow: 3 }}>
        <Box
          sx={{
            position: "relative",
            mb: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#002060">
            Deal Information Form
          </Typography>
        </Box>

        <CardContent>
        <Grid container spacing={2} alignItems="center">
  <Grid item xs={3}> {/* 4 instead of 3 */}
    <TextField
      label="Ticker Name"
      variant="outlined"
      size="small"
      fullWidth
      value={ticker}
      onChange={(e) => setTicker(e.target.value.toUpperCase())}
    />
  </Grid>
  <Grid item xs={3}> {/* 4 instead of 3 */}
    <TextField
      label="Launch Date"
      type="date"
      variant="outlined"
      size="small"
      fullWidth
      InputLabelProps={{ shrink: true }}
      value={launchDate}
      onChange={(e) => setLaunchDate(e.target.value)}
    />
  </Grid>

  <Grid item xs={2}>
    <Button
      variant="contained"
      fullWidth
      sx={{
        backgroundColor: "#015200",
        "&:hover": {
          backgroundColor: "#001B4D",
        },
      }}
      onClick={handleGetData}
    >
      Get Data
    </Button>
  </Grid>

  <Grid item xs={2}>
    <Button
      variant="outlined"
      fullWidth
      sx={{
        borderColor: "#d32f2f",
        color: "#d32f2f",
        "&:hover": {
          backgroundColor: "#ffebee",
          borderColor: "#b71c1c",
          color: "#b71c1c",
        },
      }}
      onClick={handleReset}
    >
      Reset
    </Button>
  </Grid>
</Grid>

        </CardContent>
      </Card>

      {/* Show table only when Get Data is clicked */}
      {selectedItems && <NewDealFormMainTable selecteditems={selectedItems} />}

      {/* Optional: Show another form */}
      {showNewForm && <BasicInfo />}
    </Box>
  );
};

export default NewDealFormMain;
