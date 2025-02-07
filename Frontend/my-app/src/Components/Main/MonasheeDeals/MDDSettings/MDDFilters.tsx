import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Checkbox,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LoadingButton } from "@mui/lab";
import MDDCaptureTable from "./MDDCaptureTable";
import AvgFoDiscountChart from "./AvgFoDiscountChart";
import MDDScreenergrid from "./MDDScreenergrid";
import DealStatsGraph from "./DealStatsGraph";
import Gap from "./Gap";
import DealTypeComponent from "./DealTypeComponent";

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
  }>({})  
  const [appliedFilterss, setAppliedFilterss] = useState<{
    [key: string]: (string | number)[];
  }>({});
  const [expanded, setExpanded] = useState<string | false>(false);
  const [payload, setPayload] = useState<{ [key: string]: (string | number)[] }>({});
  const [apiData, setApiData] = useState({});
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchKey, setSearchKey] = useState<string | null>(null);

  useEffect(() => {
    const initialSelectedValues: { [key: string]: (string | number)[] } = {};
    filtersData.forEach((filter) => {
      const key = Object.keys(filter)[0];
      initialSelectedValues[key] = [];
    });

    if (JSON.stringify(initialSelectedValues) !== JSON.stringify(selectedValues)) {
      setSelectedValues(initialSelectedValues);
      setAppliedFilters(initialSelectedValues);
      setAppliedFilterss(initialSelectedValues);
      handleSubmit(initialSelectedValues);
    }
  }, [filtersData]);

  // useEffect(() => {
  //   const initialSelectedValues: { [key: string]: (string | number)[] } = {};
  //   filtersData.forEach((filter) => {
  //     const key = Object.keys(filter)[0];
  //     initialSelectedValues[key] = [];
  //   });

  //   if (JSON.stringify(initialSelectedValues) !== JSON.stringify(selectedValues)) {
  //     setSelectedValues(initialSelectedValues);
  //     setAppliedFilterss(initialSelectedValues);
  //     handleSubmit(initialSelectedValues);
  //   }
  // }, [filtersData]);


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
      setAppliedFilterss(filters);

  
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }
  
      const response = await fetch(`${apiUrl}/api/${apiName}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
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
      resetSelectedValues[key] = [];
    });
    setSelectedValues(resetSelectedValues);
    setAppliedFilters(resetSelectedValues);
    setSearchValue("");
    setSearchKey(null);
    handleSubmit(resetSelectedValues);

  };

  return (
    <Box
      
      sx={{
        padding: 0,
        marginBottom: 20,
        display: "flex",
        marginLeft: 0,
        marginTop: 5,
        width: '100%'
      }}
    >
      <Box width="320px" sx={{ marginRight: 5,marginLeft:5}}>  
        <Card sx={{ borderRadius: 2, boxShadow: 3, backgroundColor: "#e6ebf5" }}>
          <CardContent>
            <Box width="250px" sx={{ p: 2 }}>
              <Typography variant="h5" color="#002060" mb={4}>
                Monashee Deals Filters
              </Typography>
              {filtersData
                .filter((filter) => {
                  const key = Object.keys(filter)[0];
                  return !(
                    (apiName === "fo_discount" || apiName === "allocation_capture") &&
                    (key === "deal_type" || key === "period")
                  );
                })
                .map((filter) => {
                  const key = Object.keys(filter)[0];
                  const { options, label } = filter[key];

                  const filteredOptions =
                    label === "Lead Bank" && searchKey === key
                      ? options.filter((option) =>
                          option.toString().toLowerCase().includes(searchValue)
                        )
                      : options;

                  const isPeriodFilter = key === "period";

                  return (
                    <Accordion
                      key={key}
                      expanded={expanded === key}
                      onChange={() => setExpanded(expanded === key ? false : key)}
                      sx={{
                        marginBottom: "10px",
                        "&:before": {
                          display: "none",
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                        aria-controls={`${key}-content`}
                        id={`${key}-header`}
                        sx={{
                          backgroundColor: "#002060",
                          color: "white",
                          "& .MuiAccordionSummary-content": {
                            color: "white",
                          },
                          transition: "background-color 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#004080",
                          },
                        }}
                      >
                        <Typography sx={{ fontWeight: "bold" }}>{label}</Typography>
                      </AccordionSummary>
                      {label === "Lead Bank" && (
                        <div
                          style={{
                            backgroundColor: "#f1f1f1",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            textAlign: "left",
                            maxHeight: "200px",
                          }}
                        >
                          <TextField
                            size="small"
                            placeholder="Search"
                            value={searchKey === key ? searchValue : ""}
                            onChange={(e) => handleSearchChange(e.target.value, key)}
                            sx={{ mb: 2 }}
                          />
                        </div>
                      )}
                      <AccordionDetails
                        sx={{
                          backgroundColor: "#f1f1f1",
                          padding: "10px 20px",
                          borderRadius: "5px",
                          textAlign: "left",
                          maxHeight: "200px",
                          overflowY: "scroll",
                        }}
                      >
                        {isPeriodFilter ? (
                          <RadioGroup
                            value={selectedValues[key]?.[0] || ""}
                            onChange={(e) => handleSingleSelectionChange(key, e.target.value)}
                          >
                            {options.map((option) => (
                              <FormControlLabel
                                key={option}
                                value={option}
                                control={<Radio sx={{ color: "#FF8C00" }} />}
                                label={option}
                              />
                            ))}
                          </RadioGroup>
                        ) : (
                          filteredOptions.map((option) => (
                            <FormControlLabel
                              key={option}
                              control={
                                <Checkbox
                                key={`${key}-${option}-${selectedValues[key]?.includes(option)}`}
                                  checked={selectedValues[key]?.includes(option)}
                                  onChange={() => {
                                    const newValues = selectedValues[key]?.includes(option)
                                      ? selectedValues[key].filter((item) => item !== option)
                                      : [...(selectedValues[key] || []), option];
                                    handleSelectionChange(key, newValues);
                                  }}
                                  sx={{
                                    "&.Mui-checked": {
                                      color: "#FF8C00",
                                    },
                                    transition: "all 0.3s ease",
                                    paddingLeft: 0,
                                  }}
                                />
                              }
                              label={option}
                              sx={{
                                display: "flex",
                                justifyContent: "flex-start",
                              }}
                            />
                          ))
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}

              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <LoadingButton
                  variant="contained"
                  onClick={() => handleSubmit()}
                  sx={{
                    mr: 2,
                    bgcolor: "#002060",
                    "&:hover": {
                      backgroundColor: "#004080",
                    },
                  }}
                >
                  Apply
                </LoadingButton>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#FF8C00",
                    },
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box  width="100%" mt={1} flex={1}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: "#555", fontSize: "1.2rem" }}>
              Loading... Please Wait
            </Typography>
          </Box>
        ) : (
          <>
      {apiName === "allocation_capture" ? (
        // <MDDCaptureTable selectedFilterss={appliedFilterss} />
        <Gap selectedFilters={appliedFilters} />
        // <DealTypeComponent />
      ) : apiName === "fo_discount" ? (
        <AvgFoDiscountChart data={apiData} />      ) : (
        <>
          <DealStatsGraph selectedFilters={appliedFilters} />
          <MDDScreenergrid sectorwiseData={payload} />
        </>
      )}
    </>
        )}
      </Box>
      </Box>

  );
};

export default MDDFilters;