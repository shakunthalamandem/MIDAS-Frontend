// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Components/Main/HomePage/HomePage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home route will render the HomePage component */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
