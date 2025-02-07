import { useEffect, useState } from "react";
import { Box, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import DealTypeComponent from "./DealTypeComponent";

interface GapProps {
  selectedFilters: any;
}

interface FilterOption {
  label: string;
  value: string;
  payload: any | null;
}

const filterOptions: FilterOption[] = [
  { label: "Deal Type", value: "deal_type", payload: null },
  {
    label: "Sector",
    value: "sector",
    payload: { filter_type: "gics_sector_from_bloomberg" },
  },
  {
    label: "Region",
    value: "region",
    payload: { filter_type: "broad_region" },
  },
];

const Gap: React.FC<GapProps> = ({ selectedFilters }) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(
    filterOptions[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchData();
  }, [selectedFilter, selectedFilters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...selectedFilters,
        ...(selectedFilter.payload || {}),
      };

      const response = await fetch(`${apiUrl}/api/allocation_capture/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`Error ${response.status}: ${response.statusText}`);

      const result = await response.json();
      setData(result);
      console.log("Data", result);
    } catch (error) {
      console.error("Error fetching data", error);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          background: "linear-gradient(to right, #190250, #6DD5ED)",
          padding: 2,
          borderRadius: "8px",
          boxShadow: 3,
          display: "flex",
          flexDirection: "column", // Stack elements vertically
          alignItems: "center",
          width: "70%",
          marginBottom: 4,
          marginX: "auto",
        }}
      >
        <RadioGroup
          value={selectedFilter.value}
          onChange={(e) =>
            setSelectedFilter(
              filterOptions.find((option) => option.value === e.target.value)!
            )
          }
          row
          sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }} // Centers radio buttons
        >
          {filterOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio sx={{ color: "white" }} />}
              label={option.label}
              sx={{
                color: "white",
                marginRight: 4,
                "& .MuiRadio-root": {
                  color: "white",
                },
              }}
            />
          ))}
        </RadioGroup>
      </Box>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Render component based on the selected filter */}
      {!loading && !error && data && (
        <Box
          sx={{
            width: "100%",
            marginTop: 2,
            textAlign: "center",
          }}
        >
          {selectedFilter.value === "deal_type" && (
            <DealTypeComponent data={data || {}} />
          )}
          {selectedFilter.value === "sector" && (
            <h5>We are working on this.</h5>
          )}
          {selectedFilter.value === "region" && (
            <h5>We are working on this.</h5>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Gap;
