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
  CircularProgress,
  Checkbox,
  ListItemText,
} from '@mui/material';
import axios from 'axios';
import YearlyTableData from './YearlyTableData';
import NoDataPopup from '../../../../Pages/NoDataPopup';
import { useNavigate } from 'react-router-dom';

interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  dealType: string[];
  region: string[];
  sector: string[];
  spac: string[];
}

const YearlyBasedTable: React.FC = () => {
  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number>(2026);
  const [dealTypes, setDealTypes] = useState<string[]>(['All']);
  const [regions, setRegions] = useState<string[]>(['All']);
  const [spac, setSpac] = useState<string>('Any');

  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);
  const [sectorwiseData, setSectorwiseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [openNoDataPopup, setOpenNoDataPopup] = useState(false);

  const navigate = useNavigate();
  const menuProps = { PaperProps: { style: { maxHeight: 260 } } };

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

  useEffect(() => {
    if (dealTypeOptions.length === 0 || regionOptions.length === 0 || sectorOptions.length === 0) return;

    const effectiveDealTypes = dealTypes.includes('All') ? dealTypeOptions : dealTypes;
    const effectiveRegions = regions.includes('All') ? regionOptions : regions;

    (async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        const filters: any = {
          year_range: [startYear, endYear],
          deal_type: effectiveDealTypes,
          region: effectiveRegions,
          sector: sectorOptions,
        };
        if (spac !== 'Any') {
          filters.spac = spac;
        }
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
      } finally {
        setLoading(false);
      }
    })();
  }, [startYear, endYear, dealTypes, regions, spac, dealTypeOptions, regionOptions, sectorOptions]);

  const handleStartYearChange = (event: SelectChangeEvent<number | string>) => {
    const newStartYear = Number(event.target.value);
    setStartYear(newStartYear);
    setEndYear((prev) => prev <= newStartYear ? newStartYear + 1 : prev);
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

  const filteredEndYearOptions = endYearOptions.filter(y => y >= startYear);

  const handleCloseNoDataPopup = () => {
    setOpenNoDataPopup(false);
    setStartYear(2001);
    setEndYear(2026);
    setDealTypes(['All']);
    setRegions(['All']);
    setSpac('Any');
  };

  const handleSectorRowClick = (clickedSector: string) => {
    const filters = {
      year_range: [startYear, endYear],
      deal_type: dealTypes.includes('All') ? [] : dealTypes,
      broad_region: regions.includes('All') ? [] : regions,
      sector: [clickedSector],
    };
    const url = '/detailed-deals';
    const data = { filters, sector: clickedSector };
    sessionStorage.setItem('detailedDealsState', JSON.stringify(data));
    window.open(url, '_blank');
  };

  const renderStringValue = (selected: string[]) => {
    if (selected.includes('All') || selected.length === 0) return 'All';
    if (selected.length === 1) return selected[0];
    return `${selected[0]} +${selected.length - 1} more`;
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
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>End Year</InputLabel>
                  <Select
                    value={endYear}
                    onChange={handleEndYearChange}
                    label="End Year"
                    MenuProps={menuProps}
                    sx={{ backgroundColor: '#e8eaf6', color: '#1a237e' }}
                    disabled={filteredEndYearOptions.length === 0}
                  >
                    {filteredEndYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Deal Type */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
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
                    {dealTypeOptions.map((t) => (
                      <MenuItem key={t} value={t} dense>
                        <Checkbox checked={dealTypes.includes(t)} size="small" sx={{ py: 0 }} />
                        <ListItemText primary={t} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Region */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
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

              {/* SPAC */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth variant="outlined" size="small">
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
          ) : (
            sectorwiseData && (
              <YearlyTableData data={sectorwiseData} onRowClick={handleSectorRowClick} />
            )
          )}
        </CardContent>
      </Card>

      <NoDataPopup open={openNoDataPopup} onClose={handleCloseNoDataPopup} />
    </Container>
  );
};

export default YearlyBasedTable;
