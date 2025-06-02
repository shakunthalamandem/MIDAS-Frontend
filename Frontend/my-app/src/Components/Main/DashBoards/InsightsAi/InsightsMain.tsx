import React from 'react';
import { Typography, Card, CardContent, Box } from '@mui/material';

const componentData = [
  { title: '2025 Q1 Opportunity Value Falls Sharply Despite Strong Deal Flow', content: 'When comparing 2025 Q1 with Q1 of 2024 and 2023, both IPO and FO deal flow show decent activity. However, Opportunity Value (T + 1M Excess) has dropped to one of its lowest points in the last two years. For IPOs in particular, expected return excess is down nearly 75% vs prior Q1s, signaling weaker post-deal performance. ' },
  { title: 'Flat Opportunity Value Amid Stable FO Activity', content: 'Follow-on (FO) deal volumes and counts in 2025 Q1 remain consistent with prior quarters, showing resilience. However, the Opportunity Value for these deals has sharply declined, pointing to a more cautious or saturated market environment where increased issuance is not translating into incremental investor gains.' },
  { title: 'US Market Sees High Deal Volume but Weak Return Metrics', content: 'Despite US IPOs in 2025 Q1 recording 2.5x higher deal volume than EMEA ($11.5B vs $4.8B), their Opportunity Value and Expected Returns Excess (ERE) are significantly lower. A similar trend is observed in Follow-ons, where the US FO deal volume is 16% higher than EMEA, yet the Opportunity Value in EMEA is nearly 5x that of the US—highlighting weaker post-deal performance in the US.' },
  { title: 'APAC Positioned Midway in Return Potential Across Regions', content: ' APAC ranks in the middle in terms of Opportunity Value and Expected Returns Excess for both IPOs and FOs. With a moderate ERE of 7.42% for IPOs and 1.01% for FOs, it outperforms the US but lags behind EMEA—indicating a more balanced but less aggressive return environment.' },
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
