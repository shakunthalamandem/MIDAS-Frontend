import React from 'react'
import YearlyBasedTable from './SkewTables/YearlyBasedTable';
import SectorBasedTable from './SkewTables/SectorBasedTable';

const SkewTableMain = () => {
  return (
  
    <>
    <YearlyBasedTable onSubmit={function (data: any): void {
          throw new Error('Function not implemented.');
        } }  />
    <SectorBasedTable onSubmit={function (data: any): void {
          throw new Error('Function not implemented.');
        } }  />
    </>
  )
}

export default SkewTableMain