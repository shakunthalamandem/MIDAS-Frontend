import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { color } from "framer-motion";

interface TechnicalSentimentAnalysis {
  discount_analysis_v1_percent: number;
  discount_analysis_v2_percent: number;
  demand_analysis_usd: number;
  ltm_fcf_yield: number;
  ltm_dividend_yield: number;
  deal_rating_v2: number;
  block_seasoned: string;
  timing_expected: string;
  clean_up: string;
  primary: string;
  good_register: string;
  positive_liquidity_event: string;
  bank_analyst_coverage: string;
  developed_market: string;
  deal_wallcrossed: string;
  wallcrossing_coverage_percent: number;
  launched_with_reference_to_market: string;
  coverage_estimate_x: number;
  coverage_speed_mins: number;
  lo_allocation_percent: number;
  outsized_anchor: string;
  upsized: string;
  price_vs_v1_model_minus_percent: number;
  price_vs_v1_model_divide_percent: number;
  price_vs_v2_model_minus_percent: number;
  price_vs_v2_model_divide_percent: number;
}

interface TechnicalInsightsProps {
  data: TechnicalSentimentAnalysis;
}

const TechnicalInsights: React.FC<TechnicalInsightsProps> = ({ data }) => {
  return (
    <Container sx={{ mt: 2, mb: 2 }}>
      <Typography
        variant="h6"
        color="#aa1e13"
        style={{ textAlign: "center", marginBottom: 2 }}
      >
        Technical Analysis
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          height: "400px",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#aaa",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#888",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f0f0f0",
            borderRadius: "10px",
          },
        }}
      >
        {" "}
        <Table size="small" aria-label="technical sentiment analysis table">
          <TableHead>
            <TableRow
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "#f3ecec",
              }}
            >
              <TableCell sx={{ color: "#002060" }}>
                <strong>Key</strong>
              </TableCell>
              <TableCell sx={{ color: "#002060" }}>
                <strong>Value</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Discount Analysis V1 (%)</strong>
              </TableCell>
              <TableCell>{data.discount_analysis_v1_percent}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Discount Analysis V2 (%)</strong>
              </TableCell>
              <TableCell>{data.discount_analysis_v2_percent}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Demand Analysis (USD)</strong>
              </TableCell>
              <TableCell>${data.demand_analysis_usd.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>LTM FCF Yield</strong>
              </TableCell>
              <TableCell>{data.ltm_fcf_yield}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>LTM Dividend Yield</strong>
              </TableCell>
              <TableCell>{data.ltm_dividend_yield}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Deal Rating V2</strong>
              </TableCell>
              <TableCell>{data.deal_rating_v2}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Block Seasoned</strong>
              </TableCell>
              <TableCell>{data.block_seasoned}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Timing Expected</strong>
              </TableCell>
              <TableCell>{data.timing_expected}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Clean Up</strong>
              </TableCell>
              <TableCell>{data.clean_up}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Primary</strong>
              </TableCell>
              <TableCell>{data.primary}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Good Register</strong>
              </TableCell>
              <TableCell>{data.good_register}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Positive Liquidity Event</strong>
              </TableCell>
              <TableCell>{data.positive_liquidity_event}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Bank Analyst Coverage</strong>
              </TableCell>
              <TableCell>{data.bank_analyst_coverage}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Developed Market</strong>
              </TableCell>
              <TableCell>{data.developed_market}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Deal Wallcrossed</strong>
              </TableCell>
              <TableCell>{data.deal_wallcrossed}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Wallcrossing Coverage (%)</strong>
              </TableCell>
              <TableCell>{data.wallcrossing_coverage_percent}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Launched with Reference to Market</strong>
              </TableCell>
              <TableCell>{data.launched_with_reference_to_market}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Coverage Estimate (x)</strong>
              </TableCell>
              <TableCell>{data.coverage_estimate_x}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Coverage Speed (mins)</strong>
              </TableCell>
              <TableCell>{data.coverage_speed_mins}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>LO Allocation (%)</strong>
              </TableCell>
              <TableCell>{data.lo_allocation_percent}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Outsized Anchor</strong>
              </TableCell>
              <TableCell>{data.outsized_anchor}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Upsized</strong>
              </TableCell>
              <TableCell>{data.upsized}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Price vs V1 Model Minus (%)</strong>
              </TableCell>
              <TableCell>{data.price_vs_v1_model_minus_percent}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Price vs V1 Model Divide (%)</strong>
              </TableCell>
              <TableCell>{data.price_vs_v1_model_divide_percent}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Price vs V2 Model Minus (%)</strong>
              </TableCell>
              <TableCell>{data.price_vs_v2_model_minus_percent}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Price vs V2 Model Divide (%)</strong>
              </TableCell>
              <TableCell>{data.price_vs_v2_model_divide_percent}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TechnicalInsights;
