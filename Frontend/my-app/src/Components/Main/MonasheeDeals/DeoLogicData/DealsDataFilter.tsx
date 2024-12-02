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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

interface ApiData {
  years: number[];
  regions: string[];
  sectors: string[];
  deal_types: string[];
  periods: string[];
}

// Component
const DealsDataFilter: React.FC = () => {
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string[]>([]);

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
    if (currentValues.includes(value)) {
      setter(currentValues.filter((v) => v !== value));
    } else {
      setter([...currentValues, value]);
    }
  };

  const renderMultiSelect = (
    label: string,
    options: string[],
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <Box>
      {options.map((option) => (
        <FormControlLabel
          key={option}
          control={
            <Checkbox
              checked={selected.includes(option)}
              onChange={() => handleChange(option, setSelected, selected)}
            />
          }
          label={option}
        />
      ))}
    </Box>
  );

  const renderCheckboxGroup = (
    label: string,
    options: string[],
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <Box>
      {options.map((option) => (
        <FormControlLabel
          key={option}
          control={
            <Checkbox
              checked={selected.includes(option)}
              onChange={() => handleChange(option, setSelected, selected)}
            />
          }
          label={option}
        />
      ))}
    </Box>
  );

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

  // Dynamically create sections based on API data
  const sections = [
    {
      label: "Years",
      options: apiData?.years?.map(String) || [],  // Ensure the array is always present
      selected: selectedYears,
      setSelected: setSelectedYears,
      render: renderCheckboxGroup,  // Use checkboxes for "Years"
    },
    {
      label: "Regions",
      options: apiData?.regions || [],  // Default to an empty array if undefined
      selected: selectedRegions,
      setSelected: setSelectedRegions,
      render: renderMultiSelect,  // Use multi-select for "Regions"
    },
    {
      label: "Sectors",
      options: apiData?.sectors || [],
      selected: selectedSectors,
      setSelected: setSelectedSectors,
      render: renderMultiSelect,  // Use multi-select for "Sectors"
    },
    {
      label: "Deal Types",
      options: apiData?.deal_types || [],
      selected: selectedDealTypes,
      setSelected: setSelectedDealTypes,
      render: renderMultiSelect,  // Use multi-select for "Deal Types"
    },
    {
      label: "Period",
      options: apiData?.periods || [],
      selected: selectedPeriod,
      setSelected: setSelectedPeriod,
      render: renderMultiSelect,  // Use multi-select for "Period"
    },
  ];

  return (
    <Box width={'300px'}>
  {sections.map((section, index) => (
    <Accordion
      key={index}
      expanded={expanded === section.label}  // Control the expanded state dynamically
      onChange={() => setExpanded(expanded === section.label ? false : section.label)}  // Toggle expand/collapse
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${section.label}-content`}
        id={`${section.label}-header`}
        sx={{
          backgroundColor: '#002060', // Set the background color for the header
          color: 'white', // Set the text color to white for better contrast
          '& .MuiAccordionSummary-content': {
            color: 'white', // Ensure the text inside the summary is white
          },
        }}
      >
        <Typography>{section.label}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {section.render(
          section.label,
          section.options,
          section.selected,
          section.setSelected
        )}
      </AccordionDetails>
    </Accordion>
  ))}
</Box>

  );
};

export default DealsDataFilter;
