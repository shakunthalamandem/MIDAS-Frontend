import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface WeeklyFiltersDataProps {
  apiName: string;
}

interface Filter {
  id: string;
  name: string;
  [key: string]: any;
}

const WeeklyFiltersData: React.FC<WeeklyFiltersDataProps> = ({ apiName }) => {
  const [filtersData, setFiltersData] = useState<Filter[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate(); 

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/weekly_stat_filters/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch filters: ${response.statusText}`);
        }

        const data = await response.json();
        setFiltersData(data || []);
      } catch (error) {
        console.error("Error loading filters:", error);
        navigate("/error");  
      }
    };

    fetchFilters();
  }, []);

  return (
    <div>
      <h1>Weekly Filters Data</h1>
      <pre>{JSON.stringify(filtersData, null, 2)}</pre>
    </div>
  );
};

export default WeeklyFiltersData;
