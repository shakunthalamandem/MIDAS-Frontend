import React, { useEffect, useState } from "react";
import { Container, Typography, CircularProgress, Grid, Paper } from "@mui/material";
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
    { value: "live", label: "Live Deals", helper: "Issued within last 30 days" },
    { value: "upcoming", label: "Upcoming Deals", helper: "Filed but not issued" },
    { value: "pipeline", label: "Future Pipeline", helper: "Not filed" },
  ];
  const [selectedOp, setSelectedOp] = useState<string>(tabs[0].value);
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
    <Container maxWidth="xl" sx={{ mb: 4, mt: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,32,96,0.12)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,248,255,0.96))",
          boxShadow: "0 14px 40px rgba(0,32,96,0.1)",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          color="#002060"
          align="center"
          fontWeight={700}
        >
          New Deals Lifecycle
        </Typography>

        <DealsFilters selectedOp={selectedOp} onChange={handleOpChange} options={tabs} />
      </Paper>

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
