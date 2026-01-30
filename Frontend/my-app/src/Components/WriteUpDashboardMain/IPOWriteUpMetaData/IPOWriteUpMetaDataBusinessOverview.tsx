import React, { useState, useEffect } from 'react';
import { IconButton, TextField, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface WriteUpData {
  business_overview: string[];
  key_highlights: string[];
  concerns: string[];
  principal_stockholders_preipo: string[];
  key_management_personnel: string[];
  [key: string]: string[];  // Index signature added
}

interface IPOWriteUpMetaDataBusinessOverviewProps {
  basicDealDetails: { ticker: string };
}

const IPOWriteUpMetaDataBusinessOverview: React.FC<IPOWriteUpMetaDataBusinessOverviewProps> = ({ basicDealDetails }) => {
  const [writeUpData, setWriteUpData] = useState<WriteUpData | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null); // Track which section is being edited
  const [updatedData, setUpdatedData] = useState<WriteUpData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { ticker } = basicDealDetails;
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem('access_token');

      try {
        const res = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ ticker }),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await res.json();
        setWriteUpData(data);
        setUpdatedData(data); // Keep a separate copy for editing
      } catch (error) {
        setError('An error occurred while fetching the data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [basicDealDetails]);

  const handleEdit = (section: string) => {
    setEditMode(section);
  };

  const handleSave = async (section: string) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          ticker: basicDealDetails.ticker,
          [section]: updatedData ? updatedData[section] : [],
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save data');
      }

      setEditMode(null); // Exit edit mode after saving
    } catch (error) {
      setError('An error occurred while saving the data');
    }
  };

  const handleChange = (section: string, index: number, value: string) => {
    // Use a type assertion to ensure TypeScript knows the structure
    const newData = { ...updatedData } as WriteUpData; // Ensure the updated data is of type WriteUpData
    if (newData[section]) {
      newData[section][index] = value;
      setUpdatedData(newData);
    }
  };

  const renderEditableSection = (
    section: string,
    data: string[],
  ) => {
    return data.map((item, index) => (
      <div key={index}>
        {editMode === section ? (
          <TextField
            fullWidth
            value={item}
            onChange={(e) => handleChange(section, index, e.target.value)}
            variant="outlined"
            margin="normal"
          />
        ) : (
          <Typography variant="body2" paragraph>
            {item}
          </Typography>
        )}
      </div>
    ));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!writeUpData) {
    return <div>No data available</div>;
  }

  return (
    <div>
      {[
        ['business_overview', 'Business Overview'],
        ['key_highlights', 'Key Highlights'],
        ['concerns', 'Concerns'],
        ['principal_stockholders_preipo', 'Principal Stockholders Pre-IPO'],
        ['key_management_personnel', 'Key Management Personnel'],
      ].map(([section, title]) => (
        <Accordion key={section}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${section}-content`} id={`${section}-header`}>
            <Typography variant="h6">{title}</Typography>
            {editMode === section ? (
              <IconButton onClick={() => handleSave(section)} color="primary" sx={{ marginLeft: 'auto' }}>
                <SaveIcon />
              </IconButton>
            ) : (
              <IconButton onClick={() => handleEdit(section)} color="primary" sx={{ marginLeft: 'auto' }}>
                <EditIcon />
              </IconButton>
            )}
          </AccordionSummary>
          <AccordionDetails>
            {renderEditableSection(section, writeUpData[section] || [])}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default IPOWriteUpMetaDataBusinessOverview;
