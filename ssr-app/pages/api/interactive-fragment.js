import { renderToString } from 'react-dom/server';
import React from 'react';

// Interactive SSR component that will be hydrated on client
const InteractiveSSRFragment = ({ data, selectedId = null }) => {
  return (
    <div id="interactive-ssr-component" style={{ 
      padding: '20px', 
      border: '3px solid #2196f3',
      backgroundColor: '#e3f2fd',
      margin: '20px',
      borderRadius: '8px'
    }}>
      <h2 style={{ color: '#1976d2', marginTop: 0 }}>
        🔄 Interactive SSR Component (Supports Hydration)
      </h2>
      <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1565c0' }}>
        Generated at: {new Date().toISOString()}
      </p>
      
      <div style={{ 
        backgroundColor: '#bbdefb',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '15px'
      }}>
        <h3 style={{ marginTop: 0, color: '#0d47a1' }}>
          Selected Row: <span id="selected-row-display">
            {selectedId ? `Row ${selectedId}` : 'None'}
          </span>
        </h3>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          Click any row below to see CSR hydration in action!
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#e1f5fe',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '15px'
      }}>
        <h3 style={{ marginTop: 0, color: '#01579b' }}>Interactive Product Table:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#90caf9' }}>
              <th style={{ padding: '12px', border: '1px solid #2196f3', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #2196f3', textAlign: 'left' }}>Product</th>
              <th style={{ padding: '12px', border: '1px solid #2196f3', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '12px', border: '1px solid #2196f3', textAlign: 'left' }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr 
                key={item.id}
                className="interactive-row"
                data-row-id={item.id}
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: selectedId === item.id ? '#fff3e0' : 'white',
                  transition: 'background-color 0.2s'
                }}
              >
                <td style={{ padding: '10px', border: '1px solid #2196f3' }}>{item.id}</td>
                <td style={{ padding: '10px', border: '1px solid #2196f3' }}>{item.name}</td>
                <td style={{ padding: '10px', border: '1px solid #2196f3' }}>${item.price}</td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #2196f3',
                  color: item.stock > 10 ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>
                  {item.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ 
        fontSize: '14px',
        color: '#666',
        fontStyle: 'italic',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '4px'
      }}>
        ✨ <strong>Hydration Demo:</strong> This HTML was pre-rendered on the server. 
        When loaded in CSR, JavaScript will "hydrate" it to add click interactions 
        while preserving the existing DOM structure.
      </div>
      
      {/* Inline script for basic interactivity (will be enhanced by hydration) */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Basic click handling before hydration
          if (typeof window !== 'undefined') {
            document.addEventListener('DOMContentLoaded', function() {
              const rows = document.querySelectorAll('.interactive-row');
              const display = document.getElementById('selected-row-display');
              
              rows.forEach(row => {
                row.addEventListener('click', function() {
                  // Remove previous selection
                  rows.forEach(r => r.style.backgroundColor = 'white');
                  
                  // Add current selection
                  this.style.backgroundColor = '#fff3e0';
                  const rowId = this.getAttribute('data-row-id');
                  
                  if (display) {
                    display.textContent = 'Row ' + rowId + ' (Hydrated)';
                  }
                  
                  // Notify parent window about selection
                  if (window.parent && window.parent.postMessage) {
                    window.parent.postMessage({
                      type: 'ROW_SELECTED',
                      rowId: rowId,
                      source: 'ssr-hydrated-component'
                    }, '*');
                  }
                });
              });
            });
          }
        `
      }} />
    </div>
  );
};

export default function handler(req, res) {
  // Simulate fetching product data on server
  const data = [
    { id: 1, name: 'Laptop Pro Max', price: 2299, stock: 15 },
    { id: 2, name: 'Wireless Headphones', price: 299, stock: 8 },
    { id: 3, name: 'Smart Watch', price: 399, stock: 22 },
    { id: 4, name: '4K Webcam', price: 179, stock: 5 },
    { id: 5, name: 'Gaming Keyboard', price: 159, stock: 12 },
    { id: 6, name: 'USB-C Monitor', price: 549, stock: 3 },
    { id: 7, name: 'Bluetooth Speaker', price: 89, stock: 18 }
  ];
  
  // Get selected row from query params (for server-side state)
  const selectedId = req.query.selectedId ? parseInt(req.query.selectedId) : null;
  
  try {
    // Render React component to HTML string on server
    const htmlString = renderToString(
      React.createElement(InteractiveSSRFragment, { data, selectedId })
    );
    
    // Set proper headers for HTML content
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3003');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Return the pre-rendered interactive HTML
    res.status(200).send(htmlString);
  } catch (error) {
    console.error('Error rendering interactive HTML fragment:', error);
    res.status(500).json({ error: 'Failed to render interactive HTML fragment' });
  }
}