import { useEffect, useState } from "react";
import {
  Box,
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
} from "@mui/material";
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
    filterOptions.find((option) => option.value === selectedFilters) ||
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

      const response = await fetch(`${apiUrl}/api/gap_analysis/`, {
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
          borderRadius: "8px",
          boxShadow: 3,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          marginX: 6,
        }}
      >
        <FormGroup row sx={{ display: "flex", justifyContent: "center" }}>
          <RadioGroup
            value={selectedFilter.value}
            onChange={(e) =>
              setSelectedFilter(
                filterOptions.find((option) => option.value === e.target.value)!
              )
            }
            row
          >
                 {filterOptions.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={
            <Radio
              sx={{
                color: "white",
                "&.Mui-checked": {
                  color: "#ff8c00",
                },
              }}
            />
          }
          label={option.label}
          sx={{
            color: "white",
            marginRight: 4,
            "& .MuiRadio-root": {
              color: "white",
            },
            "&.Mui-checked": {
              color: "#ff8c00",
            },
            "& .MuiFormControlLabel-label": {
              color: "white",
            },
            "& .Mui-checked + .MuiFormControlLabel-label": {
              color: "#ff8c00",
            },
          }}
        />
      ))}
          </RadioGroup>
        </FormGroup>
      </Box>

      {loading && (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <CircularProgress />
  </Box>
)}      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && data && (
        <Box sx={{ width: "100%", marginTop: 2, textAlign: "center" }}>
          {selectedFilter.value === "deal_type" && (
            <DealTypeComponent data={data || {}} selectedFilters={selectedFilters || {}} />
          )}
          {selectedFilter.value === "sector" && (
            <SectorRegionComponent
              data={data || {}}
              option={selectedFilter.label}
            />
          )}
          {selectedFilter.value === "region" && (
            <SectorRegionComponent
              data={data || {}}
              option={selectedFilter.label}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default Gap;
