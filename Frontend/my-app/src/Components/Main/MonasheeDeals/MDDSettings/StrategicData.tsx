import {
  Box,
  Card,
  Container,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import StrategicDealTable from "./StrategicDealTable";

// Add the prop type for StrategicDealTable
interface StrategicDealTableProps {
  data: any;
}

interface StrategicDataProps {
  filters: {
    deal_type: string[];
    broad_region: string[];
    week: number[];
    fo_type: string[]; // Still unused unless backend supports it
  };
}

const StrategicData: React.FC<StrategicDataProps> = ({ filters }) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) throw new Error("API URL is not defined in environment variables");

      const body = {
        broad_region: filters.broad_region.length > 0 ? filters.broad_region : undefined,
        deal_type: filters.deal_type.length > 0 ? filters.deal_type : undefined,
        week: filters.week.length > 0 ? filters.week : undefined,
      };

      const response = await fetch(`${apiUrl}/api/strategic_weekly_table/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const result = await response.json();
      if (response.ok) {
        setData(result);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 0 }} id="details-section">
      <Card sx={{ boxShadow: 3, p: 3, mb: 2 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <StrategicDealTable data={data} />
          </>
        )}
      </Card>
    </Container>
  );
};

export default StrategicData;
