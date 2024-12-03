import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

interface ApiData {
  years: number[];
  regions: string[];
  sectors: string[];
  deal_types: string[];
  period: string[];
}

interface DealsDataFilterProps {
    appliedFilters?: {
      years: string[];
      regions: string[];
      sectors: string[];
      deal_types: string[];
      period: string[];
    };
    onFiltersChange: (newFilters: {
      years: string[];
      regions: string[];
      sectors: string[];
      deal_types: string[];
      period: string[];
    }) => void; // Add this line to accept filter change callback
  }
  
const DealsDataFilter: React.FC<DealsDataFilterProps> = ({ appliedFilters }) => {
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize filter states with appliedFilters or set default to all values
  const [selectedYears, setSelectedYears] = useState<string[]>(appliedFilters?.years || []);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(appliedFilters?.regions || []);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(appliedFilters?.sectors || []);
  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>(appliedFilters?.deal_types || []);
  const [selectedPeriod, setSelectedPeriod] = useState<string[]>(appliedFilters?.period || []);

  const [expanded, setExpanded] = useState<string | false>(false); // Track expanded state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await axios.get<ApiData>(`${apiUrl}/api/deals_data/`);
        setApiData(response.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    currentValues: string[]
  ) => {
    let updatedValues;
    if (currentValues.includes(value)) {
      updatedValues = currentValues.filter((v) => v !== value);
    } else {
      updatedValues = [...currentValues, value];
    }
    setter(updatedValues);
    
    // Call onFiltersChange to pass the updated filters back to the parent
    onFiltersChange({
      years: selectedYears,
      regions: selectedRegions,
      sectors: selectedSectors,
      deal_types: selectedDealTypes,
      period: selectedPeriod,
    });
  };
  

  const handleReset = () => {
    setSelectedYears([]);
    setSelectedRegions([]);
    setSelectedSectors([]);
    setSelectedDealTypes([]);
    setSelectedPeriod([]);
  };

  const handleApply = () => {
    const appliedFilters = {
      years: selectedYears,
      regions: selectedRegions,
      sectors: selectedSectors,
      deal_types: selectedDealTypes,
      period: selectedPeriod,
    };
    console.log("Applied Filters:", JSON.stringify(appliedFilters, null, 2));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!apiData) {
    return <Typography variant="h6">Failed to load data.</Typography>;
  }

  // Sections mapping and filtering
  const sections = [
    {
      label: "Years",
      options: apiData.years.map(String),
      selected: selectedYears,
      setSelected: setSelectedYears,
    },
    {
      label: "Regions",
      options: apiData.regions,
      selected: selectedRegions,
      setSelected: setSelectedRegions,
    },
    {
      label: "Sectors",
      options: apiData.sectors,
      selected: selectedSectors,
      setSelected: setSelectedSectors,
    },
    {
      label: "Deal Types",
      options: apiData.deal_types,
      selected: selectedDealTypes,
      setSelected: setSelectedDealTypes,
    },
    {
      label: "Period",
      options: apiData.period,
      selected: selectedPeriod,
      setSelected: setSelectedPeriod,
    },
  ];

  return (
    <Card sx={{ width: 350, padding: 2, margin: "auto" }}>
      <CardContent>
        <Typography variant="h6" align="center" gutterBottom>
          Deals Data Filter
        </Typography>
        {sections.map((section, index) => (
          <Accordion
            key={index}
            expanded={expanded === section.label}
            onChange={() => setExpanded(expanded === section.label ? false : section.label)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
              aria-controls={`${section.label}-content`}
              id={`${section.label}-header`}
              sx={{
                backgroundColor: "#002060",
                color: "white",
                "& .MuiAccordionSummary-content": {
                  color: "white",
                },
              }}
            >
              <Typography>{section.label}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {section.options.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={section.selected.includes(option)}
                      onChange={() => handleChange(option, section.setSelected, section.selected)}
                      sx={{
                        "&.Mui-checked": {
                          color: "#002060",
                        },
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApply}
            sx={{ mr: 2, bgcolor: "#002060" }}
          >
            Apply
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DealsDataFilter;
