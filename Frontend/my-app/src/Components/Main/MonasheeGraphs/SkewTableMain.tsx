import React from 'react'
import YearlyBasedTable from './SkewTables/YearlyBasedTable';
import SectorBasedTable from './SkewTables/SectorBasedTable';
import LeadBankTable from './SkewTables/LeadBankBasedTable';

const SkewTableMain = () => {
  return (
  
    <>
    <SectorBasedTable   />
    <YearlyBasedTable   />
    <LeadBankTable />

    </>
  )
}

export default SkewTableMain