// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayoutBasic from './Components/Main/HomePage/Dashboard/DashboardLayoutBasic';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home route will render the Dashboard component */}
        <Route path="/" element={<DashboardLayoutBasic />} />
      </Routes>
    </Router>
  );
};

export default App;
