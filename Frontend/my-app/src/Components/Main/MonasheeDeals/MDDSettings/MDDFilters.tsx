import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LoadingButton } from "@mui/lab"; // Import LoadingButton
import DealAllocationGraph from "./DealAllocationGraph";

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
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: (string | number)[] }>({});
  const [appliedFilters, setAppliedFilters] = useState<{ [key: string]: (string | number)[] } | null>(null);
  const [expanded, setExpanded] = useState<string | false>(false); // Track expanded state
  const [apiData, setApiData] = useState({});
  
  // Store the initial selected values using useRef to persist across renders
  const initialSelectedValuesRef = useRef<{ [key: string]: (string | number)[] }>({});

  useEffect(() => {
    const initialSelectedValues: { [key: string]: (string | number)[] } = {};
    filtersData.forEach((filter) => {
      const key = Object.keys(filter)[0];
      initialSelectedValues[key] = [];
    });
    initialSelectedValuesRef.current = initialSelectedValues; // Save the initial selected values in the ref
    setSelectedValues(initialSelectedValues);
    setAppliedFilters(initialSelectedValues);
    handleSubmit(initialSelectedValues);
  }, [filtersData]);

  const handleSelectionChange = (key: string, value: (string | number)[]) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSubmit = async (filters = selectedValues) => {
    try {
      setLoading(true);

      const payload: { [key: string]: (string | number)[] } = {};
      Object.keys(filters).forEach((key) => {
        payload[key] = filters[key] || [];
      });

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
    const resetSelectedValues = { ...initialSelectedValuesRef.current };
    setSelectedValues(resetSelectedValues); // Reset the selected filters
    setAppliedFilters(resetSelectedValues); // Reset the applied filters
    console.log("Reset state: ", resetSelectedValues); // Debugging
  };
  
  
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="xl" sx={{ padding: 0, marginBottom: 4 ,display: "flex",marginLeft:0,marginTop:15}}>
      <Box width="400px" sx={{ marginRight: 10 }}>
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Box width="300px" sx={{ p: 2 }}>
              {filtersData.map((filter) => {
                const key = Object.keys(filter)[0];
                const { options, label, description } = filter[key];

                return (
                  <Accordion expanded={expanded === key} onChange={() => setExpanded(expanded === key ? false : key)}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                      aria-controls={`${key}-content`}
                      id={`${key}-header`}
                      sx={{
                        backgroundColor: "#3a507d", // Set the background color to #002060
                        color: "white", // Set the text color to white
                        "& .MuiAccordionSummary-content": {
                          color: "white", // Ensuring text is white in the summary
                        },
                      }}
                    >
                      <Typography>{label}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {options.map((option) => (
                        <FormControlLabel
                          key={option}
                          control={
                            <Checkbox
                            key={`${key}-${option}-${selectedValues[key]?.includes(option)}`} // Unique key for each checkbox
                            checked={selectedValues[key]?.includes(option)}
                            onChange={() => {
                              const newValues = selectedValues[key]?.includes(option)
                                ? selectedValues[key]?.filter((item) => item !== option)
                                : [...(selectedValues[key] || []), option];
                              handleSelectionChange(key, newValues || []);
                            }}
                            sx={{
                              "&.Mui-checked": {
                                color: "#002060", // Match the checkbox color with header
                              },
                            }}
                          />
                          
                          }
                          label={option}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <LoadingButton variant="contained" onClick={() => handleSubmit()} sx={{ mr: 2, bgcolor: "#002060" }}>
                  Apply
                </LoadingButton>
                <Button variant="outlined" color="secondary" onClick={handleCancel}>
                  Reset
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box mt={4} flex={1}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: "#555", fontSize: "1.2rem" }}>Loading... Please Wait</Typography>
          </Box>
        ) : (
          <>
          <DealAllocationGraph responseData={apiData} apiName={apiName} />
          </>
        )}
      </Box>
    </Container>
  );
};

export default MDDFilters;
