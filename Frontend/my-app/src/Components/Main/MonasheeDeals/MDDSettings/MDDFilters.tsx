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
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LoadingButton } from "@mui/lab"; // Import LoadingButton
import DealAllocationGraph from "./DealAllocationGraph";
import MDDCaptureTable from "./MDDCaptureTable";
import AvgFoDiscountChart from "./AvgFoDiscountChart";
import MDDScreenergrid from "./MDDScreenergrid";
import DealStatsGraph from "./DealStatsGraph";

interface FilterOption {
  options: (string | number)[]; // Options can be either string or number
  label: string;
  description: string;
}

interface Filter {
  [key: string]: FilterOption;
}

interface FiltersProps {
  filtersData: Filter[]; // Accept filters as prop
  apiName: string;
}

const MDDFilters: React.FC<FiltersProps> = ({ filtersData, apiName }) => {
  const [loading, setLoading] = useState(false);
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: (string | number)[];
  }>({});
  const [appliedFilters, setAppliedFilters] = useState<{
    [key: string]: (string | number)[];
  } | null>(null);
  const [expanded, setExpanded] = useState<string | false>(false); // Track expanded state
  const [payload, setPayload] = useState<{ [key: string]: (string | number)[] }>({});
  const [apiData, setApiData] = useState({});
  const [searchValue, setSearchValue] = useState<string>(""); // State for the search input
  const [searchKey, setSearchKey] = useState<string | null>(null); // Track which filter's search bar is active

  useEffect(() => {
    const initialSelectedValues: { [key: string]: (string | number)[] } = {};
    filtersData.forEach((filter) => {
      const key = Object.keys(filter)[0];
      initialSelectedValues[key] = [];
    });
    
    if (JSON.stringify(initialSelectedValues) !== JSON.stringify(selectedValues)) {
      setSelectedValues(initialSelectedValues);
      setAppliedFilters(initialSelectedValues);
      handleSubmit(initialSelectedValues);
    }
  }, [filtersData]);  // This hook will only be triggered when filtersData changes
  

  const handleSelectionChange = (key: string, value: (string | number)[]) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSearchChange = (value: string, key: string) => {
    setSearchValue(value.toLowerCase());
    setSearchKey(key); // Keep track of the filter being searched
  };
  const handleSubmit = async (filters = selectedValues) => {
    try {
      setLoading(true);
  
      const payload: { [key: string]: (string | number)[] } = {};
      Object.keys(filters).forEach((key) => {
        payload[key] = filters[key] || [];
      });
  
      setPayload(payload); // Store the payload
  
      const apiUrl = process.env.REACT_APP_API_URL;
  
      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }
  
      const response = await fetch(`${apiUrl}/api/${apiName}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    setSelectedValues(resetSelectedValues); // Reset the selected filters
    setAppliedFilters(resetSelectedValues); // Reset the applied filters
    setSearchValue(""); // Clear the search bar
    setSearchKey(null); // Reset active search filter
  };



  return (
    <Container
      maxWidth="xl"
      sx={{
        padding: 0,
        marginBottom: 20,
        display: "flex",
        marginLeft: 0,
        marginTop: 10,
      }}
    >
      <Box width="320px" sx={{ marginRight: 10 }}>
        <Card
          sx={{ borderRadius: 2, boxShadow: 3, backgroundColor: "#e6ebf5" }}
        >
          <CardContent>
            <Box width="250px" sx={{ p: 2 }}>
              <Typography variant="h5" color="#002060" mb={4}>
                Monashee Deal Filters
              </Typography>
              {filtersData
                .filter((filter) => {
                  const key = Object.keys(filter)[0];
                  // Hide the 'deal type' filter if the API name is 'fo_discount'
                  return !(
                    (apiName === "fo_discount" || apiName === "allocation_capture") &&
                    key === "deal_type"
                  );
                })
                .map((filter) => {
                  const key = Object.keys(filter)[0];
                  const { options, label } = filter[key];

                  // Apply search filtering for "lead_bank"
                  const filteredOptions =
                    label === "Lead Bank" && searchKey === key
                      ? options.filter((option) =>
                          option.toString().toLowerCase().includes(searchValue)
                        )
                      : options;

                  return (
                    <Accordion
                      key={key}
                      expanded={expanded === key}
                      onChange={() => setExpanded(expanded === key ? false : key)}
                      sx={{
                        marginBottom: "10px", // Space between accordions
                        "&:before": {
                          display: "none", // Hide default divider
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                        aria-controls={`${key}-content`}
                        id={`${key}-header`}
                        sx={{
                          backgroundColor: "#002060", // Accordion header background
                          color: "white", // Text color in the header
                          "& .MuiAccordionSummary-content": {
                            color: "white",
                          },
                          transition: "background-color 0.3s ease", // Smooth transition on hover
                          "&:hover": {
                            backgroundColor: "#004080", // Darker shade on hover
                          },
                        }}
                      >
                        <Typography sx={{ fontWeight: "bold" }}>{label}</Typography>
                      </AccordionSummary>
                      {label === "Lead Bank" && (
                        <div  style={{
                          backgroundColor: "#f1f1f1", // Light background for the details
                          padding: "10px 20px", // Padding inside accordion details
                          borderRadius: "5px", // Rounded corners for accordion details
                          textAlign: "left",
                          maxHeight: "200px",
                        }}>
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
                          backgroundColor: "#f1f1f1", // Light background for the details
                          padding: "10px 20px", // Padding inside accordion details
                          borderRadius: "5px", // Rounded corners for accordion details
                          textAlign: "left",
                          maxHeight: "200px",
                          overflowY: "scroll",
                        }}
                      >
                    
                        {filteredOptions.map((option) => (
                          <FormControlLabel
                            key={option}
                            control={
                              <Checkbox
                              key={`${key}-${option}-${selectedValues[key]?.includes(option)}`} // Unique key for each checkbox
                              checked={selectedValues[key]?.includes(option)} // Reflect reset state here
                              onChange={() => {
                                const newValues = selectedValues[key]?.includes(option)
                                  ? selectedValues[key].filter((item) => item !== option) // Deselect
                                  : [...(selectedValues[key] || []), option]; // Select
                                handleSelectionChange(key, newValues || []);
                              }}
                              sx={{
                                "&.Mui-checked": {
                                  color: "#FF8C00", // Checkbox checked color
                                },
                                transition: "all 0.3s ease", // Smooth transition
                                paddingLeft: 0, // Remove padding on the left to make it align better
                              }}
                            />
                            
                            }
                            label={option}
                            sx={{
                              display: "flex", // Align checkbox and label horizontally
                              justifyContent: "flex-start", // Ensure label is aligned to the left
                            }}
                          />
                        ))}
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
                      backgroundColor: "#004080", // Hover effect for the apply button
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
                      backgroundColor: "#FF8C00", // Hover effect for the reset button
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
      <Box mt={4} flex={1}>
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
        <MDDCaptureTable responseData={apiData} apiName={apiName} />
      ) : apiName === "fo_discount" ? (
        <AvgFoDiscountChart data={apiData} />
      ) : (
        <>
        {/* <DealAllocationGraph responseData={apiData} apiName={apiName} /> */}
        <DealStatsGraph responseData={apiData} apiName={apiName} />
        
        <MDDScreenergrid sectorwiseData={payload} /> 
</>
      )}
    </>
  )}
</Box>

    </Container>
  );
};

export default MDDFilters;
