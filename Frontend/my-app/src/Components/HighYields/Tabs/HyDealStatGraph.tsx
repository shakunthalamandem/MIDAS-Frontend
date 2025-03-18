import { Card, Container, Checkbox, FormControlLabel, FormControl, FormLabel } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// Number formatting function
const formatNumber = (value: number): string => {
  const absValue = Math.abs(value); // Get the absolute value for formatting
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed(0)}B`; // Format billions
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(0)}M`; // Format millions
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed(0)}K`; // Format thousands
  } else {
    formattedValue = absValue.toString(); // Default format
  }

  return value < 0 ? `-$${formattedValue}` : `$${formattedValue}`; // Ensure dollar sign is correctly placed
};

interface SelectedFilters {
  // Define the structure of selectedFilters here
  [key: string]: any;
}

const HyDealStatGraph = ({ selectedFilters }: { selectedFilters: SelectedFilters }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const [selectedMetric, setSelectedMetric] = useState("count"); // Default metric is "count"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/high_yields_graph/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        setData(result.main_aggregation);
      } catch (error) {
        setError((error as any).message);
        navigate("/error");  

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Handle checkbox changes (ensuring only one checkbox is selected at a time)
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMetric(event.target.name); // Set the selected metric to the checkbox name
  };

  // Get data key based on selected metric
  const getDataKey = () => {
    switch (selectedMetric) {
      case "deal_value":
        return "deal_value";
      case "opp_value":
        return "opp_value";
      default:
        return "count"; // Default to deal count
    }
  };

  // Format the tooltip value
  const CustomTooltip = ({ payload }: any) => {
    if (payload && payload.length) {
      const { year, count, deal_value, opp_value } = payload[0].payload;
      const value =
        getDataKey() === "deal_value"
          ? deal_value
          : getDataKey() === "opp_value"
          ? opp_value
          : count;
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #ddd",
            width: "150px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0 }}>{`Year: ${year}`}</p>
          <p style={{ margin: 0 }}>{`Value: ${formatNumber(value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Container>
      <Card sx={{ mt: 2, mb: 2, padding: 10 }}>
        {/* Centered Checkboxes */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <FormControl component="fieldset">
            <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMetric === "count"}
                    onChange={handleCheckboxChange}
                    name="count"
                  />
                }
                label="Deal Count"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMetric === "deal_value"}
                    onChange={handleCheckboxChange}
                    name="deal_value"
                  />
                }
                label="Deal Volume"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMetric === "opp_value"}
                    onChange={handleCheckboxChange}
                    name="opp_value"
                  />
                }
                label="Opportunity Value"
              />
            </div>
          </FormControl>
        </div>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(tick) => formatNumber(tick)} /> {/* Format Y Axis Labels */}
            <Tooltip content={<CustomTooltip />} />
            {/* Render bars based on selected metric */}
            {selectedMetric === "count" && <Bar type="monotone" dataKey="count" fill="#8884d8" />}
            {selectedMetric === "deal_value" && <Bar type="monotone" dataKey="deal_value" fill="#82ca9d" />}
            {selectedMetric === "opp_value" && <Bar type="monotone" dataKey="opp_value" fill="#ffc658" />}
            {selectedMetric === "opp_value" && (
              <ReferenceLine y={0} stroke="#000" strokeWidth={2} /> // Solid line at $0 for Opportunity Value
            )}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Container>
  );
};

export default HyDealStatGraph;
