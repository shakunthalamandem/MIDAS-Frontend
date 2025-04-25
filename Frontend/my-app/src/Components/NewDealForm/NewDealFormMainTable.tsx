import { Box, Typography, TextField, Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

const NewDealFormMainTable: React.FC<NewDealFormMainTableProps> = ({ selecteditems }) => {
  const [formData, setFormData] = useState<any>({});
  const [isEditable, setIsEditable] = useState<boolean>(false);

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
        console.log('API Response:', response.data);
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
      if (!token) throw new Error('Access token is missing');

      const flattenedData = flattenObject(formData);

      const { company_details, ...payloadData } = flattenedData;

// Sanitize the payload data to ensure no extra spaces and null values
const sanitizedPayloadData = Object.keys(payloadData).reduce((acc: Record<string, any>, key) => {
  const value = payloadData[key];

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (trimmedValue !== "") {
      acc[key] = trimmedValue; // Add only non-empty strings
    } else {
      acc[key] = ""; // Set empty strings to "" instead of null
    }
  } else if (value !== null && value !== undefined) {
    acc[key] = value; // Add non-string values or non-null fields
  }

  return acc;
}, {});



      const payload = {
        ticker: selecteditems.ticker,
        ...sanitizedPayloadData  
      };

      const response = await axios.post(
        `${apiUrl}/api/get_data/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Save API Response:', response.data);
      setIsEditable(false);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const renderFormFields = (section: string, sectionData: any) => {
    if (!sectionData) return null;

    const entries = Object.entries(sectionData);

    const splitEntries = [];
    for (let i = 0; i < entries.length; i += 3) {
      splitEntries.push(entries.slice(i, i + 3));
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
              disabled={!isEditable}
              sx={{
                width: '90%',
                padding: '10px',
                height: '40px',
                display: 'flex',
                justifyContent: 'center',
                '& .MuiInput-root': {
                  height: '40px',
                  '&:hover:not(.Mui-disabled):before': {
                    borderBottom: '2px solid #002060',
                  },
                  '&.Mui-focused:before': {
                    borderBottom: '2px solid #002060',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '10px',
                  fontSize: '15px',
                  color: '#4d4d4d',
                },
                '& .MuiInputLabel-root': {
                  color: '#4d4d4d',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#002060',
                },
              }}
            />
          </td>
        ))}
      </tr>
    ));
  };

  const capitalizeLabel = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
