import React, { useEffect, useState } from "react";
import { Container, Typography, CircularProgress } from "@mui/material";
import DealsFilters from "./DealsFilters";
import DealsTable from "./DealsTable";

const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

interface Props {
  onDealSelect: (deal: any) => void;
}

const NewDealsUpcomingRecent: React.FC<Props> = ({ onDealSelect }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOp, setSelectedOp] = useState("next 2 weeks");

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
        <DealsTable rows={rows} loading={loading} onRowSelect={onDealSelect} />
      )}
    </Container>
  );
};

export default NewDealsUpcomingRecent;
