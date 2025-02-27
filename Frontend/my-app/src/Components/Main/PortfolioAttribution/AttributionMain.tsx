import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FundTable from './PortfolioAttribution';
import FundWiseTable from './FundwiseTable';



const AttributionMain = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FundTable />} />
        <Route path="/fund/:fundId" element={<FundWiseTable />} />
      </Routes>
    </Router>
  );
};

export default AttributionMain;
