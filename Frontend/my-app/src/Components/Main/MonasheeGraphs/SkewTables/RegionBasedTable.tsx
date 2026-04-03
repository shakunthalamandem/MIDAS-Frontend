// RegionBasedTable.tsx

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
import RegionTableData from './RegionTableData';
import NoDataPopup from '../../../../Pages/NoDataPopup';

interface SkewTableOptions {
    'start year': number[];
    'end year': number[];
    dealType: string[];
    sector: string[];
}

const RegionBasedTable: React.FC = () => {
    const [startYear, setStartYear] = useState<number>(2001);
    const [endYear, setEndYear] = useState<number>(2026);
    const [dealTypes, setDealTypes] = useState<string[]>(['All']);
    const [sectors, setSectors] = useState<string[]>(['All']);

    const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
    const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
    const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
    const [sectorOptions, setSectorOptions] = useState<string[]>([]);
    const [noDataPopupOpen, setNoDataPopupOpen] = useState<boolean>(false);

    const [data, setData] = useState<any>(null);
    const [totals, setTotals] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const menuProps = { PaperProps: { style: { maxHeight: 260 } } };

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const token = localStorage.getItem("access_token");
                const response = await axios.get(`${apiUrl}/api/skew_table_filters/`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });
                const result = response.data as SkewTableOptions;
                setStartYearOptions(result['start year']);
                setEndYearOptions(result['end year']);
                setDealTypeOptions(result.dealType);
                setSectorOptions(result.sector);
            } catch (err) {
                console.error("Error fetching filters", err);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        if (dealTypeOptions.length === 0 || sectorOptions.length === 0) return;

        const effectiveDealTypes = dealTypes.includes('All') ? dealTypeOptions : dealTypes;
        const effectiveSectors = sectors.includes('All') ? sectorOptions : sectors;

        const fetchData = async () => {
            const requestData = {
                filters: {
                    year_range: [startYear, endYear],
                    deal_type: effectiveDealTypes,
                    sector: effectiveSectors,
                }
            };

            try {
                setLoading(true);
                const apiUrl = process.env.REACT_APP_API_URL;
                const token = localStorage.getItem("access_token");

                const response = await axios.post(`${apiUrl}/api/skewtable/calculations/`, requestData, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    }
                });

                const res = response.data as any;
                if (!res.Regionwise || Object.keys(res.Regionwise).length === 0) {
                    setNoDataPopupOpen(true);
                    setData(null);
                } else {
                    setData(res.Regionwise);
                    setTotals(res.regionwise_total);
                }
            } catch (err) {
                setNoDataPopupOpen(true);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [startYear, endYear, dealTypes, sectors, dealTypeOptions, sectorOptions]);

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
        setSectors(['All']);
    };

    const handleRowClick = (regionName: string) => {
        const filters = {
            year_range: [startYear, endYear],
            deal_type: dealTypes.includes('All') ? dealTypeOptions : dealTypes,
            sector: sectors.includes('All') ? sectorOptions : sectors,
        };
        sessionStorage.setItem('detailedRegionState', JSON.stringify({ filters, broad_region: [regionName] }));
        window.open('/detailed-region', '_blank');
    };

    const filteredEndYearOptions = endYearOptions.filter((y) => y >= startYear);

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
                            Region Based Filtered Data
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
                                        {dealTypeOptions.map((type) => (
                                            <MenuItem key={type} value={type} dense>
                                                <Checkbox checked={dealTypes.includes(type)} size="small" sx={{ py: 0 }} />
                                                <ListItemText primary={type} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Sector */}
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth variant="outlined" size="small">
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
                                        {sectorOptions.map((sec) => (
                                            <MenuItem key={sec} value={sec} dense>
                                                <Checkbox checked={sectors.includes(sec)} size="small" sx={{ py: 0 }} />
                                                <ListItemText primary={sec} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                    {loading ? (
                        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
                    ) : (
                        data && <RegionTableData data={data} totals={totals} onRowClick={handleRowClick} />
                    )}
                </CardContent>
            </Card>
            <NoDataPopup open={noDataPopupOpen} onClose={handleClosePopup} />
        </Container>
    );
};

export default RegionBasedTable;
