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
  SelectChangeEvent,
  Checkbox,
  ListItemText,
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
  Top_Countries_Total: CountryTotalData;
}

interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  dealType: string[];
  region: string[];
  sector: string[];
  spac: string[];
}

const CountryBasedTable: React.FC = () => {
  const [countryData, setCountryData] = useState<CountryData[] | null>(null);
  const [countryTotalData, setCountryTotalData] = useState<CountryTotalData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [noDataPopupOpen, setNoDataPopupOpen] = useState<boolean>(false);

  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number>(2026);
  const [dealTypes, setDealTypes] = useState<string[]>(['All']);
  const [regions, setRegions] = useState<string[]>(['All']);
  const [sectors, setSectors] = useState<string[]>(['All']);
  const [spac, setSpac] = useState<string>('Any');

  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  const menuProps = { PaperProps: { style: { maxHeight: 260 } } };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${apiUrl}/api/skew_table_filters/`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
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
    if (!startYear || !endYear || !dealTypeOptions.length || !regionOptions.length || !sectorOptions.length) return;

    const effectiveDealTypes = dealTypes.includes('All') ? dealTypeOptions : dealTypes;
    const effectiveRegions = regions.includes('All') ? regionOptions : regions;
    const effectiveSectors = sectors.includes('All') ? sectorOptions : sectors;

    const fetchCountryData = async () => {
      setLoading(true);
      const innerFilters: any = {
        year_range: [startYear, endYear],
        deal_type: effectiveDealTypes,
        region: effectiveRegions,
        sector: effectiveSectors,
      };
      if (spac !== 'Any') {
        innerFilters.spac = spac;
      }
      const filters = { filters: innerFilters };

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

    fetchCountryData();
  }, [startYear, endYear, dealTypes, regions, sectors, spac, dealTypeOptions, regionOptions, sectorOptions]);

  const handleStartYearChange = (event: SelectChangeEvent<number | string>) => {
    const newStartYear = Number(event.target.value);
    setStartYear(newStartYear);
    setEndYear((prev) => Number(prev) <= newStartYear ? newStartYear + 1 : prev);
  };

  const handleEndYearChange = (event: SelectChangeEvent<number | string>) => {
    setEndYear(Number(event.target.value));
  };

  const handleDealTypesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    if (value[value.length - 1] === 'All') {
      setDealTypes(['All']);
    } else {
      const filtered = value.filter(v => v !== 'All');
      setDealTypes(filtered.length === 0 ? ['All'] : filtered);
    }
  };

  const handleRegionsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    if (value[value.length - 1] === 'All') {
      setRegions(['All']);
    } else {
      const filtered = value.filter(v => v !== 'All');
      setRegions(filtered.length === 0 ? ['All'] : filtered);
    }
  };

  const handleSectorsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    if (value[value.length - 1] === 'All') {
      setSectors(['All']);
    } else {
      const filtered = value.filter(v => v !== 'All');
      setSectors(filtered.length === 0 ? ['All'] : filtered);
    }
  };

  const handleClosePopup = () => {
    setNoDataPopupOpen(false);
    setStartYear(2001);
    setEndYear(2026);
    setDealTypes(['All']);
    setRegions(['All']);
    setSectors(['All']);
    setSpac('Any');
  };

  const filteredEndYearOptions = endYearOptions.filter(year => year >= startYear);

  const renderStringValue = (selected: string[]) => {
    if (selected.includes('All') || selected.length === 0) return 'All';
    if (selected.length === 1) return selected[0];
    return `${selected[0]} +${selected.length - 1} more`;
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#3b3f57', fontWeight: 'bold' }}>
            Top 10 Countries By Deal Volume
          </Typography>

          <Box p={3} mb={3} sx={{ backgroundColor: '#f0f4ff', borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Start Year */}
              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small">
                  <InputLabel>Start Year</InputLabel>
                  <Select
                    value={startYear}
                    onChange={handleStartYearChange}
                    label="Start Year"
                    MenuProps={menuProps}
                    sx={{ backgroundColor: '#e0f7fa', color: '#006064' }}
                  >
                    {startYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* End Year */}
              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small">
                  <InputLabel>End Year</InputLabel>
                  <Select
                    value={endYear}
                    onChange={handleEndYearChange}
                    label="End Year"
                    MenuProps={menuProps}
                    sx={{ backgroundColor: '#e8eaf6', color: '#1a237e' }}
                  >
                    {filteredEndYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Deal Type */}
              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small">
                  <InputLabel>Deal Type</InputLabel>
                  <Select
                    multiple
                    value={dealTypes}
                    onChange={handleDealTypesChange}
                    label="Deal Type"
                    MenuProps={menuProps}
                    renderValue={renderStringValue as any}
                    sx={{ backgroundColor: '#f3e5f5', color: '#6a1b9a' }}
                  >
                    <MenuItem value="All" dense>
                      <Checkbox checked={dealTypes.includes('All')} size="small" sx={{ py: 0 }} />
                      <ListItemText primary="All" primaryTypographyProps={{ fontWeight: 600 }} />
                    </MenuItem>
                    {dealTypeOptions.map((type) => (
                      <MenuItem key={type} value={type} dense>
                        <Checkbox checked={dealTypes.includes(type)} size="small" sx={{ py: 0 }} />
                        <ListItemText primary={type} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Region */}
              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small">
                  <InputLabel>Region</InputLabel>
                  <Select
                    multiple
                    value={regions}
                    onChange={handleRegionsChange}
                    label="Region"
                    MenuProps={menuProps}
                    renderValue={renderStringValue as any}
                    sx={{ backgroundColor: '#ffe0b2', color: '#e65100' }}
                  >
                    <MenuItem value="All" dense>
                      <Checkbox checked={regions.includes('All')} size="small" sx={{ py: 0 }} />
                      <ListItemText primary="All" primaryTypographyProps={{ fontWeight: 600 }} />
                    </MenuItem>
                    {regionOptions.map((r) => (
                      <MenuItem key={r} value={r} dense>
                        <Checkbox checked={regions.includes(r)} size="small" sx={{ py: 0 }} />
                        <ListItemText primary={r} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sector */}
              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small">
                  <InputLabel>Sector</InputLabel>
                  <Select
                    multiple
                    value={sectors}
                    onChange={handleSectorsChange}
                    label="Sector"
                    MenuProps={menuProps}
                    renderValue={renderStringValue as any}
                    sx={{ backgroundColor: '#d1c4e9', color: '#311b92' }}
                  >
                    <MenuItem value="All" dense>
                      <Checkbox checked={sectors.includes('All')} size="small" sx={{ py: 0 }} />
                      <ListItemText primary="All" primaryTypographyProps={{ fontWeight: 600 }} />
                    </MenuItem>
                    {sectorOptions.map((s) => (
                      <MenuItem key={s} value={s} dense>
                        <Checkbox checked={sectors.includes(s)} size="small" sx={{ py: 0 }} />
                        <ListItemText primary={s} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* SPAC */}
              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small">
                  <InputLabel>SPAC</InputLabel>
                  <Select
                    value={spac}
                    onChange={(e) => setSpac(e.target.value as string)}
                    label="SPAC"
                    MenuProps={menuProps}
                    sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}
                  >
                    <MenuItem value="Any">Any</MenuItem>
                    <MenuItem value="Y">Y</MenuItem>
                    <MenuItem value="N">N</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
          ) : countryData && (
            <CountryTableData data={countryData} total={countryTotalData} />
          )}
        </CardContent>
      </Card>

      <NoDataPopup open={noDataPopupOpen} onClose={handleClosePopup} />
    </Container>
  );
};

export default CountryBasedTable;
