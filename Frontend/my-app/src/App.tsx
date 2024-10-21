// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayoutBasic from './Components/Main/HomePage/Dashboard/DashboardLayoutBasic';
import ChatWithLLM from './Components/Main/GenAI/ChatWithLLM';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home route will render the Dashboard component */}
        {/* <Route path="/" element={<DashboardLayoutBasic />} /> */}
        <Route path="/" element={<ChatWithLLM />} />
      </Routes>
    </Router>
  );
};

export default App;
