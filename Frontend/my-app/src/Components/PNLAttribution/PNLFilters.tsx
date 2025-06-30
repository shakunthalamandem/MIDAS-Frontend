import React, { useEffect, useState } from "react";
import {
  Box,
  Autocomplete,
  Checkbox,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Fade,
  Container,
  Chip,
} from "@mui/material";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import GraphicalRepresent from "./PNLCharts/GraphicalRepresent";

// Filter type
type Filters = {
  fund: string[];
  asset_type: string[];
  deal_type: string[];
  broad_region: string[];
};

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const PNLFilters: React.FC = () => {
  const [filters, setFilters] = useState<Filters | null>(null);

  // Selected filter values by user
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    fund: [],
    asset_type: [],
    deal_type: [],
    broad_region: [],
  });

  // Applied filters (used by GraphicalRepresent)
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    fund: [],
    asset_type: [],
    deal_type: [],
    broad_region: [],
  });

  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/daily_trades_filters/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch filters: ${response.statusText}`);
        }

        const data = await response.json();

        const withAll = Object.fromEntries(
          Object.entries(data).map(([key, values]) => [
            key,
            ["All", ...(values as string[])],
          ])
        );
        setFilters(withAll as Filters);
      } catch (error) {
        console.error("Error loading filters:", error);

      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [apiUrl, token, navigate]);

  // Handle filter selection
  const handleChange = (key: keyof Filters) => (_: any, value: string[]) => {
    const allOptions = filters?.[key] ?? [];

    if (value.includes("All")) {
      setSelectedFilters((prev) => ({
        ...prev,
        [key]: allOptions.filter((v) => v !== "All"),
      }));
    } else {
      setSelectedFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleApply = () => {
    setAppliedFilters({ ...selectedFilters });
  };

  const handleReset = () => {
    const empty: Filters = {
      fund: [],
      asset_type: [],
      deal_type: [],
      broad_region: [],
    };
    setSelectedFilters(empty);
    setAppliedFilters(empty);
  };

  const filterOptions = [
    { label: "Funds", key: "fund" },
    { label: "Asset Type", key: "asset_type" },
    // { label: "Deal Type", key: "deal_type" },
    { label: "Broad Region", key: "broad_region" },
  ] as const;

  // Loading spinner for initial filter fetch
  if (loading || !filters) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: "#f6e9c6",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            color="#016676"
            fontWeight="bold"
            gutterBottom
          >
            PNL Summary Graphs{" "}
          </Typography>

<Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    justifyContent: "center",
  }}
>
  {filterOptions.map(({ label, key }) => (
    <Autocomplete
      key={key}
      multiple
      disableCloseOnSelect
      options={filters[key] || []}
      value={selectedFilters[key]}
      onChange={handleChange(key)}
      getOptionLabel={(option) => option}
      size="small"
      sx={{ width: "100%", maxWidth: 320 }}
      renderTags={(selected, getTagProps) => {
        if (selected.length === 0) return [];

        const first = selected[0];
        const extraCount = selected.length - 1;
        const label =
          extraCount > 0 ? `${first} +${extraCount}` : first;

        return [
          <Chip
            key={label}
            label={label}
            size="small"
            sx={{ fontSize: "0.8rem" }}
          />,
        ];
      }}
renderOption={(props, option, { selected }) => {
  const keySelected = selectedFilters[key as keyof Filters]; // Current selected values
  const allOptions = filters?.[key as keyof Filters] ?? [];
  const isAllOption = option === "All";

  const isAllSelected =
    isAllOption &&
    keySelected.length > 0 &&
    keySelected.length === allOptions.length - 1; // all except "All"

  return (
    <Box component="li" {...props} sx={{ display: "flex", alignItems: "center" }}>
      <Checkbox
        icon={icon}
        checkedIcon={checkedIcon}
        checked={isAllSelected || (selected && !isAllOption)}
        sx={{ mr: 1 }}
      />
      <Typography variant="body2">{option}</Typography>
    </Box>
  );
}}


      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          placeholder={`Select ${label}`}
        />
      )}
    />
  ))}

  <Box
    sx={{
      display: "flex",
      gap: 1,
      width: 220,
      justifyContent: "space-between",
    }}
  >
    <Button
      variant="outlined"
      color="secondary"
      fullWidth
      onClick={handleReset}
      sx={{
        borderColor: "#002060",
        color: "#002060",
        "&:hover": {
          backgroundColor: "#002060",
          color: "#fff",
        },
      }}
    >
      Reset
    </Button>

    <Button
      variant="contained"
      fullWidth
      onClick={handleApply}
      sx={{
        backgroundColor: "#002060",
        "&:hover": {
          backgroundColor: "#003080",
        },
      }}
    >
      Apply
    </Button>
  </Box>
</Box>


        <GraphicalRepresent appliedFilters={appliedFilters} />
      </Box>
    </Container>
  );
};

export default PNLFilters;
