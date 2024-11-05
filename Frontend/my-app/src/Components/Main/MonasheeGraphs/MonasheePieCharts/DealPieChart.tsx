import React from 'react';
import RegionPieChart from './RegionPieChart';
import SectorPieChart from './SectorPieChart';
import { Container, Grid } from '@mui/material';

// Define props interface to receive pie chart data
interface DealPieChartProps {

  opportunity_value_on_abs_basis?: string; // New prop for opportunity value on absolute basis
  opportunity_value_ex?: string; // New prop for opportunity value ex
  deal_value?: string; // New prop for deal volume
  deal_count?: string; // New prop for deal count
}

const DealPieChart: React.FC<DealPieChartProps> = ({
  opportunity_value_on_abs_basis = "false",
  opportunity_value_ex = "false",
  deal_value = "false",
  deal_count = "true",
}) => {
  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          {/* Pass region data and new props to RegionPieChart */}
          <RegionPieChart
            opportunity_value_on_abs_basis={opportunity_value_on_abs_basis}
            opportunity_value_ex={opportunity_value_ex}
            deal_value={deal_value}
            deal_count={deal_count}
            // initialData={data.regionData}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          {/* Pass sector data to SectorPieChart */}
          {/* <SectorPieChart initialData={data.sectorData} /> */}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DealPieChart;
