import React from 'react';
import { Typography, Card, CardContent, Box } from '@mui/material';

const componentData = [
  { title: 'Deal Flow – IPO and FO (2023 to 2025) by Quarter', content: 'This section contains data on IPO and FO deal flow from 2023 to 2025, broken down by each quarter.' },
  { title: 'Skew Table - IPO and FO Deals from 2023 to 2025 for Q1', content: 'This section shows the skew analysis of IPO and FO deals for Q1 across 2023 to 2025.' },
  { title: 'Sector-wise Skew Table for 2025 (Q1) with Top 3 Highlights', content: 'Sector-based analysis for Q1 2025 with top 3 sectoral highlights included.' },
  { title: 'Quarterly Weighted Allocation Trends (2024-2025)', content: 'Weighted allocation trends for each quarter from 2024 to 2025 are analyzed here.' },
  { title: '2025 YTD GAP Analysis', content: 'A year-to-date gap analysis for 2025 summarizing discrepancies and performance.' },
  { title: 'Sector Wise IPO and FO Data for 2025', content: 'A breakdown of IPO and FO activity across various sectors for the year 2025.' },
  { title: 'Summary Gap Metrics', content: 'This section summarizes the gap metrics across multiple segments for easy review.' },
];

//Styles added

const cardStyles = [
  { height: '440px', padding: '1px' },
  { height: '430px', padding: '1px' },
  { height: '480px', padding: '1px', mb: '20px' }, 
  { height: '420px', padding: '1px' },
  { height: '460px', padding: '1px', mb: '100px' },
  { height: '560px', padding: '1px', mb: '200px'},
  { height: '500px', padding: '1px' },
];

const InsightsMain = () => {
  return (
    <>
      <Typography
        color="#0bbaf1"
        align="center"
        variant="h6"
        fontWeight="bold"
        sx={{ mb: 2.5, mt: 2.5 }} 
      >
        AI Insights
      </Typography>

      {componentData.map((item, index) => (
        <Box
          key={index}
          sx={{
            height: cardStyles[index]?.height || '440px',
            p: 1,
          }}
        >
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              ...cardStyles[index],
            }}
          >
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.content}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ))}
    </>
  );
};

export default InsightsMain;
