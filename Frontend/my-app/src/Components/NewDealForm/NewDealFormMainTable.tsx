import { Box, Typography, TextField, Grid, Button } from '@mui/material';
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

    return Object.keys(sectionData).map((key) => (
      <Grid container spacing={2} key={key}>
        <Grid item xs={4}>
          <Typography variant="body1">{key.replace(/_/g, ' ').toUpperCase()}</Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            fullWidth
            value={sectionData[key] || ''}
            onChange={(e) => handleInputChange(e, section, key)}
            label={key.replace(/_/g, ' ')}
            variant="outlined"
            disabled={!isEditable} // Disable the field when not in edit mode
          />
        </Grid>
      </Grid>
    ));
  };

  return (
    <Box sx={{ marginTop: 3, padding: 2, border: '1px solid #ccc' }}>
      <Typography variant="h6">Selected Deal Data</Typography>

      <form>
        <Typography variant="h6" sx={{ marginTop: 2 }}>Company Details</Typography>
        {renderFormFields('company_details', formData.company_details)}

        <Typography variant="h6" sx={{ marginTop: 2 }}>Participation Details</Typography>
        {renderFormFields('participation_details', formData.participation_details)}

        <Typography variant="h6" sx={{ marginTop: 2 }}>Background Data</Typography>
        {renderFormFields('background_data', formData.background_data)}

        <Typography variant="h6" sx={{ marginTop: 2 }}>Monashee Deal Activity</Typography>
        {renderFormFields('monashee_deal_activity', formData.monashee_deal_activity)}

        <Typography variant="h6" sx={{ marginTop: 2 }}>Performance Statistics</Typography>
        {renderFormFields('performance_statistics', formData.performance_statistics)}

        <Typography variant="h6" sx={{ marginTop: 2 }}>After Market Analysis</Typography>
        {renderFormFields('after_market_analysis', formData.after_market_analysis)}

        <Typography variant="h6" sx={{ marginTop: 2 }}>Technical Analysis</Typography>
        {renderFormFields('technical_analysis', formData.technical_analysis)}

        <Typography variant="h6" sx={{ marginTop: 2 }}>Historical Data</Typography>
        {renderFormFields('historical_data', formData.historical_data)}

        {/* Save/Edit buttons */}
        <Box sx={{ marginTop: 3 }}>
          {isEditable ? (
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={() => setIsEditable(true)}>
              Edit
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default NewDealFormMainTable;
