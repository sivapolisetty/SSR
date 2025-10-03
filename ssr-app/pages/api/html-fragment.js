import { renderToString } from 'react-dom/server';
import React from 'react';

// Component that will be rendered as HTML on server
const SSRHtmlFragment = ({ data }) => {
  return (
    <div style={{ 
      padding: '20px', 
      border: '3px solid #00ff00',
      backgroundColor: '#f0fff0',
      margin: '20px',
      borderRadius: '8px'
    }}>
      <h2 style={{ color: '#008000', marginTop: 0 }}>
        🟢 This HTML was Pre-rendered on SSR Server
      </h2>
      <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
        Generated at: {new Date().toISOString()}
      </p>
      <p style={{ marginBottom: '15px' }}>
        This content was rendered to HTML on the server and fetched as pure HTML by the CSR app.
      </p>
      
      <div style={{ 
        backgroundColor: '#e8f5e9',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '15px'
      }}>
        <h3 style={{ marginTop: 0, color: '#1b5e20' }}>Server-Generated Data:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#c8e6c9' }}>
              <th style={{ padding: '8px', border: '1px solid #4caf50', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '8px', border: '1px solid #4caf50', textAlign: 'left' }}>Product</th>
              <th style={{ padding: '8px', border: '1px solid #4caf50', textAlign: 'left' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td style={{ padding: '8px', border: '1px solid #4caf50' }}>{item.id}</td>
                <td style={{ padding: '8px', border: '1px solid #4caf50' }}>{item.name}</td>
                <td style={{ padding: '8px', border: '1px solid #4caf50' }}>${item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ 
        fontSize: '14px',
        color: '#666',
        fontStyle: 'italic'
      }}>
        ✨ Key Point: This entire section arrived as ready-to-display HTML, 
        no JavaScript parsing needed for first paint!
      </div>
    </div>
  );
};

export default function handler(req, res) {
  // Simulate fetching data on server
  const data = [
    { id: 1, name: 'Laptop Pro', price: 1299 },
    { id: 2, name: 'Wireless Mouse', price: 79 },
    { id: 3, name: 'Mechanical Keyboard', price: 159 },
    { id: 4, name: 'Monitor 4K', price: 449 },
    { id: 5, name: 'USB-C Hub', price: 89 }
  ];
  
  try {
    // Render React component to HTML string on server
    const htmlString = renderToString(
      React.createElement(SSRHtmlFragment, { data })
    );
    
    // Set proper headers for HTML content
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3003');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Return the pre-rendered HTML
    res.status(200).send(htmlString);
  } catch (error) {
    console.error('Error rendering HTML fragment:', error);
    res.status(500).json({ error: 'Failed to render HTML fragment' });
  }
}