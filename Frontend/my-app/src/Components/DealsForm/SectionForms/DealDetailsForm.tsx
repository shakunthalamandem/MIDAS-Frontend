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

interface CompanyDetailsData {
  deal_captain: string;
  international_team: string[];
  ticker: string;
  company_name: string;
  description: {
    country: string;
    sector: string;
    industry: string;
  };
  vendor_issuer: string[];
}

interface DealDetailsFormProps {
  data: CompanyDetailsData;
}

const DealDetailsForm: React.FC<DealDetailsFormProps> = ({ data }) => {
  return (
    <Container sx={{ mt: 2, mb: 2 }}>
      <Typography
        variant="h6"
        color="#aa1e13"
        style={{ textAlign: "center", marginBottom: 2 }}
      >
        Company Details
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
        <Table size="small" aria-label="company details table">
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
                <strong>Deal Captain</strong>
              </TableCell>
              <TableCell>{data.deal_captain}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>International Team</strong>
              </TableCell>
              <TableCell>{data.international_team.join(", ")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Ticker</strong>
              </TableCell>
              <TableCell sx={{bgcolor:"#FF0000"}}>{data.ticker}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Company Name</strong>
              </TableCell>
              <TableCell sx={{bgcolor:"#FFFF00"}}>{data.company_name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Country</strong>
              </TableCell>
              <TableCell sx={{bgcolor:"#FFFF00"}}>{data.description.country}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Sector</strong>
              </TableCell>
              <TableCell sx={{bgcolor:"#FFFF00"}}>{data.description.sector}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Industry</strong>
              </TableCell>
              <TableCell sx={{bgcolor:"#FFFF00"}}>{data.description.industry}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#4d4d4d" }}>
                <strong>Vendor Issuer</strong>
              </TableCell>
              <TableCell>{data.vendor_issuer.join(", ")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DealDetailsForm;
