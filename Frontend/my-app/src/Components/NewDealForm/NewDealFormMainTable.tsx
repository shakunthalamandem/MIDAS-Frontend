import { Box, Typography, TextField, Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface NewDealFormMainTableProps {
  selecteditems: any; // Replace 'any' with the appropriate type for 'selecteditems'
}

const NewDealFormMainTable: React.FC<NewDealFormMainTableProps> = ({ selecteditems }) => {
  const [formData, setFormData] = useState<any>({});
  const [isEditable, setIsEditable] = useState<boolean>(false); // To toggle edit/save mode

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem('access_token');

        if (!apiUrl) throw new Error('API URL is not defined in environment variables');
        if (!token) throw new Error('Access token is missing');

        // Hit the API with the selecteditems as payload
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

        console.log('API Response:', response.data);

        // Initialize formData with the API response if needed (or set selecteditems directly)
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selecteditems]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: string,
    key: string
  ) => {
    const updatedFormData = { ...formData };
    updatedFormData[section][key] = e.target.value;
    setFormData(updatedFormData);
  };

  const handleSave = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem('access_token');

      if (!apiUrl) throw new Error('API URL is not defined in environment variables');

      const response = await axios.put(
        `${apiUrl}/api/equity_deal_form/`,
        formData, // Send updated form data
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      console.log('Save API Response:', response.data);
      setIsEditable(false); // Disable edit mode after save
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const renderFormFields = (section: string, sectionData: any) => {
    // Ensure that sectionData is defined before attempting to access its keys
    if (!sectionData) return null;

    const entries = Object.entries(sectionData);

    // Split entries into groups of 3 (3 fields per row)
    const splitEntries = [];
    for (let i = 0; i < entries.length; i += 3) {
      splitEntries.push(entries.slice(i, i + 3)); // Create groups of 3 fields
    }

    return splitEntries.map((pair, index) => (
      <tr key={index}>
        {pair.map(([key, value]) => (
          <td style={{ padding: '8px', width: '33%' }} key={key}>
          
          <TextField
  fullWidth
  value={value || ''}
  onChange={(e) => handleInputChange(e, section, key)}
  label={capitalizeLabel(key)}
  variant="filled"
  disabled={!isEditable} // Disable the field when not in edit mode
  sx={{
    width: '90%',
    padding: '10px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    '& .MuiInput-root': {
      height: '40px',
      '&:hover:not(.Mui-disabled):before': {
        borderBottom: '2px solid #002060', // Change border color on hover
      },
      '&.Mui-focused:before': {
        borderBottom: '2px solid #002060', // Change border color when focused
      },
    },
    '& .MuiInputBase-input': {
      padding: '10px',
      fontSize: '15px',
      color: '#4d4d4d', // Set input text color
    },
    '& .MuiInputLabel-root': {
      color: '#4d4d4d', // Set label color
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#002060', // Label color when focused
    },
  }}
/>


          </td>
        ))}
      </tr>
    ));
  };

  // Function to format the label properly (capitalizing each word and replacing underscores with spaces)
  const capitalizeLabel = (key: string) => {
    return key
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
  };

  return (
    <Box sx={{ marginTop: 3, padding: 2, border: '1px solid #ccc' }}>
      <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'flex-end' }}>
        {isEditable ? (
          <Button
            variant="contained"
            sx={{ backgroundColor: '#007777', '&:hover': { backgroundColor: '#005757' } }}
            onClick={handleSave}
          >
            Save
          </Button>
        ) : (
          <Button
            variant="contained"
            sx={{ backgroundColor: '#007777', '&:hover': { backgroundColor: '#005757' } }}
            onClick={() => setIsEditable(true)}
          >
            Edit
          </Button>
        )}
      </Box>

      <form>
        <Typography variant="h6" sx={{ margin: 2, color: '#002060', textAlign: 'center' }}>
          Company Details
        </Typography>
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tbody>{renderFormFields('company_details', formData.company_details)}</tbody>
        </table>

        <Typography variant="h6" sx={{ margin: 2, color: '#002060', textAlign: 'center' }}>
          Participation Details
        </Typography>
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tbody>{renderFormFields('participation_details', formData.participation_details)}</tbody>
        </table>

        <Typography variant="h6" sx={{ margin: 2, color: '#002060', textAlign: 'center' }}>
          Background Data
        </Typography>
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tbody>{renderFormFields('background_data', formData.background_data)}</tbody>
        </table>

        <Typography variant="h6" sx={{ margin: 2, color: '#002060', textAlign: 'center' }}>
          Monashee Deal Activity
        </Typography>
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tbody>{renderFormFields('monashee_deal_activity', formData.monashee_deal_activity)}</tbody>
        </table>

        <Typography variant="h6" sx={{ margin: 2, color: '#002060', textAlign: 'center' }}>
          Performance Statistics
        </Typography>
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tbody>{renderFormFields('performance_statistics', formData.performance_statistics)}</tbody>
        </table>

        <Typography variant="h6" sx={{ margin: 2, color: '#002060', textAlign: 'center' }}>
          After Market Analysis
        </Typography>
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tbody>{renderFormFields('after_market_analysis', formData.after_market_analysis)}</tbody>
        </table>

        <Typography variant="h6" sx={{ margin: 2, color: '#002060', textAlign: 'center' }}>
          Technical Analysis
        </Typography>
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tbody>{renderFormFields('technical_analysis', formData.technical_analysis)}</tbody>
        </table>

        <Typography variant="h6" sx={{ margin: 2, color: '#002060', textAlign: 'center' }}>
          Historical Data
        </Typography>
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tbody>{renderFormFields('historical_data', formData.historical_data)}</tbody>
        </table>
      </form>
    </Box>
  );
};

export default NewDealFormMainTable;
