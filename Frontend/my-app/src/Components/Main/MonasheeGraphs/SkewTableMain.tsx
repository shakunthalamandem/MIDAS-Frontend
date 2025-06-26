import React from 'react'
import YearlyBasedTable from './SkewTables/YearlyBasedTable';
import SectorBasedTable from './SkewTables/SectorBasedTable';
import LeadBankTable from './SkewTables/LeadBankBasedTable';
import RegionBasedTable from './SkewTables/RegionBasedTable';

const SkewTableMain = () => {
  return (
  
    <>
    <SectorBasedTable   />
    <YearlyBasedTable   />
    <LeadBankTable />
    <RegionBasedTable />

    </>
  )
}

export default SkewTableMain