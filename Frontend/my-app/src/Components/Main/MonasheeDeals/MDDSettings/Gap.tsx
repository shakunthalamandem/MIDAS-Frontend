import { useEffect, useState } from "react";
import { Box, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import DealTypeComponent from "./DealTypeComponent";
import SectorRegionComponent from "./SectorRegionComponent";

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
  { label: "Sector", value: "sector", payload: { filter_type: "gics_sector_from_bloomberg" } },
  { label: "Region", value: "region", payload: { filter_type: "broad_region" } },
];

const Gap: React.FC<GapProps> = ({ selectedFilters }) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(
    filterOptions.find((option) => option.value === selectedFilters) || filterOptions[0]
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

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

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
        <FormGroup row sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
          {filterOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={selectedFilter.value === option.value}
                  onChange={() => setSelectedFilter(option)}
                  sx={{ color: "#3f51b5" }}
                />
              }
              label={option.label}
              sx={{
                color: "black",
                marginRight: 4,
                "& .MuiCheckbox-root": {
                  color: "black",
                },
              }}
            />
          ))}
        </FormGroup>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && data && (
        <Box sx={{ width: "100%", marginTop: 2, textAlign: "center" }}>
          {selectedFilter.value === "deal_type" && <DealTypeComponent data={data || {}} />}
          {selectedFilter.value === "sector" && <SectorRegionComponent data={data || {}}/>}
          {selectedFilter.value === "region" && <SectorRegionComponent data={data || {}}/>}
        </Box>
      )}
    </Box>
  );
};

export default Gap;
