import {
  Box,
  Card,
  Container,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import WeeklyDealTable from "../../MonasheeDeals/MDDSettings/WeeklyDealTable";

interface WeekelyMDDProps {
  selectedWeek: string | null;
}

const WeekelyMDD: React.FC<WeekelyMDDProps> = ({ selectedWeek }) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [appliedRegions, setAppliedRegions] = useState<string[]>([]);
  const [appliedDealTypes, setAppliedDealTypes] = useState<string[]>(["FO", "IPO"]);
  const [appliedWeeks, setAppliedWeeks] = useState<number[]>([]);

  useEffect(() => {
    if (selectedWeek) {
      const weekNumber = parseInt(selectedWeek.replace("W", ""));
      setAppliedRegions([]);
      setAppliedDealTypes([]);
      setAppliedWeeks([weekNumber]);
    }
  }, [selectedWeek]);

  useEffect(() => {
    fetchData();
  }, [appliedRegions, appliedDealTypes, appliedWeeks]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const body = {
        broad_region: appliedRegions,
        deal_type: appliedDealTypes,
        week: appliedWeeks,
      };

      const response = await fetch(`${apiUrl}/api/weekly_dealstat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        if (typeof result === "object" && result !== null) {
          const filteredResult = Object.keys(result).reduce((acc, regionKey) => {
            const regionData = result[regionKey];
            if (typeof regionData === "object" && regionData !== null) {
              const filteredCategories = Object.keys(regionData).reduce(
                (catAcc, catKey) => {
                  if (catKey !== "Strategic") {
                    catAcc[catKey] = regionData[catKey];
                  }
                  return catAcc;
                },
                {} as any
              );
              acc[regionKey] = filteredCategories;
            } else {
              acc[regionKey] = regionData;
            }
            return acc;
          }, {} as any);

          setData(filteredResult);
        } else {
          setData(result);
        }
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };
const handleCardClick = () => {
  window.open("/equity/monashee-deals/weekly-tracking", "_blank");
};

return (
<> 
      <Typography
        variant="h6"
        color="#004d2a"
        fontWeight="bold"
        align="center"
        gutterBottom
        sx={{ mb: 2 }}
         onClick={handleCardClick}
      >
        2025 YTD GAP Analysis
      </Typography>


    {loading ? (
      <Typography>Loading...</Typography>
    ) : error ? (
      <Typography color="error">{error}</Typography>
    ) : (
      <WeeklyDealTable
        data={data}
        selectedRegions={appliedRegions}
        selectedDealTypes={appliedDealTypes}
      />
    )}
</>  );
};

export default WeekelyMDD;
