import React, { useEffect, useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { StepIconProps } from "@mui/material/StepIcon";

interface TickerTrackingData {
  deal_type?: string;
  pricing_date?: string;
  issuer_name?: string;
  fo_type?: string;
  region?: string;
  pricing_range_min?: number | null;
  pricing_range_max?: number | null;
  issue_price?: number | null;
  basic_writeup_available?: string | null;
  writeup_finalised?: string | null;
  allocation_as_percentage_of_ioi?: number | null;
  allocation_as_percentage_of_deal_size?: number | null;
  deal_color?: string | null;
  t1d_pred?: string | null;
  t1d_actual_return?: number | null;
  t1w_pred?: string | null;
  t1w_actual_return?: number | null;
  t1m_pred?: string | null;
  t1m_actual_return?: number | null;
  allocated_capital?: number | null;
  am_capital_committed?: number | null;
}

const CustomStepIcon: React.FC<StepIconProps> = (props) => {
  const { completed } = props;
  return completed ? (
    <CheckCircleIcon color="success" />
  ) : (
    <CancelIcon color="error" />
  );
};

const TickerTracking: React.FC<{ ticker: string; pricing_date: string }> = ({
  ticker,
  pricing_date,
}) => {
  const [trackingData, setTrackingData] = useState<TickerTrackingData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const fetchTrackingData = async () => {
    if (!ticker) return;

    // Clean the pricing_date value
    const cleanPricingDate =
      pricing_date === '""' || pricing_date === "" ? "" : pricing_date;

    setLoading(true);
    try {
      const res = await axios.post(
        `${apiUrl}/api/ticker_tracking/`,
        { ticker, pricing_date: cleanPricingDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data as { ticker_tracking_data: TickerTrackingData };
      setTrackingData(data.ticker_tracking_data);
    } catch (err) {
      console.error("Error fetching ticker tracking data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, [ticker, pricing_date]);

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return "Not Available";
    if (typeof val === "number") return val.toFixed(2);
    return val;
  };

  const formatToMillions = (val: any): string => {
    if (val === null || val === undefined || isNaN(val)) return "Not Available";
    const num = Number(val);
    if (Math.abs(num) >= 1_000_000) {
      return (num / 1_000_000).toFixed(2).replace(/\.00$/, "") + "M";
    }
    if (Math.abs(num) >= 1_000) {
      return (num / 1_000).toFixed(2).replace(/\.00$/, "") + "K";
    }
    return num.toString();
  };
  const isValidWriteup = (val?: string | null) => {
    if (!val) return false;
    return val.trim() !== "We are launching the FO writeups soon.";
  };
  const steps = trackingData
    ? [
        {
          label:
            trackingData.deal_type === "IPO"
              ? "Document published in S1 document"
              : "FO announced",
          value: `${trackingData.deal_type} - ${trackingData.region}`,
          completed: true,
        },
        {
          label: "Preliminary Writeup",
          value: trackingData.basic_writeup_available,
          completed: isValidWriteup(trackingData.basic_writeup_available),
        },
        {
          label: "Pricing",
          value:
            trackingData.deal_type === "IPO"
              ? trackingData.pricing_range_min !== null &&
                trackingData.pricing_range_max !== null
                ? `$${formatValue(trackingData.pricing_range_min)} - $${formatValue(
                    trackingData.pricing_range_max
                  )}`
                : "Not Available"
              : trackingData.deal_type === "FO"
                ? trackingData.issue_price !== null
                  ? `$${formatValue(trackingData.issue_price)}`
                  : "Not Available"
                : "Not Available",
          completed:
            trackingData.deal_type === "IPO"
              ? trackingData.pricing_range_min !== null &&
                trackingData.pricing_range_max !== null
              : trackingData.deal_type === "FO"
                ? trackingData.issue_price !== null
                : false,
        },
        {
          label: "Deal Writeup Finalised",
          value: trackingData.writeup_finalised,
          completed: isValidWriteup(trackingData.writeup_finalised),
        },
        {
          label: "Allocation % of Deal Size",
          value: `${formatValue(
            trackingData.allocation_as_percentage_of_deal_size
          )}%`,
          completed:
            trackingData.allocation_as_percentage_of_deal_size !== null,
        },
        {
          label: "IOI (Indication of Interest)",
          value: `${formatValue(trackingData.allocation_as_percentage_of_ioi)}%`,
          completed: trackingData.allocation_as_percentage_of_ioi !== null,
        },

        {
          label: "Deal Color",
          value: trackingData.deal_color,
          completed: !!trackingData.deal_color,
        },
        {
          label: "Allocated Capital",
          value: `$${formatToMillions(trackingData.allocated_capital)}`,
          extra: `AM Capital Committed: $${formatToMillions(
            trackingData.am_capital_committed
          )}`,
          completed: trackingData.allocated_capital !== null,
        },
        {
          label: "T+1 Day Prediction",
          value: trackingData.t1d_pred,
          extra: trackingData.t1d_actual_return
            ? `Actual Return: ${formatValue(trackingData.t1d_actual_return)}%`
            : null,
          completed: !!trackingData.t1d_pred,
        },
        {
          label: "T+1 Week Prediction",
          value: trackingData.t1w_pred,
          extra: trackingData.t1w_actual_return
            ? `Actual Return: ${formatValue(trackingData.t1w_actual_return)}%`
            : null,
          completed: !!trackingData.t1w_pred,
        },
        {
          label: "T+1 Month Prediction",
          value: trackingData.t1m_pred,
          extra: trackingData.t1m_actual_return
            ? `Actual Return: ${formatValue(trackingData.t1m_actual_return)}%`
            : null,
          completed: !!trackingData.t1m_pred,
        },
      ]
    : [];

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: 6,
        maxWidth: 1000,
        margin: "2rem auto",
        background: "linear-gradient(145deg, #ffffff, #f0f4f8)",
      }}
    >
      <CardContent>
        {loading && (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        )}

        {!loading && trackingData && (
          <>
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              color="#002060"
              fontWeight="bold"
            >
              {`${ticker} (${trackingData.issuer_name})${
                trackingData.pricing_date
                  ? ` on ${dayjs(trackingData.pricing_date).format("DD MMM YYYY")}`
                  : ""
              }`}
            </Typography>

            <Stepper orientation="vertical" activeStep={steps.length - 1}>
              {steps.map((step, index) => (
                <Step key={index} completed={step.completed}>
                  <StepLabel StepIconComponent={CustomStepIcon}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {step.label}
                      </Typography>

                      <Box textAlign="left" maxWidth="300px">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography
                            variant="body2"
                            color="#010e29ff"
                            sx={{
                              textAlign: "left",
                              display: "-webkit-box",
                              WebkitLineClamp:
                                expandedIndex === index ? "unset" : 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              flex: 1,
                            }}
                          >
                            {step.value || "Not Available"}
                          </Typography>

                          {step.value && step.value.length > 25 && (
                            <Button
                              size="small"
                              onClick={() =>
                                setExpandedIndex(
                                  expandedIndex === index ? null : index
                                )
                              }
                              sx={{
                                fontSize: "0.75rem",
                                textTransform: "none",
                                minWidth: "fit-content",
                              }}
                            >
                              {expandedIndex === index
                                ? "Read less"
                                : "Read more"}
                            </Button>
                          )}
                        </Box>

                        {step.extra && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: "left", mt: 0.5 }}
                          >
                            {step.extra}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TickerTracking;
