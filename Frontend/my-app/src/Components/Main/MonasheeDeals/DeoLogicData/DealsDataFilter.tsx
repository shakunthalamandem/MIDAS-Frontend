import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  MenuItem,
  CircularProgress,
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

// Component
const DealsDataFilter: React.FC = () => {
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string[]>([]);

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
      <Typography variant="subtitle1">{label}</Typography>
      <TextField
        select
        SelectProps={{
          multiple: true,
          value: selected,
          onChange: (e) => {
            const value = e.target.value as string[]; // Ensure correct typing
            setSelected(value);
          },
        }}
        variant="outlined"
        size="small"
        fullWidth
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={selected.includes(option)} />
            {option}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );

  const renderCheckboxGroup = (
    label: string,
    options: string[],
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <Box>
      <Typography variant="subtitle1">{label}</Typography>
      <FormGroup>
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
      </FormGroup>
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

  return (
    <Box>
      {[
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
      ].map((section, index) => (
        <Accordion key={index}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${section.label}-content`}
            id={`${section.label}-header`}
          >
            <Typography>{section.label}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {section.label === "Years"
              ? renderCheckboxGroup(
                  section.label,
                  section.options,
                  section.selected,
                  section.setSelected
                )
              : renderMultiSelect(
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
