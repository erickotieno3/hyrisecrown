import { useState } from 'react';

export default function SimpleTest() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>Tesco Price Comparison - Test Page</h1>
      <p>This page confirms the React application is rendering correctly.</p>
      <p>Environment mode: {import.meta.env.MODE}</p>
      <p>Domain: {window.location.hostname}</p>
      
      <div style={{ margin: '20px 0' }}>
        <p>Counter: {count}</p>
        <button 
          style={{ 
            padding: '10px 20px', 
            background: '#00539f', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '5px'
          }}
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
        <button 
          style={{ 
            padding: '10px 20px', 
            background: '#e10600', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '5px'
          }}
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </div>
      
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <p>If you can see this page and interact with the buttons, basic React rendering is working!</p>
    </div>
  );
}