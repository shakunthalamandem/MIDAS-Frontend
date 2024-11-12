// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   Typography,
//   Button,
// } from "@mui/material";

// // Define types for API data and Year response
// interface ApiData {
//   [key: string]: {
//     [key: string]: {
//       [key: string]: {
//         [key: string]: {
//           Total_Deal_Count: number;
//           Positively_Performing_Deals_Percentage: number;
//           Negatively_Performing_Deals_Percentage: number;
//           Average_T_1M_Abs_Return_of_Positively: number;
//           Average_T_1M_Abs_Return_of_Negatively: number;
//           Expected_Returns_Absolute?: number;
//           Expected_Returns_Excess?: number;
//           Long_Opportunity_Value: number;
//         };
//       };
//     };
//   };
// }

// interface YearResponse {
//   years: number[];
// }

// const ComboForm: React.FC = () => {
//   const [apiData, setApiData] = useState<ApiData | null>(null);
//   const [years, setYears] = useState<number[]>([]);
//   const [nameType, setNameType] = useState<string>("ALL");
//   const [expectedReturn, setExpectedReturn] = useState<string>("All");
//   const [region, setRegion] = useState<string>("All");
//   const [sector, setSector] = useState<string>("All");
//   const [startYear, setStartYear] = useState<number | string>("All");
//   const [endYear, setEndYear] = useState<number | string>("All");

//   // Fetch API data for the sectors and years
//   const fetchData = async () => {
//     try {
//       // Fetch sectors data
//       const response = await axios.post<ApiData>("http://192.168.1.59:9000/api/skewtable/calculations/", {
//         // Request body, if needed
//       });
//       setApiData(response.data);  // TypeScript will now know that response.data is of type ApiData

//       // Fetch distinct years
//       const yearResponse = await axios.get<YearResponse>("http://192.168.1.59:9000/api/distinct_years/");
//       const yearList = yearResponse.data.years.sort((a, b) => a - b); // Sort years
//       setYears(yearList);

//     } catch (error) {
//       console.error("Error fetching data: ", error);
//     }
//   };

//   // Get sectors dynamically from the API data
//   const getSectors = (): string[] => {
//     if (apiData) {
//       const sectors = Object.keys(apiData["2001"]["FO"]["International"]);
//       if (sectors.length === 0) return [];  // No sectors, return an empty array
//       return sectors;
//     }
//     return [];
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Filter the data based on selected filter values
//   const filterData = () => {
//     if (!apiData) return [];
  
//     const filteredData = Object.keys(apiData).map((year) => {
//       const yearData = apiData[year]["FO"][region];
  
//       return Object.keys(yearData).map((sectorName) => {
//         const sectorData = yearData[sectorName];
  
//         return Object.keys(sectorData).map((category) => {
//           // Use type assertion to tell TypeScript that category is a valid key
//           const categoryData = sectorData[category as keyof typeof sectorData];
  
//           // Apply filters here
//           if (
//             (nameType === "ALL" || nameType === category) &&
//             (expectedReturn === "All" ||
//               (expectedReturn === "Absolute" && categoryData.Expected_Returns_Absolute) ||
//               (expectedReturn === "Excess" && categoryData.Expected_Returns_Excess)) &&
//             (sector === "All" || sector === sectorName) &&
//             (startYear === "All" || parseInt(year) >= startYear) &&
//             (endYear === "All" || parseInt(year) <= endYear)
//           ) {
//             return categoryData; // This category matches the filters
//           }
//           return null; // This category does not match the filters
//         }).filter((data) => data !== null);
//       }).flat();
//     }).flat();
  
//     return filteredData;
//   };
  
//   const handleSubmit = () => {
//     const filteredData = filterData();
//     console.log("Filtered Data:", filteredData);
//   };

//   return (
//     <Box sx={{ padding: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         Dynamic Combo Fields Form
//       </Typography>
//       <Grid container spacing={3}>
//         <Grid item xs={12} sm={6}>
//           <FormControl fullWidth>
//             <InputLabel>Name Type</InputLabel>
//             <Select value={nameType} onChange={(e) => setNameType(e.target.value)}>
//               <MenuItem value="ALL">ALL</MenuItem>
//               <MenuItem value="IPO">IPO</MenuItem>
//               <MenuItem value="FO">FO</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>

//         <Grid item xs={12} sm={6}>
//           <FormControl fullWidth>
//             <InputLabel>Expected Returns</InputLabel>
//             <Select
//               value={expectedReturn}
//               onChange={(e) => setExpectedReturn(e.target.value)}
//               MenuProps={{
//                 PaperProps: {
//                   style: {
//                     maxHeight: 200, // Set max height for the dropdown
//                     overflowY: 'auto', // Make it scrollable
//                   },
//                 },
//               }}
//             >
//               <MenuItem value="All">All</MenuItem>
//               <MenuItem value="Absolute">Absolute</MenuItem>
//               <MenuItem value="Excess">Excess</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>

//         <Grid item xs={12} sm={6}>
//           <FormControl fullWidth>
//             <InputLabel>Region</InputLabel>
//             <Select
//               value={region}
//               onChange={(e) => setRegion(e.target.value)}
//               MenuProps={{
//                 PaperProps: {
//                   style: {
//                     maxHeight: 200, // Set max height for the dropdown
//                     overflowY: 'auto', // Make it scrollable
//                   },
//                 },
//               }}
//             >
//               <MenuItem value="All">All</MenuItem>
//               <MenuItem value="US">US</MenuItem>
//               <MenuItem value="International">International</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>

//         <Grid item xs={12} sm={6}>
//           <FormControl fullWidth>
//             <InputLabel>Sector</InputLabel>
//             <Select
//               value={sector}
//               onChange={(e) => setSector(e.target.value)}
//               MenuProps={{
//                 PaperProps: {
//                   style: {
//                     maxHeight: 200, // Set max height for the dropdown
//                     overflowY: 'auto', // Make it scrollable
//                   },
//                 },
//               }}
//             >
//               <MenuItem value="All">All</MenuItem>
//               <MenuItem value="Others">Others</MenuItem>
//               {getSectors().map((sectorName) => (
//                 <MenuItem key={sectorName} value={sectorName}>
//                   {sectorName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Grid>

//         {/* Show Year fields if no sectors */}
//         {getSectors().length === 0 && (
//           <>
//             <Grid item xs={12} sm={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Start Year</InputLabel>
//                 <Select
//                   value={startYear}
//                   onChange={(e) => setStartYear(e.target.value)}
//                   MenuProps={{
//                     PaperProps: {
//                       style: {
//                         maxHeight: 200, // Set max height for the dropdown
//                         overflowY: 'auto', // Make it scrollable
//                       },
//                     },
//                   }}
//                 >
//                   <MenuItem value="All">All</MenuItem>
//                   {years.map((year) => (
//                     <MenuItem key={year} value={year}>
//                       {year}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} sm={6}>
//               <FormControl fullWidth>
//                 <InputLabel>End Year</InputLabel>
//                 <Select
//                   value={endYear}
//                   onChange={(e) => setEndYear(e.target.value)}
//                   MenuProps={{
//                     PaperProps: {
//                       style: {
//                         maxHeight: 200, // Set max height for the dropdown
//                         overflowY: 'auto', // Make it scrollable
//                       },
//                     },
//                   }}
//                 >
//                   <MenuItem value="All">All</MenuItem>
//                   {years.map((year) => (
//                     <MenuItem key={year} value={year}>
//                       {year}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//           </>
//         )}

//         <Grid item xs={12}>
//           <Button variant="contained" color="primary" onClick={handleSubmit}>
//             Submit
//           </Button>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default ComboForm;
import React from 'react'

const SkewCombo = () => {
  return (
    <div>SkewCombo</div>
  )
}

export default SkewCombo