import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import DealsFilters from "./DealsFilters";
import DealsTable from "./DealsTable";
import AIMLModelPredictionInfo from "./DealsCyclesSections/AIMLModelPredictionInfo";
import DealColorInfo from "./DealsCyclesSections/DealColorInfo";
import DealWriteUpInfo from "./DealsCyclesSections/DealWriteUpInfo";
import DealIoiValuesTable from "./DealsCyclesSections/DealIoiValuesTable";



const NewDealsUpcomingRecent: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOp, setSelectedOp] = useState("next 2 weeks");
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

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
      setSelectedDeal(null); // clear old selection on filter change
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedOp);
  }, [selectedOp]);

  return (
    <Container maxWidth="xl" sx={{ mb: 4, mt: 2 }}>
      <Typography
        variant="h5"
        gutterBottom
        color="#002060"
        align="center"
        fontWeight={600}
      >
        New Deals - Upcoming & Recent
      </Typography>

      <DealsFilters selectedOp={selectedOp} onChange={setSelectedOp} />

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto" }} />
      ) : (
        <DealsTable
          rows={rows}
          loading={loading}
          onRowSelect={(row) => setSelectedDeal(row)}
        />
      )}

      {selectedDeal && (
        <><Grid container spacing={2} mt={2}>
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
        
          <Grid item xs={12}>
            <DealIoiValuesTable data={selectedDeal} />
          </Grid>
        </>
      )}
    </Container>
  );
};

export default NewDealsUpcomingRecent;
