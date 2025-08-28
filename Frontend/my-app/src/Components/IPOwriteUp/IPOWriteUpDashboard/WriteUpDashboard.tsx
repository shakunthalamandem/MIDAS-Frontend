import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import WriteUpFilters from "./WriteUpFilters";
import DealsTable from "../../Main/NewDealsLifeCycle/DealsTable";


const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

const WriteUpDashboard: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOp, setSelectedOp] = useState("next 2 weeks");
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

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


      <WriteUpFilters selectedOp={selectedOp} onChange={setSelectedOp} />

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto" }} />
      ) : (
        <DealsTable
          rows={rows}
          loading={loading}
          onRowSelect={(row) => setSelectedDeal(row)}
        />
      )}

    </Container>
  );
};

export default WriteUpDashboard;
