import React from 'react'
import { MDRDailyPortfolioContainer } from './MDRDailyPortfolioContainer'
import RegionWiseMDRTables from './RegionWiseMDRTables'
import { Typography } from '@mui/material'
import MDRCummulativeRegionChartMain from './MDRCharts/MDRCummulativeRegionChartMain'

const MDRMainTableS3Data = () => {
  return (
    <>
          <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "20px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to Monashee Daily Report
      </Typography>
      <MDRDailyPortfolioContainer />
            <MDRCummulativeRegionChartMain />
      <RegionWiseMDRTables />
      
</>  )
}

export default MDRMainTableS3Data
