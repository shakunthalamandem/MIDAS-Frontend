import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PortfolioAttribution from './PortfolioAttribution';
import FundWiseTable from './FundwiseTable';



const AttributionMain = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortfolioAttribution />} />
        <Route path="/equity/fund/:fundId" element={<FundWiseTable />} />
      </Routes>
    </Router>
  );
};

export default AttributionMain;
