import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Container } from '@mui/material';

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
    <Container sx={{mt:2,mb:2}}>
     <Typography variant="h6" color='#aa1e13' style={{ textAlign: 'center',marginBottom:2}}>

        Company Details
      </Typography>

      <TableContainer component={Paper} sx={{height:'400px'
      }}>
        <Table size="small" aria-label="company details table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Key</strong></TableCell>
              <TableCell><strong>Value</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Deal Captain</strong></TableCell>
              <TableCell>{data.deal_captain}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>International Team</strong></TableCell>
              <TableCell>{data.international_team.join(", ")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Ticker</strong></TableCell>
              <TableCell>{data.ticker}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Company Name</strong></TableCell>
              <TableCell>{data.company_name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Country</strong></TableCell>
              <TableCell>{data.description.country}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Sector</strong></TableCell>
              <TableCell>{data.description.sector}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Industry</strong></TableCell>
              <TableCell>{data.description.industry}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Vendor Issuer</strong></TableCell>
              <TableCell>{data.vendor_issuer.join(", ")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DealDetailsForm;
