import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Grid,
  useTheme,
  Tooltip,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const MethodologyAccordion1Day: React.FC = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded((prev) => !prev);

  const keyInputs = [
    'Deal Size ($ Million)',
    'Sponsor (Y/N)',
    'Discount from Announcement Price (%)',
    'Sector',
    'Percentage Primary (%)',
    'Selected Bank',
    'Allocation as % of Deal Size & IOI',
  ];

  const marketIndicators = [
    'GDP Growth & Inflation Rate',
    'Treasury Rates',
    'Sector & Market Returns (3-month, 1-month, 1-week)',
    'NYSE Volume (vs. 1-month average)',
  ];

  // A helper to split array roughly in half for two columns
  const splitArrayInTwo = (arr: string[]) => {
    const middle = Math.ceil(arr.length / 2);
    return [arr.slice(0, middle), arr.slice(middle)];
  };

  const [keyInputsLeft, keyInputsRight] = splitArrayInTwo(keyInputs);
  const [marketLeft, marketRight] = splitArrayInTwo(marketIndicators);

  return (
    <Accordion
      expanded={expanded}
      onChange={handleToggle}
      sx={{
        mt: 4,
        borderRadius: 3,
        boxShadow: theme.shadows[3],
        '&:before': { display: 'none' },
      }}
      elevation={3}
    >
      <AccordionSummary
        aria-controls="methodology-content"
        id="methodology-header"
        sx={{
          bgcolor: theme.palette.grey[100],
          borderRadius: '12px 12px 0 0',
          px: 3,
          py: 2,
          justifyContent: 'space-between',
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 2,
          },
        }}
      >
        <Typography
          variant="h6"
          fontWeight="600"
          color={theme.palette.primary.main}
          letterSpacing={0.5}
        >
          Model Methodology
        </Typography>

        {/* Custom Expand/Collapse Button */}
        <Tooltip title={expanded ? 'Collapse details' : 'Expand details'}>
          <Button
            onClick={(e) => {
              e.stopPropagation(); // prevent accordion toggle twice
              handleToggle();
            }}
            variant="outlined"
            size="small"
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </Tooltip>
      </AccordionSummary>

      <AccordionDetails sx={{ bgcolor: theme.palette.background.paper, px: 3, py: 3 }}>
        <Box mb={3}>
          <Typography
            variant="body1"
            color={theme.palette.text.secondary}
            sx={{ lineHeight: 1.6 }}
          >
            The prediction models analyze a comprehensive set of parameters to forecast the T+1D
            closing price performance.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Key Input Parameters in two columns */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom color={theme.palette.text.primary}>
            Deal Specific Parameters
          </Typography>
          <Grid container spacing={1}>
            {[keyInputsLeft, keyInputsRight].map((column, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <List dense sx={{ pl: 1 }}>
                  {column.map((item, i) => (
                    <ListItem key={i} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Economic & Market Indicators in two columns */}
        <Box>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom color={theme.palette.text.primary}>
            Economic & Macro Indicators:
          </Typography>
          <Grid container spacing={1}>
            {[marketLeft, marketRight].map((column, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <List dense sx={{ pl: 1 }}>
                  {column.map((item, i) => (
                    <ListItem key={i} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="secondary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            ))}
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default MethodologyAccordion1Day;
