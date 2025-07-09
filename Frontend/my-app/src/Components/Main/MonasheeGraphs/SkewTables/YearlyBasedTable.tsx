import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Grid,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import YearlyTableData from './YearlyTableData'; // Import YearlyTableData component
import NoDataPopup from '../../../../Pages/NoDataPopup';
import { useNavigate } from 'react-router-dom';


interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  dealType: string[];
  region: string[];
  sector: string[];
}

const YearlyBasedTable: React.FC = () => {
  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number>(2025);
  const [dealType, setDealType] = useState<string>('All');
  const [region, setRegion] = useState<string>('All');
  const [sector, setSector] = useState<string[]>([]);


  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);
  const [sectorwiseData, setSectorwiseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [openNoDataPopup, setOpenNoDataPopup] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    (async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        if (!apiUrl) throw new Error('API URL not defined');
        const res = await axios.get(`${apiUrl}/api/skew_table_filters/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          }
        });
        const data = res.data as SkewTableOptions;
        setStartYearOptions(data['start year']);
        setEndYearOptions(data['end year']);
        setDealTypeOptions(data['dealType']);
        setRegionOptions(data['region']);
        setSectorOptions(data['sector']);
      } catch (e) {
        console.error('Error fetching filters', e);
      }
    })();
  }, []);

  // Fetch data whenever filters change
  useEffect(() => {
    if (!(dealType && region && endYear && startYear)) return;
    (async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        const filters = {
          year_range: [startYear, endYear],
          deal_type: dealType === 'All' ? dealTypeOptions : [dealType],
          region: region === 'All' ? regionOptions : [region],
          sector: sector.length > 0 ? sector : sectorOptions,
        };
        const res = await axios.post(
          `${apiUrl}/api/skewtable/calculations/`,
          { filters },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            }
          }
        );
        if (res.data === "No data found matching the specified filters.") {
          setSectorwiseData(null);
          setOpenNoDataPopup(true);
        } else {
          setSectorwiseData(res.data);
        }
      } catch {
        setOpenNoDataPopup(true);
      }finally {
        setLoading(false); // <-- Set loading false after request
      }
    })();
  }, [startYear, endYear, dealType, region, sector, dealTypeOptions, regionOptions, sectorOptions]);

  const handleStartYearChange = (e: SelectChangeEvent<number | string>) => {
    const val = Number(e.target.value);
    setStartYear(val);
    setEndYear(val + 1);
  };
  const handleEndYearChange = (e: SelectChangeEvent<number | string>) => setEndYear(Number(e.target.value));
  const handleDealTypeChange = (e: SelectChangeEvent<string>) => setDealType(e.target.value);
  const handleRegionChange = (e: SelectChangeEvent<string>) => setRegion(e.target.value);

  const filteredEndYearOptions = endYearOptions.filter(y => y >= startYear);

  const handleCloseNoDataPopup = () => {
    setOpenNoDataPopup(false);
    // Reset filters
    setStartYear(2001);
    setEndYear(2002);
    setDealType("All");
    setRegion("All");
    setSector([]);
  };


  const handleSectorRowClick = (clickedSector: string) => {
    const filters = {
      year_range: [startYear, endYear],
      deal_type: dealType === 'All' ? [] : [dealType],
      broad_region: region === 'All' ? [] : [region],
      sector: [clickedSector],
    };

    const url = '/detailed-deals';
    const data = { filters, sector: clickedSector };
    sessionStorage.setItem('detailedDealsState', JSON.stringify(data));
    window.open(url, '_blank');
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box p={3} sx={{ backgroundColor: '#f0f4ff', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#3b3f57', fontWeight: 'bold' }}>
              Sector Based Filtered Data
            </Typography>
            <Grid container spacing={2}>
              {/* Start Year */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Start Year</InputLabel>
                  <Select
                    value={startYear}
                    onChange={handleStartYearChange}
                    label="Start Year"
                    sx={{ backgroundColor: '#e0f7fa', color: '#006064' }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200, // Adjust the height as needed
                          overflow: 'auto',
                        },
                      },
                    }}
                  >
                    {startYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* End Year */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>End Year</InputLabel>
                  <Select
                    value={endYear}
                    onChange={handleEndYearChange}
                    label="End Year"
                    sx={{ backgroundColor: '#e8eaf6', color: '#1a237e' }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200, // Adjust the height as needed
                          overflow: 'auto',
                        },
                      },
                    }}
                    disabled={filteredEndYearOptions.length === 0} // Disable if no valid options
                  >
                    {filteredEndYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Deal Type */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Deal Type</InputLabel>
                  <Select value={dealType} onChange={handleDealTypeChange} label="Deal Type" sx={{ backgroundColor: '#f3e5f5', color: '#6a1b9a' }}>
                    <MenuItem value="All">All</MenuItem>
                    {dealTypeOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              {/* Region */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Region</InputLabel>
                  <Select value={region} onChange={handleRegionChange} label="Region" sx={{ backgroundColor: '#ffe0b2', color: '#e65100' }}>
                    <MenuItem value="All">All</MenuItem>
                    {regionOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Data Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        sectorwiseData && (
          <YearlyTableData
            data={sectorwiseData}
            onRowClick={handleSectorRowClick}
          />
        )
      )}
      {/* No data popup */}
      <NoDataPopup open={openNoDataPopup} onClose={handleCloseNoDataPopup} />
    </Container>
  );
};

export default YearlyBasedTable;
