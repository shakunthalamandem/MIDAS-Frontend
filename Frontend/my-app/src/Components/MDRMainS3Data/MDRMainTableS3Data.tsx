import React from 'react'
import { MDRDailyPortfolioContainer } from './MDRDailyPortfolioContainer'
import RegionWiseMDRTables from './RegionWiseMDRTables'

const MDRMainTableS3Data = () => {
  return (
    <div>
      <MDRDailyPortfolioContainer />
      <RegionWiseMDRTables />
      
    </div>
  )
}

export default MDRMainTableS3Data
