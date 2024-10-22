// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Components/Main/HomePage/HomePage';
// import DashboardLayoutBasic from './Components/Main/HomePage/Dashboard/DashboardLayoutBasic';
// import ChatWithLLM from './Components/Main/GenAI/ChatWithLLM';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home route will render the Dashboard component */}
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/" element={<ChatWithLLM />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
