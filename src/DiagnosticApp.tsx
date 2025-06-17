import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

interface EnvironmentVariables {
  NODE_ENV?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_APP_VERSION?: string;
}

// Simple diagnostic component
const DiagnosticHome = () => {
  const [envVars, setEnvVars] = useState<EnvironmentVariables>({});
  
  useEffect(() => {
    // Collect environment variables
    const vars: EnvironmentVariables = {
      NODE_ENV: process.env.NODE_ENV,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'Not Set',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set (Hidden)' : '✗ Not Set',
      VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || 'Not Set',
    };
    setEnvVars(vars);
  }, []);
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#2e7d32' }}>Parlay Golf Ventures - Diagnostic</h1>
      <p>This is a diagnostic page to troubleshoot rendering issues.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Environment Information</h2>
        <ul>
          {Object.entries(envVars).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value ? value.toString() : 'undefined'}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Browser Information</h2>
        <ul>
          <li><strong>User Agent:</strong> {navigator.userAgent}</li>
          <li><strong>Platform:</strong> {navigator.platform}</li>
          <li><strong>Window Size:</strong> {window.innerWidth}x{window.innerHeight}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Test Components</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '10px',
          marginTop: '10px'
        }}>
          <TestComponent name="Basic Component" />
          <TestComponent name="With State" withState />
          <TestComponent name="With Effect" withEffect />
        </div>
      </div>
    </div>
  );
};

// Test component to check rendering capabilities
const TestComponent = ({ 
  name, 
  withState = false, 
  withEffect = false 
}: { 
  name: string, 
  withState?: boolean, 
  withEffect?: boolean 
}) => {
  const [counter, setCounter] = useState(0);
  const [effectRan, setEffectRan] = useState(false);
  
  useEffect(() => {
    if (withEffect) {
      setEffectRan(true);
    }
  }, [withEffect]);
  
  return (
    <div style={{
      padding: '15px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: '#f5f5f5'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>{name}</h3>
      {withState && (
        <div>
          <p>Counter: {counter}</p>
          <button 
            onClick={() => setCounter(c => c + 1)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Increment
          </button>
        </div>
      )}
      {withEffect && (
        <div>
          <p>Effect ran: {effectRan ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

// Simple diagnostic app
const DiagnosticApp = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Check if environment variables are loaded
      console.log('Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        SUPABASE_URL_SET: !!import.meta.env.VITE_SUPABASE_URL,
        SUPABASE_KEY_SET: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      });
      
      // Simulate loading
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Error checking environment:', err);
      setError(err instanceof Error ? err : new Error('Unknown error checking environment'));
      setLoading(false);
    }
  }, []);

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: '1.6'
      }}>
        <h1 style={{ color: '#d32f2f' }}>Application Error</h1>
        <p>There was an error initializing the application:</p>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '4px',
          overflowX: 'auto'
        }}>
          {error.message}
        </pre>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #2e7d32',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginTop: '10px', textAlign: 'center' }}>Loading environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Routes>
        <Route path="*" element={<DiagnosticHome />} />
      </Routes>
    </div>
  );
};

export default DiagnosticApp;
