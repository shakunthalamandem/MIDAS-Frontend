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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const MethodologyAccordion1Day: React.FC = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded((prev) => !prev);

  const keyInputs = [
    "Deal Size ($ Million)",
    "Sponsor (Y/N)",
    "Discount from Announcement Price (%)",
    "Sector",
    "Percentage Primary (%)",
    "Selected Bank",
    "Allocation as % of Deal Size & IOI",
  ];

  const marketIndicators = [
    "GDP Growth & Inflation Rate",
    "Treasury Rates",
    "Sector & Market Returns (3-month, 1-month, 1-week)",
    "NYSE Volume (vs. 1-month average)",
  ];
  const newIssueFlowIndicators = [
    "Recent Deal Flow Activity (1M vs 2M)",
    "Total Monthly Opportunity Value",
    "Monthly Positive Deal Count & Returns",
    "Monthly Excess Return (All Deals)",
    "Recent IPO Sector Deal Flow Activity (1D & 1M)",
  ];

  // A helper to split array roughly in half for two columns
  const splitArrayInTwo = (arr: string[]) => {
    const middle = Math.ceil(arr.length / 2);
    return [arr.slice(0, middle), arr.slice(middle)];
  };

  const [keyInputsLeft, keyInputsRight] = splitArrayInTwo(keyInputs);
  const [marketLeft, marketRight] = splitArrayInTwo(marketIndicators);

  return (
    <>
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
            "& .MuiAccordionSummary-content": {
              alignItems: "center",
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            },
          }}
        >
          {/* Left: Title + Expand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
          </Box>

          {/* Right: Model Definitions Tooltip */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="body2"
              fontWeight={500}
              color={theme.palette.text.secondary}
            >
              Model Definitions
            </Typography>
            <Tooltip
              title={
                <Box sx={{ p: 1, maxWidth: 250 }}>
                  <Typography variant="body2" fontWeight="600" gutterBottom>
                    Accuracy
                  </Typography>
                  <Typography
                    variant="caption"
                    color="inherit"
                    display="block"
                    gutterBottom
                  >
                    Indicates the proportion of times the model correctly
                    predicts the direction of price movement.
                  </Typography>
                  <Typography variant="body2" fontWeight="600" gutterBottom>
                    Confidence
                  </Typography>
                  <Typography variant="caption" color="inherit">
                    Represents the model’s level of certainty in its prediction.
                    Higher confidence implies stronger conviction in the
                    outcome.
                  </Typography>
                </Box>
              }
              arrow
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[3],
                    borderRadius: 2,
                    maxWidth: 300,
                    p: 1.5,
                  },
                },
              }}
            >
              <InfoOutlinedIcon
                fontSize="small"
                sx={{ color: theme.palette.info.main, cursor: "pointer" }}
              />
            </Tooltip>
          </Box>
        </AccordionSummary>

        <AccordionDetails
          sx={{ bgcolor: theme.palette.background.paper, px: 3, py: 3 }}
        >
          <Box mb={3}>
            <Typography
              variant="body1"
              color={theme.palette.text.secondary}
              sx={{ lineHeight: 1.6 }}
            >
              The prediction models analyze a comprehensive set of parameters to
              forecast the T+1D closing price performance.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Key Input Parameters in two columns */}
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
              {[keyInputsLeft, keyInputsRight].map((column, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <List dense sx={{ pl: 1 }}>
                    {column.map((item, i) => (
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

          {/* Economic & Market Indicators in two columns */}
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
              {[marketLeft, marketRight].map((column, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <List dense sx={{ pl: 1 }}>
                    {column.map((item, i) => (
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
          {/* New Issue Flow-Based Indicators in two columns */}
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
              {splitArrayInTwo(newIssueFlowIndicators).map((column, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <List dense sx={{ pl: 1 }}>
                    {column.map((item, i) => (
                      <ListItem key={i} sx={{ py: 0.5 }}>
                        <ListItemIcon>
                          <CheckCircleOutlineIcon
                            color="secondary" // matches Economic & Macro Indicators
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

        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default MethodologyAccordion1Day;
