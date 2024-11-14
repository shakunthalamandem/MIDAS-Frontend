import React from 'react'
import SkewCombo from './MonasheePieCharts/SkewCombo';
import YearlyBasedTable from './SkewTables/YearlyBasedTable';
import SectorBasedTable from './SkewTables/SectorBasedTable';

const SkewTableMain = () => {
  return (
  
    <>
    <YearlyBasedTable />
    <SectorBasedTable />
    <SkewCombo onSubmit={function (data: any): void {
          throw new Error('Function not implemented.');
        } } />
    </>
  )
}

export default SkewTableMain