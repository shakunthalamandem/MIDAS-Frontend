import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import axios from 'axios';
import CountryTableData from './CountryTableData';
import NoDataPopup from '../../../../Pages/NoDataPopup';

interface CountryData {
  country_code: string;
  Total_Deal_Count: number;
  Total_Deal_Volume: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  Average_T1M_Abs_Return_of_Positively: number;
  Average_T1M_Abs_Return_of_Negatively: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
}

interface CountryTotalData {
  Total_Deal_Count_Sum: number;
  Total_Deal_Volume_Sum: number;
  Total_Postively_Performing_Deals: number;
  Total_Negatively_Performing_Deals: number;
  Total_Returns_positively: number;
  Total_Returns_negatively: number;
  Total_Expected_returns_excess: number;
  Total_Long_Opportunity_Value: number;
}

interface CountryApiResponse {
  Top_Countries: CountryData[];
  Top_Countries_Total : CountryTotalData;
}

interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  dealType: string[];
  region: string[];
  sector: string[];
}

const CountryBasedTable: React.FC = () => {
  const [countryData, setCountryData] = useState<CountryData[] | null>(null);
  const [countryTotalData, setCountryTotalData] = useState<CountryTotalData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [noDataPopupOpen, setNoDataPopupOpen] = useState<boolean>(false);

  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number | string>(2025);
  const [dealType, setDealType] = useState<string>('All');
  const [region, setRegion] = useState<string>('All');
  const [sector, setSector] = useState<string>('All');

  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${apiUrl}/api/skew_table_filters/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          }
        });

        const data = response.data as SkewTableOptions;
        setStartYearOptions(data['start year']);
        setEndYearOptions(data['end year']);
        setDealTypeOptions(data['dealType']);
        setRegionOptions(data['region']);
        setSectorOptions(data['sector']);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchCountryData = async () => {
      setLoading(true);

      const filters = {
        filters: {
          year_range: [startYear, endYear],
          deal_type: dealType === 'All' ? dealTypeOptions : [dealType],
          region: region === 'All' ? regionOptions : [region],
          sector: sector === 'All' ? sectorOptions : [sector],
        }
      };

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const response = await axios.post(
          `${apiUrl}/api/top_countries/`,
          filters,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          }
        );

        const result = response.data as CountryApiResponse;

        if (result?.Top_Countries?.length > 0) {
          setCountryData(result.Top_Countries);
          setCountryTotalData(result.Top_Countries_Total);
        } else {
          setNoDataPopupOpen(true);
          setCountryData(null);
        }
      } catch (error) {
        console.error('Error fetching country data:', error);
        setNoDataPopupOpen(true);
        setCountryData(null);
      } finally {
        setLoading(false);
      }
    };

    if (startYear && endYear && dealTypeOptions.length && regionOptions.length && sectorOptions.length) {
      fetchCountryData();
    }
  }, [startYear, endYear, dealType, region, sector, dealTypeOptions, regionOptions, sectorOptions]);

  const handleStartYearChange = (event: SelectChangeEvent<number | string>) => {
    const newStartYear = Number(event.target.value);
    setStartYear(newStartYear);
    setEndYear(newStartYear + 1);
  };

  const handleEndYearChange = (event: SelectChangeEvent<number | string>) => {
    setEndYear(Number(event.target.value));
  };

  const handleDealTypeChange = (event: SelectChangeEvent<string>) => {
    setDealType(event.target.value);
  };

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    setRegion(event.target.value);
  };

  const handleSectorChange = (event: SelectChangeEvent<string>) => {
    setSector(event.target.value);
  };

  const handleClosePopup = () => {
    setNoDataPopupOpen(false);
    setStartYear(2001);
    setEndYear(2025);
    setDealType("All");
    setRegion("All");
    setSector("All");
  };

  const filteredEndYearOptions = endYearOptions.filter(year => year >= startYear);

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#3b3f57', fontWeight: 'bold' }}>
            Top 10 Countries By Deal Volume
          </Typography>

          <Box p={3} mb={3} sx={{ backgroundColor: '#f0f4ff', borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Start Year</InputLabel>
                  <Select
                    value={startYear}
                    onChange={handleStartYearChange}
                    label="Start Year"
                    sx={{ backgroundColor: '#e0f7fa', color: '#006064' }}
                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                  >
                    {startYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>End Year</InputLabel>
                  <Select
                    value={endYear}
                    onChange={handleEndYearChange}
                    label="End Year"
                    sx={{ backgroundColor: '#e8eaf6', color: '#1a237e' }}
                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                  >
                    {filteredEndYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Deal Type</InputLabel>
                  <Select
                    value={dealType}
                    onChange={handleDealTypeChange}
                    label="Deal Type"
                    sx={{ backgroundColor: '#f3e5f5', color: '#6a1b9a' }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {dealTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={region}
                    onChange={handleRegionChange}
                    label="Region"
                    sx={{ backgroundColor: '#ffe0b2', color: '#e65100' }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {regionOptions.map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sector</InputLabel>
                  <Select
                    value={sector}
                    onChange={handleSectorChange}
                    label="Sector"
                    sx={{ backgroundColor: '#d1c4e9', color: '#311b92' }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {sectorOptions.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
          ) : countryData && (
            <CountryTableData
              data={countryData}
              total={countryTotalData}
            />
          )}
        </CardContent>
      </Card>

      <NoDataPopup open={noDataPopupOpen} onClose={handleClosePopup} />
    </Container>
  );
};

export default CountryBasedTable;
