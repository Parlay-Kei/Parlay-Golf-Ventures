import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Extremely simple component that will definitely render
const HomePage = () => (
  <div style={{ 
    padding: '20px', 
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '50px auto',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  }}>
    <h1 style={{ color: '#2e7d32' }}>Parlay Golf Ventures</h1>
    <p>Welcome to the Parlay Golf Ventures platform.</p>
    <div style={{ marginTop: '20px' }}>
      <h2>Navigation</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        <li style={{ margin: '10px 0' }}>
          <a href="/" style={{ 
            display: 'inline-block', 
            padding: '8px 16px', 
            backgroundColor: '#2e7d32', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px'
          }}>Home</a>
        </li>
        <li style={{ margin: '10px 0' }}>
          <a href="/academy" style={{ 
            display: 'inline-block', 
            padding: '8px 16px', 
            backgroundColor: '#2e7d32', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px'
          }}>Academy</a>
        </li>
        <li style={{ margin: '10px 0' }}>
          <a href="/community" style={{ 
            display: 'inline-block', 
            padding: '8px 16px', 
            backgroundColor: '#2e7d32', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px'
          }}>Community</a>
        </li>
      </ul>
    </div>
  </div>
);

// Minimal app with no dependencies
const MinimalApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MinimalApp;
