// // src/components/AllocationDealsize.tsx
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// interface AllocationData {
//   year_quarter: string;
//   deal_type: string;
//   allocation_deal_size_percentage: number;
// }

// interface AllocationResponse {
//   [key: string]: {
//     [region: string]: {
//       [sector: string]: {
//         allocation_deal_size_percentage: string;
//       };
//     };
//   };
// }

// interface FilterParams {
//   broad_region: string[];
//   deal_captain: string[];
//   deal_type: string[];
//   gics_sector: string[];
//   years: number[];
// }

// const AllocationDealsize = ({ filters }: { filters: FilterParams }) => {
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch data from the API based on filters
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.post('http://192.168.1.59:9000/api/mdd_allocation_percentage/', filters);
//         processData(response.data);
//       } catch (err) {
//         setError('Failed to fetch data');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [filters]);

//   const processData = (data: AllocationResponse) => {
//     // Process the data to create the chart data structure
//     const processedData: any[] = [];

//     Object.keys(data).forEach((yearQuarter) => {
//       const yearQuarterData: any = { year_quarter: yearQuarter };

//       const dealTypes = ['FO', 'IPO']; // Deal types based on the API response structure

//       dealTypes.forEach((dealType) => {
//         if (data[yearQuarter][dealType]) {
//           Object.keys(data[yearQuarter][dealType]).forEach((sector) => {
//             const allocationPercentage = parseFloat(
//               data[yearQuarter][dealType][sector].allocation_deal_size_percentage
//             );
//             const sectorKey = `${dealType}_${sector}`;
//             if (!yearQuarterData[sectorKey]) {
//               yearQuarterData[sectorKey] = 0;
//             }
//             yearQuarterData[sectorKey] += allocationPercentage;
//           });
//         }
//       });

//       processedData.push(yearQuarterData);
//     });

//     setChartData(processedData);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div>
//       <h2>Allocation Deal Size Percentage</h2>
//       <ResponsiveContainer width="100%" height={400}>
//         <BarChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="year_quarter" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="FO_Communication Services" stackId="a" fill="#8884d8" />
//           <Bar dataKey="FO_Consumer Discretionary" stackId="a" fill="#82ca9d" />
//           <Bar dataKey="FO_Consumer Staples" stackId="a" fill="#ffc658" />
//           <Bar dataKey="IPO_Communication Services" stackId="a" fill="#ff7300" />
//           <Bar dataKey="IPO_Consumer Discretionary" stackId="a" fill="#d0ed57" />
//           <Bar dataKey="IPO_Consumer Staples" stackId="a" fill="#413ea0" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default AllocationDealsize;

import React from 'react'

const DealAllocationGraph = () => {
  return (
    <div>DealAllocationGraph</div>
  )
}

export default DealAllocationGraph