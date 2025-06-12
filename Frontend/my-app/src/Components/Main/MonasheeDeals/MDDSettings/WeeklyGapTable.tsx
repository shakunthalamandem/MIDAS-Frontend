import { useEffect, useState } from "react";
import GapDataTable from "./DetailedGapDataTable";
import { CircularProgress, Container } from "@mui/material";

interface SelectedFilters {
  deal_type?: string[];
  broad_region?: string[];
  fo_type?: string[];
  week?: number[];
  years?: number[];
}

interface WeeklyGapTableProps {
  filters: SelectedFilters;
}

const WeeklyGapTable: React.FC<WeeklyGapTableProps> = ({ filters }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!filters || Object.keys(filters).length === 0) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const payload = {
          ...filters,
          years: [2025], // Ensure the year is set
        };

        const response = await fetch(`${apiUrl}/api/detailed_gap_analysis/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  return (
    <>
    <Container>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <p>Error: {error}</p>
      ) : data.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <GapDataTable data={data} />
      )}
      </Container>
    </>
  );
};

export default WeeklyGapTable;
