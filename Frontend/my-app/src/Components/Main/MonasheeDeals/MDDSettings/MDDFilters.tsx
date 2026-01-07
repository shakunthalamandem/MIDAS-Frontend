import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Checkbox,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Radio,
  TextField,
  MenuItem,
  Select,
  Divider,
} from "@mui/material";
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

const formatDateWithOrdinal = (value: string | null): string | null => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const day = date.getDate();
  const daySuffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}${daySuffix} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

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

  const [apiData, setApiData] = useState<any>({});
  const [maxPricingDate, setMaxPricingDate] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersData, apiName]);

  const handleSelectionChange = (key: string, value: (string | number)[]) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSearchChange = (value: string, key: string) => {
    setSearchValue(value.toLowerCase());
    setSearchKey(key);
  };

  const handleSubmit = async (filters = selectedValues) => {
    try {
      setLoading(true);
      setMaxPricingDate(null);

      const outgoing: { [key: string]: (string | number)[] } = {};
      Object.keys(filters).forEach((key) => {
        outgoing[key] = filters[key] || [];
      });

      setPayload(outgoing);
      setAppliedFilters(filters);

      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) throw new Error("API URL is not defined in env variables");

      const response = await fetch(`${apiUrl}/api/${apiName}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(outgoing),
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      setApiData(result);

      // Capture max_pricing_date for mdd_deals_graph (if provided)
      if (apiName === "mdd_deals_graph") {
        setMaxPricingDate(result?.max_pricing_date ?? null);
      } else {
        setMaxPricingDate(null);
      }
    } catch (error: any) {
      console.error(error.message || "Error while fetching data");
      setMaxPricingDate(null);
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
    setMaxPricingDate(null);
    handleSubmit(resetSelectedValues);
  };

  const getPerRowCount = (name: string, total: number) => {
    // Explicit requirement: gap_analysis with 8 filters -> 4 + 4
    if (name === "gap_analysis" && total >= 8) return 4;
    // Default: 5 per row
    return 5;
  };

  const visibleFilters = useMemo(() => {
    return filtersData.filter((filter) => {
      const key = Object.keys(filter)[0];
      return !(
        (apiName === "fo_discount" && (key === "deal_type" || key === "period")) ||
        (apiName === "gap_analysis" && key === "period") ||
        (apiName === "by_bank" &&
          (key === "period" || key === "selected_bank" || key === "deal_captain"))
      );
    });
  }, [filtersData, apiName]);

  const perRow = useMemo(
    () => getPerRowCount(apiName, visibleFilters.length),
    [apiName, visibleFilters.length]
  );

  const gridColumns = useMemo(() => {
    return Math.min(perRow, Math.max(1, visibleFilters.length));
  }, [perRow, visibleFilters.length]);

  const renderFilter = (filter: Filter) => {
    const key = Object.keys(filter)[0];
    const { options, label } = filter[key];

    const filteredOptions =
      label === "Lead Bank" && searchKey === key
        ? options.filter((option) =>
            option.toString().toLowerCase().includes(searchValue)
          )
        : options;

    // --- Compact label + dropdown in one line ---
    const filterRowSx = {
      display: "flex",
      alignItems: "center",
      gap: 1,
      width: "100%",
    };

    const labelSx = {
      minWidth: 78,
      maxWidth: 95,
      fontSize: "0.8rem",
      fontWeight: 600,
      color: "#002060",
      whiteSpace: "nowrap" as const,
      overflow: "hidden",
      textOverflow: "ellipsis",
    };

    const selectWrapSx = {
      flex: 1,
      minWidth: 0,
    };

    const commonSelectStyles = {
      width: "100%",
      fontSize: "0.8rem",
      "& .MuiSelect-select": {
        fontSize: "0.82rem",
        padding: "0.38rem 0.6rem",
      },
      bgcolor: "#fff",
      borderRadius: "10px",
    };

    const commonMenuItemStyles = {
      fontSize: "0.85rem",
      pl: 1,
      pr: 1,
      py: 0.5,
      alignItems: "center",
    };

    const commonCheckboxStyles = {
      color: "#002060",
      "&.Mui-checked": { color: "#FF8C00" },
      p: 0.5,
      mr: 1,
    };

    if (label === "Lead Bank") {
      return (
        <Box key={key} sx={{ width: "100%" }}>
          <Box sx={filterRowSx}>
            <Typography sx={labelSx} title={label}>
              {label}
            </Typography>

            <Box sx={selectWrapSx}>
              <Select
                multiple
                value={selectedValues[key] || []}
                onChange={(e) => {
                  const value = e.target.value;
                  handleSelectionChange(
                    key,
                    typeof value === "string" ? [value] : (value as any)
                  );
                }}
                displayEmpty
                size="small"
                sx={commonSelectStyles}
                renderValue={(selected) => {
                  if (
                    !selected ||
                    (Array.isArray(selected) && selected.length === 0)
                  ) {
                    return <span style={{ color: "#888" }}>Select</span>;
                  }
                  if (Array.isArray(selected)) {
                    return selected.length > 1
                      ? `${selected[0]} +${selected.length - 1}`
                      : selected[0];
                  }
                  return selected as any;
                }}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 420, minWidth: 240 } },
                }}
              >
                <MenuItem disableRipple disableTouchRipple disableGutters>
                  <TextField
                    size="small"
                    placeholder="Search"
                    autoFocus
                    value={searchKey === key ? searchValue : ""}
                    onChange={(e) => handleSearchChange(e.target.value, key)}
                    sx={{
                      mb: 1,
                      width: "100%",
                      "& input": { fontSize: "0.85rem", padding: "0.5rem" },
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </MenuItem>

                {filteredOptions.map((option) => (
                  <MenuItem key={option} value={option} sx={commonMenuItemStyles}>
                    <Checkbox
                      size="small"
                      checked={selectedValues[key]?.includes(option) || false}
                      sx={commonCheckboxStyles}
                    />
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </Box>
      );
    }

    // period: single select (radio UI in menu)
    const isPeriod = key === "period";

    return (
      <Box key={key} sx={{ width: "100%" }}>
        <Box sx={filterRowSx}>
          <Typography sx={labelSx} title={label}>
            {label}
          </Typography>

          <Box sx={selectWrapSx}>
            <Select
              multiple={!isPeriod}
              value={
                isPeriod ? selectedValues[key]?.[0] || "" : selectedValues[key] || []
              }
              onChange={(e) => {
                const value = e.target.value;
                if (isPeriod) {
                  handleSelectionChange(key, [value as any]);
                } else {
                  handleSelectionChange(
                    key,
                    typeof value === "string" ? [value] : (value as any)
                  );
                }
              }}
              displayEmpty
              size="small"
              sx={commonSelectStyles}
              renderValue={(selected: any) => {
                if (
                  !selected ||
                  (Array.isArray(selected) && selected.length === 0) ||
                  selected === ""
                ) {
                  return <span style={{ color: "#888" }}>Select</span>;
                }
                if (Array.isArray(selected)) {
                  return selected.length > 1
                    ? `${selected[0]} +${selected.length - 1}`
                    : selected[0];
                }
                return selected;
              }}
              MenuProps={{
                PaperProps: { style: { maxHeight: 420, minWidth: 240 } },
              }}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option} sx={commonMenuItemStyles}>
                  {isPeriod ? (
                    <Radio
                      size="small"
                      checked={selectedValues[key]?.[0] === option}
                      sx={{ color: "#FF8C00", p: 0.5, mr: 1 }}
                    />
                  ) : (
                    <Checkbox
                      size="small"
                      checked={selectedValues[key]?.includes(option) || false}
                      sx={commonCheckboxStyles}
                    />
                  )}
                  {option}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#F6F8FB" }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Card
          elevation={6}
          sx={{
            borderRadius: "16px",
            bgcolor: "#ffffff",
            border: "1px solid #e6eaf2",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1.5}
              flexWrap="wrap"
              gap={1}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#005166" }}>
                Monashee Deals Filters
              </Typography>

              <Box display="flex" alignItems="center" gap={1.2}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#002060", whiteSpace: "nowrap" }}
                >
                  Data as of: {formatDateWithOrdinal(maxPricingDate) || "--"}
                </Typography>

                <LoadingButton
                  variant="contained"
                  onClick={() => handleSubmit()}
                  loading={loading}
                  sx={{
                    bgcolor: "#002060",
                    "&:hover": { bgcolor: "#004080" },
                    borderRadius: "10px",
                    px: 2.2,
                  }}
                >
                  Apply
                </LoadingButton>

                <Button
                  variant="outlined"
                  onClick={() => handleCancel()}
                  sx={{
                    borderRadius: "10px",
                    px: 2.2,
                    borderColor: "#FF8C00",
                    color: "#FF8C00",
                    "&:hover": {
                      bgcolor: "rgba(255,140,0,0.08)",
                      borderColor: "#FF8C00",
                    },
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* ✅ Uniform grid, compact rows (label+dropdown inline) */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                gap: 1.2, // tighter than before
                alignItems: "center",
              }}
            >
              {visibleFilters.map(renderFilter)}
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Box width="100%" flex={1} mb={4}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              py: 4,
            }}
          >
            <CircularProgress color="primary" />
            <Typography sx={{ color: "#555", fontSize: "1.05rem" }}>
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
