import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import GapDataTable from "./GapDataTable";
import { CircularProgress } from "@mui/material";


interface SelectedFilters {
  years?: number[]; // Ensures 'years' is recognized as an optional array of numbers
}

const GapDealDeatilsTable: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");


  let selectedFilters: SelectedFilters = {}; // Explicitly using the typed interface

  try {
    const filters = JSON.parse(searchParams.get("filters") || "{}");
    selectedFilters = filters;
  } catch (error) {
    console.error("Invalid filters format", error);
  }
  selectedFilters.years = [2025];

  useEffect(() => {
    if (!Object.keys(selectedFilters).length) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/api/equity/detailed_gap_analysis/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
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
  }, [searchParams]);
  return (
    <>    
         {loading ? (
        <CircularProgress />
      ) : error ? (
        <p>Error: {error}</p>
      ) : data.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <GapDataTable data={data} />
      )} 
</>
  )
}

export default GapDealDeatilsTable