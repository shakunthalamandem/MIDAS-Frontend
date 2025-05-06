import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  MenuItem,
  Select,
  InputAdornment,
  Tab,
  Tabs,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';

interface NewDealFormMainTableProps {
  selecteditems: any;
}

function flattenObject(obj: any, result: Record<string, any> = {}): Record<string, any> {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], result);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

const dropdownOptions: Record<string, string[]> = {
  region: ['US', 'EMEA', 'APAC', 'Non-US America'],
  deal_type: ['IPO', 'FO'],
  fo_type: ['Marketed', 'Overnight', 'Block'],
  sector: [
    "Health Care", "Information Technology", "Financials", "Consumer Staples", "Real Estate",
    "Materials", "Industrials", "Energy", "Utilities", "Consumer Discretionary", "Communication Services"
  ],
  deal_captain: ['Robin', 'Tom', 'Block', 'HC', 'Jay', 'Others'],
};

const NewDealFormMainTable: React.FC<NewDealFormMainTableProps> = ({ selecteditems }) => {
  const [formData, setFormData] = useState<any>({});
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');
  const [tabIndex, setTabIndex] = useState(0); // State to manage active tab

  const dateFields = ["launch_date", "trade_date", "settlement_date", "next_results_date", "pricing_date"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem('access_token');

        if (!apiUrl) throw new Error('API URL is not defined in environment variables');
        if (!token) throw new Error('Access token is missing');

        const response = await axios.post(
          `${apiUrl}/api/equity_deal_form/`,
          selecteditems,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selecteditems]);

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<any> | SelectChangeEvent<any>,
    section: string,
    key: string
  ) => {
    if (!isEditMode) {
      setSnackbarMessage('Please click "Edit" to make changes');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const updatedFormData = { ...formData };
    updatedFormData[section][key] = e.target.value;
    setFormData(updatedFormData);
  };

  const handleDateChange = (date: any, section: string, key: string) => {
    const updatedFormData = { ...formData };
    updatedFormData[section][key] = date;
    setFormData(updatedFormData);
  };

  const handleSave = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem('access_token');

      if (!apiUrl) throw new Error('API URL is not defined in environment variables');
      if (!token) throw new Error('Access token is missing');

      const flattenedData = flattenObject(formData);
      const { company_details, ...payloadData } = flattenedData;

      const sanitizedPayloadData = Object.keys(payloadData).reduce((acc: Record<string, any>, key) => {
        const value = payloadData[key];
        if (typeof value === "string") {
          const trimmedValue = value.trim();
          acc[key] = trimmedValue !== "" ? trimmedValue : "";
        } else if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const payload = {
        ticker: selecteditems.ticker,
        ...sanitizedPayloadData
      };

      const response = await axios.post(
        `${apiUrl}/api/update_data/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Save API Response:', response.data);
      setIsEditMode(false);
      setIsEditable(false);

      // Show success snackbar
      setSnackbarMessage('Form updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving form:', error);

      // Show error snackbar
      setSnackbarMessage('Failed to save form. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setIsEditable(true);
  };

  const capitalizeLabel = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderInputField = (section: string, key: string, value: any) => {
    const isDropdown = Object.keys(dropdownOptions).includes(key);
    const isDateField = dateFields.includes(key);

    const handleFieldClick = () => {
      if (!isEditMode) {
        setSnackbarMessage('Please click "Edit" to make changes');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
      }
    };

    if (isDateField) {
      let formattedDate = '';
      if (value) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }

      return (
        <TextField
          fullWidth
          type="date"
          value={formattedDate}
          onClick={handleFieldClick}
          onChange={(e) => handleInputChange(e, section, key)}
          variant="outlined"
          disabled={!isEditable}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            '& .MuiInputBase-input': {
              padding: '6px 8px',
              fontSize: '12px',
              color: '#4d4d4d',
            },
            height: '30px',
          }}
        />
      );
    }

    if (isDropdown) {
      return (
        <Select
          fullWidth
          value={value || ''}
          onClick={handleFieldClick}
          onChange={(e) => handleInputChange(e, section, key)}
          variant="outlined"
          disabled={!isEditable}
          sx={{
            fontSize: '13px',
            height: '30px',
            '& .MuiInputBase-root': {
              padding: '4px 10px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: '4px',
            },
            '& .MuiSelect-icon': {
              top: '50%',
              transform: 'translateY(-50%)',
            }
          }}
        >
          {dropdownOptions[key].map((option) => (
            <MenuItem
              key={option}
              value={option}
              sx={{
                fontSize: '12px',
                padding: '4px 10px',
                height: '30px',
              }}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
      );
    }

    return (
      <TextField
        fullWidth
        value={value || ''}
        onClick={handleFieldClick}
        onChange={(e) => handleInputChange(e, section, key)}
        variant="outlined"
        disabled={!isEditable}
        sx={{
          '& .MuiInputBase-input': {
            padding: '6px 8px',
            fontSize: '12px',
            color: '#4d4d4d',
          },
          height: '30px',
        }}
      />
    );
  };

  const renderFormFields = (section: string, sectionData: any) => {
    if (!sectionData) return null;

    const entries = Object.entries(sectionData);
    const rows = [];

    for (let i = 0; i < entries.length; i += 2) {
      const firstField = entries[i];
      const secondField = entries[i + 1];

      rows.push(
        <TableRow
          key={i}
          sx={{
            backgroundColor: i % 4 === 0 ? '#f3f3f3' : '#fff',
            height: '40px', 
            '& td': {
              padding: '4px',
              height: '40px',
              verticalAlign: 'middle',
            },
          }}
        >
          {/* First Field */}
          <TableCell
            sx={{
              fontWeight: 'bold',
              fontSize: '0.85rem',
              width: '15%',
              whiteSpace: 'nowrap',
              height: '40px',  
              padding: '4px',  
            }}
          >
            {capitalizeLabel(firstField[0])}
          </TableCell>
          <TableCell sx={{ width: '12%', padding: '4px', height: '20px' }}>
            {renderInputField(section, firstField[0], firstField[1])}
          </TableCell>

          {/* Second Field */}
          {secondField ? (
            <>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  width: '15%',
                  whiteSpace: 'nowrap',
                  height: '40px', 
                  padding: '4px', 
                }}
              >
                {capitalizeLabel(secondField[0])}
              </TableCell>
              <TableCell sx={{ width: '12%', padding: '4px', height: '40px' }}>
                {renderInputField(section, secondField[0], secondField[1])}
              </TableCell>
            </>
          ) : (
            <>
              <TableCell />
              <TableCell />
            </>
          )}
        </TableRow>
      );
    }

    return rows;
  };

  const renderSection = (title: string, sectionKey: string) => (
    <Container maxWidth="lg">
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="h5"
              align="center"
              color="#6501c4"
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              {title}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} textAlign="right">
              <Button
                variant="contained"
                color={isEditMode ? 'success' : 'primary'}
                onClick={isEditMode ? handleSave : handleEditClick}
              >
                {isEditMode ? 'Save' : 'Edit'}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {renderFormFields(sectionKey, formData[sectionKey])}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );

  return (
    <Box
      sx={{
        marginTop: 2,
        padding: 4,
        width: '100%',
        minHeight: '90vh',
        backgroundColor: '#fafafa',
      }}
    >
      {/* Tabs component to manage different sections */}
      <Tabs
        value={tabIndex}
        onChange={(e, newTabIndex) => setTabIndex(newTabIndex)}
        aria-label="tab navigation"
        sx={{ marginBottom: 2 }}
      >
        <Tab label="Basic Info" />
        <Tab label="Market Data" />
        <Tab label="Deal Color" />
      </Tabs>

      {/* Conditionally render content based on selected tab */}
      {tabIndex === 0 && renderSection('Basic Info', 'basic_info')}
      {tabIndex === 1 && renderSection('Market Data', 'market_data')}
      {tabIndex === 2 && renderSection('Deal Color', 'deal_color')}

      {/* Snackbar component for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default NewDealFormMainTable;
