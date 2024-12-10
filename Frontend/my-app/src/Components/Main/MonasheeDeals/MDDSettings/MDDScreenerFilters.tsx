// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Grid,
//   Button,
//   Typography,
//   Tooltip,
//   TextField,
//   Checkbox,
//   ListItem,
//   ListItemText,
//   Card,
//   CardContent,
//   Container,
// } from "@mui/material";
// import { Autocomplete } from "@mui/material";
// import InfoIcon from "@mui/icons-material/Info";
// import MDDScreenerDataTable from "./MDDScreenerDataTable";
// import MDDScreenerFiltersMain from "../MddGraphs/MDDScrenner/MDDScreenerFiltersMain";

// interface FilterOption {
//   options: (string | number)[]; // Options can be either string or number
//   label: string;
//   description: string;
// }

// interface Filter {
//   [key: string]: FilterOption;
// }

// interface MDDScreenerFiltersProps {
//   filtersData: Filter[]; // Accept filters as prop
// }

// const MDDScreenerFilters: React.FC<MDDScreenerFiltersProps> = ({ filtersData }) => {
//   const [selectedValues, setSelectedValues] = useState<{
//     [key: string]: (string | number)[]; // Store selected filter options
//   }>({});
//   const [appliedFilters, setAppliedFilters] = useState<{
//     [key: string]: (string | number)[]; // Applied filters to pass to the table
//   } | null>(null);

//   useEffect(() => {
//     // Initialize selected values with default values
//     const initialSelectedValues: { [key: string]: (string | number)[] } = {};
//     setSelectedValues(initialSelectedValues);
//     setAppliedFilters(initialSelectedValues); // Show initial filters on page render
//   }, [filtersData]); // Runs when filtersData changes

//   const handleSelectionChange = (key: string, value: (string | number)[]) => {
//     setSelectedValues((prevState) => ({
//       ...prevState,
//       [key]: value,
//     }));
//   };

//   const handleSubmit = () => {
//     console.log("Applied Filters:", selectedValues);
//     setAppliedFilters(selectedValues); // Save applied filters
//   };

//   const handleCancel = () => {
//     // Reset to default values
//     const resetSelectedValues: { [key: string]: (string | number)[] } = {};
//     setSelectedValues(resetSelectedValues);
//     setAppliedFilters(resetSelectedValues); // Clear applied filters
//   };

//   // Format the selected tags to display +X for multiple selections
//   const formatSelectedTags = (values: (string | number)[]) => {
//     if (values.length === 0) return [];
//     const firstValue = values[0];
//     if (values.length === 1) return [firstValue];
//     return [firstValue, `+${values.length - 1}`];
//   };

//   return (
//     <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
//       {/* <MDDScreenerFiltersMain filtersData={[]} /> */}

      
//       {/* Render ScreenerDataTable */}
//       {/* <Box mt={4}>
//         <MDDScreenerDataTable sectorwiseData={appliedFilters || selectedValues} />
//       </Box> */}
//     </Container>
//   );
// };

// export default MDDScreenerFilters;
import React from 'react'

const MDDScreenerFilters = () => {
  return (
    <div>MDDScreenerFilters</div>

  )
}

export default MDDScreenerFilters


// This file is closed as of now  