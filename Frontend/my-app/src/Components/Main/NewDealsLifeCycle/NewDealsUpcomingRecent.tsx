import React, { useEffect, useState } from "react";
import { Container, Typography, CircularProgress, Grid, Paper } from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DealsFilters from "./DealsFilters";
import DealsTable from "./DealsTable";
import AIMLModelPredictionInfo from "./DealsCyclesSections/AIMLModelPredictionInfo";
import DealColorInfo from "./DealsCyclesSections/DealColorInfo";
import DealWriteUpInfo from "./DealsCyclesSections/DealWriteUpInfo";
import DealIoiValuesTable from "./DealsCyclesSections/DealIoiValuesTable";
import DealInfoContainer from "./DealInfoContainer";
import ExpectedPipelineDealsTable from "../../UpcomingPipelineDeals/ExpectedPipelineDealsTable";

const NewDealsUpcomingRecent: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const tabs = [
    {
      value: "upcoming",
      label: "Upcoming Deals",
      helper: "Filed but not issued",
      icon: <EventAvailableIcon fontSize="small" sx={{ color: "#1565C0" }} />,
    },
    {
      value: "live",
      label: "Live Deals",
      helper: "Issued within last 30 days",
      icon: <FlashOnIcon fontSize="small" sx={{ color: "#002060" }} />,
    },
    {
      value: "pipeline",
      label: "Future Pipeline",
      helper: "Not filed",
      icon: <RocketLaunchIcon fontSize="small" sx={{ color: "#6F1178" }} />,
    },
  ];
  const [selectedOp, setSelectedOp] = useState<string>("upcoming");
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const opMap: Record<string, string> = {
    live: "Issued September to Date",
    upcoming: "Upcoming Deals",
  };

  const fetchData = async (operation: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ operation }),
      });
      const result = await response.json();
      const formattedRows = result.data.map((item: any, index: number) => ({
        id: index,
        ...item,
      }));
      setRows(formattedRows);
      setSelectedDeal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOp === "pipeline") {
      setRows([]);
      setSelectedDeal(null);
      return;
    }
    const apiOperation = opMap[selectedOp] || selectedOp;
    fetchData(apiOperation);
  }, [selectedOp]);

  const handleOpChange = (value: string) => {
    setSelectedOp(value);
  };

  const isPipelineView = selectedOp === "pipeline";

  return (
    <Container
      maxWidth="xl"
      sx={{
        mb: 4,
        mt: 2,
        position: "relative",
        pb: 4,
        px: { xs: 1.5, md: 2 },
        backgroundColor: "rgba(21,101,192,0.05)",
        borderRadius: 3,
      }}
    >
      {/* <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,32,96,0.12)",
          backgroundColor: "#fff",
          boxShadow: "0 10px 28px rgba(0,32,96,0.12)",
        }}
      > */}
        {/* <Typography
          variant="h5"
          gutterBottom
          color="#002060"
          align="center"
          fontWeight={800}
          sx={{
            width: "100%",
            px: 2,
            py: 0.75,
            borderRadius: 2,
            // backgroundColor: "rgba(0,32,96,0.08)",
            letterSpacing: "0.02em",
            textAlign: "center",
          }}
        >
          New Deals Lifecycle
        </Typography> */}
        {/* <Typography
          variant="body2"
          color="rgba(0,32,96,0.75)"
          align="center"
          sx={{ mt: 0.5, mb: 1 }}
        >
          Track live, upcoming, and future pipeline activity in one glance.
        </Typography> */}

        <DealsFilters selectedOp={selectedOp} onChange={handleOpChange} options={tabs} />
      {/* </Paper> */}

      {isPipelineView ? (
        <ExpectedPipelineDealsTable />
      ) : loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto" }} />
      ) : (
        <DealsTable
          rows={rows}
          loading={loading}
          onRowSelect={(row) => setSelectedDeal(row)}
          selectedOp={selectedOp}
        />
      )}

      {!isPipelineView && selectedDeal && (
        <>
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={4}>
              <DealColorInfo data={selectedDeal} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DealWriteUpInfo data={selectedDeal} />
            </Grid>
            <Grid item xs={12} md={4}>
              <AIMLModelPredictionInfo data={selectedDeal} />
            </Grid>
          </Grid>

          <Grid item xs={12} md={4} mb={4}>
            <DealIoiValuesTable data={selectedDeal} />
            {/* <DealUnifiedSummaryTableDashboard data={selectedDeal} /> */}
            <DealInfoContainer selectedDeal={selectedDeal} />
          </Grid>
        </>
      )}
    </Container>
  );
};

export default NewDealsUpcomingRecent;
