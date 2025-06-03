import React, { useEffect } from 'react';
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

const InsightsMain = () => {
  // Inject rainbow border keyframes once
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes rainbowBorder {
        0% { border-color: red; }
        14% { border-color: orange; }
        28% { border-color: yellow; }
        42% { border-color: green; }
        57% { border-color: blue; }
        71% { border-color: indigo; }
        85% { border-color: violet; }
        100% { border-color: black; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Typography
        color="#1300fc"
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
            p: 1,
            borderRadius: 1,
          }}
        >
      <Card
  elevation={4}
  sx={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '1px',
    border: '2px solid red',
    animation: `rainbowBorder 4s linear infinite`,
    animationDelay: `${index * 0.3}s`, // staggered animation
  }}
>

            <CardContent sx={{ height: '100%' }}>
              <Typography variant="body1" color='#fc0004' fontWeight="bold">
                {item.title}
              </Typography>
              <Typography variant="body2" color="#002060" sx={{ mt: 1 }}>
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
