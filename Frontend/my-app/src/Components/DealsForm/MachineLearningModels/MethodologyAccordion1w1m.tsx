import React, { useState } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const MethodologyAccordion1w1m: React.FC = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded((prev) => !prev);

  const inputFactors = [
    "Deal Size ($ Million)",
    "Sponsor Presence (Y/N)",
    "Discount from Announcement Price (%)",
    "Sector Classification",
    "Percentage Primary (%)",
    "Selected Bookrunner(s)",
    "Investor Allocation as % of Deal Size & IOI",
  ];

  const economicIndicators = [
    "GDP Growth & Inflation Trends",
    "UST Treasury Yield Curve",
    "Sector & Market Performance (1W, 1M, 3M)",
    "NYSE Volume vs. 1-Month Average",
  ];

  const newIssueFlowIndicators = [
    "Recent Deal Flow Activity (1M vs 2M)",
    "Total Monthly Opportunity Value",
    "Monthly Positive Deal Count & Returns",
    "Monthly Excess Return (All Deals)",
  ];

  const [leftFactors, rightFactors] = [
    inputFactors.slice(0, Math.ceil(inputFactors.length / 2)),
    inputFactors.slice(Math.ceil(inputFactors.length / 2)),
  ];

  return (
    <Accordion
      expanded={expanded}
      onChange={handleToggle}
      sx={{
        mt: 4,
        borderRadius: 3,
        boxShadow: theme.shadows[3],
        "&:before": { display: "none" },
      }}
      elevation={3}
    >
      <AccordionSummary
        aria-controls="methodology-content"
        id="methodology-header"
        sx={{
          bgcolor: theme.palette.grey[100],
          borderRadius: "12px 12px 0 0",
          px: 3,
          py: 2,
          justifyContent: "space-between",
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
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

        <Tooltip title={expanded ? "Collapse details" : "Expand details"}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            variant="outlined"
            size="small"
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </Tooltip>
      </AccordionSummary>

      <AccordionDetails
        sx={{ bgcolor: theme.palette.background.paper, px: 3, py: 3 }}
      >
        <Box mb={3}>
          <Typography
            variant="body1"
            color={theme.palette.text.secondary}
            sx={{ lineHeight: 1.7 }}
          >
            Our model forecasts the 1-week and 1-month returns based on the T+1D
            closing price by analyzing a robust set of deal-specific, market,
            and flow-based indicators. In addition to traditional parameters
            such as deal size and sponsor status, we incorporate market context
            and dynamic behavior observed in recent deal flow.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box mb={3}>
          <Typography
            variant="subtitle1"
            fontWeight="600"
            gutterBottom
            color={theme.palette.text.primary}
          >
            Deal Specific Parameters
          </Typography>
          <Grid container spacing={1}>
            {[leftFactors, rightFactors].map((col, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <List dense sx={{ pl: 1 }}>
                  {col.map((item, i) => (
                    <ListItem key={i} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon
                          color="primary"
                          fontSize="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: "body2",
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

        <Box>
          <Typography
            variant="subtitle1"
            fontWeight="600"
            gutterBottom
            color={theme.palette.text.primary}
          >
            Economic & Macro Indicators:
          </Typography>
          <Grid container spacing={1}>
            {[economicIndicators.slice(0, 2), economicIndicators.slice(2)].map(
              (group, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <List dense sx={{ pl: 1 }}>
                    {group.map((item, i) => (
                      <ListItem key={i} sx={{ py: 0.5 }}>
                        <ListItemIcon>
                          <CheckCircleOutlineIcon
                            color="secondary"
                            fontSize="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )
            )}
          </Grid>
        </Box>

        <Box mt={3}>
          <Typography
            variant="subtitle1"
            fontWeight="600"
            gutterBottom
            color={theme.palette.text.primary}
          >
            New Issue Flow-Based Indicators:
          </Typography>
          <Grid container spacing={1}>
            {[
              newIssueFlowIndicators.slice(0, 2),
              newIssueFlowIndicators.slice(2),
            ].map((group, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <List dense sx={{ pl: 1 }}>
                  {group.map((item, i) => (
                    <ListItem key={i} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon
                          color="secondary"
                          fontSize="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: "body2",
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

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography
            variant="body2"
            color={theme.palette.text.secondary}
            sx={{ lineHeight: 1.7 }}
          >
            Historical data from 2012 to 2024 is used to build monthly
            distributions of market and deal activity. Each feature—such as deal
            volume, opportunity value, and positive deal count—is converted into
            percentiles and categorized into 5 buckets: 0–20, 20–40, 40–60,
            60–80, and 80–100. This allows the model to identify relative
            strength or weakness compared to historical norms. To better
            understand recent momentum, we compare current 30-day performance
            with trailing 60-day averages across various indicators.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default MethodologyAccordion1w1m;
