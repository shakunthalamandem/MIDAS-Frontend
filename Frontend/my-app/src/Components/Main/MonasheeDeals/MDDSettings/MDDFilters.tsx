import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Checkbox,
  Card,
  CardContent,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LoadingButton } from "@mui/lab";
import AvgFoDiscountChart from "./AvgFoDiscountChart";
import MDDScreenergrid from "./MDDScreenergrid";
import DealStatsGraph from "./DealStatsGraph";
import Gap from "./Gap";
import BankTable from "./BankTable";

interface FilterOption {
  options: (string | number)[];
  label: string;
  description: string;
}

interface Filter {
  [key: string]: FilterOption;
}

interface FiltersProps {
  filtersData: Filter[];
  apiName: string;
}

const MDDFilters: React.FC<FiltersProps> = ({ filtersData, apiName }) => {
  const [loading, setLoading] = useState(false);
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: (string | number)[];
  }>({});
  const [appliedFilters, setAppliedFilters] = useState<{
    [key: string]: (string | number)[];
  }>({});

  const [payload, setPayload] = useState<{
    [key: string]: (string | number)[];
  }>({});
  const [apiData, setApiData] = useState({});
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchKey, setSearchKey] = useState<string | null>(null);

  useEffect(() => {
    const initialSelectedValues: { [key: string]: (string | number)[] } = {};

    filtersData.forEach((filter) => {
      const key = Object.keys(filter)[0];
      const { options } = filter[key];

      if (key === "fo_type") {
        initialSelectedValues[key] =
          apiName === "mdd_deals_graph"
            ? options.filter((opt) =>
                ["Marketed", "Overnight"].includes(opt.toString())
              )
            : apiName === "gap_analysis"
              ? options.filter((opt) =>
                  ["Marketed", "Overnight", "Block"].includes(opt.toString())
                )
              : [];
      }
    });

    if (
      JSON.stringify(initialSelectedValues) !== JSON.stringify(selectedValues)
    ) {
      setSelectedValues(initialSelectedValues);
      setAppliedFilters(initialSelectedValues);
      handleSubmit(initialSelectedValues);
    }
  }, [filtersData, apiName]); // Added apiName as a dependency

  const handleSelectionChange = (key: string, value: (string | number)[]) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSingleSelectionChange = (key: string, value: string | number) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [key]: [value],
    }));
  };

  const handleSearchChange = (value: string, key: string) => {
    setSearchValue(value.toLowerCase());
    setSearchKey(key);
  };

  const handleSubmit = async (filters = selectedValues) => {
    try {
      setLoading(true);
      const payload: { [key: string]: (string | number)[] } = {};
      Object.keys(filters).forEach((key) => {
        payload[key] = filters[key] || [];
      });

      setPayload(payload);
      setAppliedFilters(filters);

      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await fetch(`${apiUrl}/api/${apiName}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setApiData(result);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (error: any) {
      console.error(error.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const resetSelectedValues: { [key: string]: (string | number)[] } = {};

    filtersData.forEach((filter) => {
      const key = Object.keys(filter)[0];
      const { options } = filter[key];

      if (key === "fo_type") {
        resetSelectedValues[key] =
          apiName === "mdd_deals_graph"
            ? options.filter((opt) =>
                ["Marketed", "Overnight"].includes(opt.toString())
              )
            : apiName === "gap_analysis"
              ? options.filter((opt) =>
                  ["Marketed", "Overnight", "Block"].includes(opt.toString())
                )
              : [];
      }
    });

    setSelectedValues(resetSelectedValues);
    setAppliedFilters(resetSelectedValues);
    setSearchValue("");
    setSearchKey(null);
    handleSubmit(resetSelectedValues);
  };

const renderFilter = (filter: Filter) => {
  const key = Object.keys(filter)[0];
  const { options, label } = filter[key];

  const filteredOptions =
    label === "Lead Bank" && searchKey === key
      ? options.filter((option) =>
          option.toString().toLowerCase().includes(searchValue)
        )
      : options;

    // Special case for Lead Bank (with search)
    if (label === "Lead Bank") {
      return (
        <Box key={key} sx={{ minWidth: 150, maxWidth: 180, flex: "0 0 auto" }}>
          <Typography variant="subtitle2" color="#002060" mb={1} sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Select
            multiple
            value={selectedValues[key] || []}
            onChange={(e) => {
              const value = e.target.value;
              handleSelectionChange(key, typeof value === "string" ? [value] : value);
            }}
            displayEmpty
            size="small"
            sx={{ width: "100%", background: "#e6ebf5" }}
            renderValue={(selected) => {
              if (!selected || (Array.isArray(selected) && selected.length === 0)) {
                return <span style={{ color: "#888" }}>Select {label}</span>;
              }
              if (Array.isArray(selected)) {
                return selected.length > 1
                  ? `${selected[0]} +${selected.length - 1}`
                  : selected[0];
              }
              return selected;
            }}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 300, minWidth: 100 },
              },
            }}
          >
            <MenuItem disableRipple disableTouchRipple disableGutters>
              <TextField
                size="small"
                placeholder="Search"
                autoFocus
                value={searchKey === key ? searchValue : ""}
                onChange={(e) => handleSearchChange(e.target.value, key)}
                sx={{ mb: 1, width: "100%" }}
                onClick={e => e.stopPropagation()}
              />
            </MenuItem>
            {filteredOptions.map((option) => (
              <MenuItem key={option} value={option} sx={{   width :30,}}>
                <Checkbox
                  checked={selectedValues[key]?.includes(option) || false}
                  sx={{
                    color: "#002060",
                    "&.Mui-checked": { color: "#FF8C00" },
                  }}
                />
                {option}
              </MenuItem>
            ))}
          </Select>
        </Box>
      );
    }

    if (key === "period") {
      return (
        <Box key={key} sx={{ minWidth: 150, maxWidth: 180, flex: "0 0 auto" }}>
          <Typography variant="subtitle2" color="#002060" mb={1} sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Select
            value={selectedValues[key]?.[0] || ""}
            onChange={(e) => {
              const value = e.target.value;
              handleSelectionChange(key, [value]);
            }}
            displayEmpty
            size="small"
            sx={{ width: "100%", background: "#e6ebf5" }}
            renderValue={(selected) => {
              if (!selected || selected === "") {
                return <span style={{ color: "#888" }}>Select {label}</span>;
              }
              return selected;
            }}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 300, minWidth: 150 },
              },
            }}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                <Radio
                  checked={selectedValues[key]?.[0] === option}
                  sx={{ color: "#FF8C00" }}
                />
                {option}
              </MenuItem>
            ))}
          </Select>
        </Box>
      );
    }

    if (key === "year") {
      return (
        <Box key={key} sx={{ minWidth: 150, maxWidth: 180, flex: "0 0 auto" }}>
          <Typography variant="subtitle2" color="#002060" mb={1} sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Select
            multiple
            value={selectedValues[key] || []}
            onChange={(e) => {
              const value = e.target.value;
              handleSelectionChange(key, typeof value === "string" ? [value] : value);
            }}
            displayEmpty
            size="small"
            sx={{ width: "100%", background: "#e6ebf5" }}
            renderValue={(selected) => {
              if (!selected || (Array.isArray(selected) && selected.length === 0)) {
                return <span style={{ color: "#888" }}>Select {label}</span>;
              }
              if (Array.isArray(selected)) {
                return selected.length > 1
                  ? `${selected[0]} +${selected.length - 1}`
                  : selected[0];
              }
              return selected;
            }}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 200, minWidth: 150, background: "#f5f5f5" }, // scroll and bg color
              },
            }}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox
                  checked={selectedValues[key]?.includes(option) || false}
                  sx={{
                    color: "#002060",
                    "&.Mui-checked": { color: "#FF8C00" },
                  }}
                />
                {option}
              </MenuItem>
            ))}
          </Select>
        </Box>
      );
    }

    return (
      <Box key={key} sx={{ minWidth: 150, maxWidth: 180, flex: "0 0 auto" }}>
        <Typography variant="subtitle2" color="#002060" mb={1} sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Select
          multiple
          value={selectedValues[key] || []}
          onChange={(e) => {
            const value = e.target.value;
            handleSelectionChange(key, typeof value === "string" ? [value] : value);
          }}
          displayEmpty
          size="small"
          sx={{ width: "100%", background: "#e6ebf5" }}
          renderValue={(selected) => {
            if (!selected || (Array.isArray(selected) && selected.length === 0)) {
              return <span style={{ color: "#888" }}>Select {label}</span>;
            }
            if (Array.isArray(selected)) {
              return selected.length > 1
                ? `${selected[0]} +${selected.length - 1}`
                : selected[0];
            }
            return selected;
          }}
          MenuProps={{
            PaperProps: {
              style: { maxHeight: 180, minWidth: 150 },
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox
                checked={selectedValues[key]?.includes(option) || false}
                sx={{
                  color: "#002060",
                  "&.Mui-checked": { color: "#FF8C00" },
                }}
              />
              {option}
            </MenuItem>
          ))}
        </Select>
      </Box>
    );
  };
  return (
    <Box
      sx={{
        padding: 0,
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      
      {/* Filters inside a Card */}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Card sx={{ width: "80%", mb: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  maxHeight: 100,
                  overflowY: "auto", 
                }}
              >
                {filtersData
                  .filter((filter) => {
                    const key = Object.keys(filter)[0];
                    return !(
                      (apiName === "fo_discount" && (key === "deal_type" || key === "period")) ||
                      (apiName === "gap_analysis" && key === "period") ||
                      (apiName === "by_bank" &&
                        (key === "period" || key === "selected_bank" || key === "deal_captain"))
                    );
                  })
                  .map(renderFilter)}
              </Box>


              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  mt: 1,
                }}
              >
                <LoadingButton
                  variant="contained"
                  onClick={() => handleSubmit()}
                  sx={{
                    bgcolor: "#002060",
                    "&:hover": { backgroundColor: "#004080" },
                    width: "100px",
                  }}
                >
                  Apply
                </LoadingButton>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => resetFilters(handleCancel)}
                  sx={{
                    "&:hover": { backgroundColor: "#FF8C00" },
                    width: "100px",
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box width="100%" mt={1} flex={1}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: "#555", fontSize: "1.2rem" }}>
              Loading... Please Wait
            </Typography>
          </Box>
        ) : (
          <>
            {apiName === "gap_analysis" ? (
              <Gap selectedFilters={appliedFilters} handleCancel={handleCancel} />
            ) : apiName === "fo_discount" ? (
              <AvgFoDiscountChart data={apiData} handleCancel={handleCancel} />
            ) : apiName === "by_bank" ? (
              <BankTable selectedFilters={appliedFilters} />
            ) : (
              <>
                <DealStatsGraph selectedFilters={appliedFilters} />
                <MDDScreenergrid sectorwiseData={payload} handleCancel={handleCancel} />
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );

};

export const resetFilters = (handleCancel: () => void) => {
  handleCancel();
};

export default MDDFilters;