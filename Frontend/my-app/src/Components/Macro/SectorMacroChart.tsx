import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Typography, Container, Card } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define data interface
interface ApiData {
  date: string;
  snp_500: number;
  dow_jones: number;
  russell_2000: number;
  sp500_consumer_discretionary: number;
  sp500_consumer_staples: number;
  sp500_energy: number;
  sp500_financials: number;
  sp500_healthcare: number;
  sp500_industrials: number;
  sp500_information_technology: number;
  sp500_materials: number;
  sp500_telecom_services: number;
  sp500_utilities: number;
  sp500_real_estate: number;
  sp500_technology: number;
  sp500_oil_gas: number;
  sp500_insurance_industry: number;
}

const SectorMacroChart: React.FC = () => {
  const [data, setData] = useState<ApiData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1yr'); // Default period
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Specify the type of the response data as ApiData[]
        const response = await axios.post<ApiData[]>('/api/sector_macro/', { period: selectedPeriod });
        setData(response.data); // Now TypeScript knows that response.data is of type ApiData[]
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  // Handle button clicks to change the period
  const handleButtonClick = (period: string) => {
    setSelectedPeriod(period);
  };

  return (
    <>
    <Container>
    <Card
      elevation={3}
      sx={{
        width: '100%', // Ensure the card takes the full width
        marginTop: 2,
        marginBottom: 2,
        borderRadius: 3,
        padding:5,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
      }}
    >    <Box>
      <Typography variant="h5" color='#002060' align='center' mb={2}>
        Sector Performance ({selectedPeriod})
      </Typography>

      <Box display="flex" gap={2} mb={2}>
    {['1yr', '5yr', '3yr', '1m', '3m', '6m'].map((period) => (
      <Button
        key={period}
        variant={selectedPeriod === period ? 'contained' : 'outlined'}
        onClick={() => handleButtonClick(period)}
      >
        {period}
      </Button>
    ))}
  </Box>      

      {/* Loading state */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* Render lines for each sector */}
            <Line type="monotone" dataKey="snp_500" stroke="#8884d8" />
            <Line type="monotone" dataKey="dow_jones" stroke="#82ca9d" />
            <Line type="monotone" dataKey="russell_2000" stroke="#ffc658" />
            <Line type="monotone" dataKey="sp500_consumer_discretionary" stroke="#ff7300" />
            <Line type="monotone" dataKey="sp500_consumer_staples" stroke="#00C49F" />
            <Line type="monotone" dataKey="sp500_energy" stroke="#FFBB28" />
            <Line type="monotone" dataKey="sp500_financials" stroke="#FF8042" />
            <Line type="monotone" dataKey="sp500_healthcare" stroke="#FF0033" />
            <Line type="monotone" dataKey="sp500_industrials" stroke="#7C4DFF" />
            <Line type="monotone" dataKey="sp500_information_technology" stroke="#8E24AA" />
            <Line type="monotone" dataKey="sp500_materials" stroke="#9E9E9E" />
            <Line type="monotone" dataKey="sp500_telecom_services" stroke="#607D8B" />
            <Line type="monotone" dataKey="sp500_utilities" stroke="#039BE5" />
            <Line type="monotone" dataKey="sp500_real_estate" stroke="#4CAF50" />
            <Line type="monotone" dataKey="sp500_technology" stroke="#D32F2F" />
            <Line type="monotone" dataKey="sp500_oil_gas" stroke="#2196F3" />
            <Line type="monotone" dataKey="sp500_insurance_industry" stroke="#FF5722" />
          </LineChart>
        </ResponsiveContainer>
        
        
      )}
   
    </Box>
    </Card>
    </Container>
   
  </>
  );
};

export default SectorMacroChart;
