// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './Components/Main/HomePage/HomePage';
import { Login } from '@mui/icons-material';
import SignUp from './Components/Main/HomePage/Authentication/SignUp';
import CapitalMarkets from './Components/Main/HomePage/Dashboard/CapitalMarkets';
import MonasheeDeals from './Components/Main/HomePage/Dashboard/MonasheeDeals';
import Strategies from './Components/Main/HomePage/Dashboard/Strategies';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/capital-markets" element={<CapitalMarkets />} />
        <Route path="/monashee-deals" element={<MonasheeDeals />} />
        <Route path="/strategies" element={<Strategies />} />

      </Routes>
    </Router>
  );
};

export default App;
