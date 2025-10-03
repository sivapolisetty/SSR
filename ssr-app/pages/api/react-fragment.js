import { renderToString } from 'react-dom/server';
import React from 'react';

// Server-safe React component without hooks
const ServerSafeInteractiveTable = ({ data, initialSelectedId }) => {
  return React.createElement('div', {
    style: { 
      padding: '20px', 
      border: '3px solid #2196f3',
      backgroundColor: '#e3f2fd',
      margin: '20px',
      borderRadius: '8px'
    }
  }, [
    React.createElement('h2', {
      key: 'title',
      style: { color: '#1976d2', marginTop: 0 }
    }, '🔄 Interactive Product Table (SSR)'),
    
    React.createElement('p', {
      key: 'timestamp',
      style: { fontSize: '16px', fontWeight: 'bold', color: '#1565c0' }
    }, `Generated at: ${new Date().toISOString()}`),
    
    React.createElement('div', {
      key: 'status',
      style: { 
        backgroundColor: '#bbdefb',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '15px'
      }
    }, [
      React.createElement('h3', {
        key: 'status-title',
        style: { marginTop: 0, color: '#0d47a1' }
      }, [
        'Currently Selected: ',
        React.createElement('span', {
          key: 'selected-span',
          'data-status': 'selected',
          id: 'selected-status',
          style: { 
            color: initialSelectedId ? '#2e7d32' : '#f57c00',
            fontWeight: 'bold'
          }
        }, initialSelectedId ? `Row ${initialSelectedId} - ${data.find(item => item.id === initialSelectedId)?.name || 'Unknown'}` : 'None')
      ]),
      React.createElement('p', {
        key: 'instruction',
        style: { margin: '5px 0', fontSize: '14px' }
      }, 'Click any row below to select it. State will sync with parent component!')
    ]),
    
    React.createElement('div', {
      key: 'table-container',
      style: { 
        backgroundColor: '#e1f5fe',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '15px'
      }
    }, React.createElement('table', {
      style: { width: '100%', borderCollapse: 'collapse' }
    }, [
      React.createElement('thead', { key: 'thead' }, 
        React.createElement('tr', {
          style: { backgroundColor: '#90caf9' }
        }, [
          React.createElement('th', { key: 'id', style: { padding: '12px', border: '1px solid #2196f3', textAlign: 'left' } }, 'ID'),
          React.createElement('th', { key: 'product', style: { padding: '12px', border: '1px solid #2196f3', textAlign: 'left' } }, 'Product'),
          React.createElement('th', { key: 'price', style: { padding: '12px', border: '1px solid #2196f3', textAlign: 'left' } }, 'Price'),
          React.createElement('th', { key: 'stock', style: { padding: '12px', border: '1px solid #2196f3', textAlign: 'left' } }, 'Stock'),
          React.createElement('th', { key: 'status', style: { padding: '12px', border: '1px solid #2196f3', textAlign: 'left' } }, 'Status')
        ])
      ),
      React.createElement('tbody', { key: 'tbody' }, 
        data.map(item => 
          React.createElement('tr', {
            key: item.id,
            'data-row-id': item.id,
            className: 'interactive-row',
            style: { 
              cursor: 'pointer',
              backgroundColor: initialSelectedId === item.id ? '#fff3e0' : 'white',
              transition: 'background-color 0.2s'
            }
          }, [
            React.createElement('td', { key: 'id', style: { padding: '10px', border: '1px solid #2196f3' } }, item.id),
            React.createElement('td', { key: 'name', style: { padding: '10px', border: '1px solid #2196f3', fontWeight: 'bold' } }, item.name),
            React.createElement('td', { key: 'price', style: { padding: '10px', border: '1px solid #2196f3' } }, `$${item.price}`),
            React.createElement('td', { 
              key: 'stock', 
              style: { 
                padding: '10px', 
                border: '1px solid #2196f3',
                color: item.stock > 10 ? 'green' : item.stock > 5 ? 'orange' : 'red',
                fontWeight: 'bold'
              } 
            }, item.stock),
            React.createElement('td', { key: 'status', style: { padding: '10px', border: '1px solid #2196f3' } },
              React.createElement('span', {
                style: {
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white',
                  backgroundColor: item.stock > 5 ? '#4caf50' : '#f44336'
                }
              }, item.stock > 5 ? 'In Stock' : 'Low Stock')
            )
          ])
        )
      )
    ])),
    
    React.createElement('div', {
      key: 'footer',
      style: { 
        fontSize: '14px',
        color: '#666',
        fontStyle: 'italic',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '4px'
      }
    }, '✨ SSR Component: This React component was server-side rendered without client-side hooks.')
  ]);
};

export default function handler(req, res) {
  // Sample product data
  const data = [
    { id: 1, name: 'MacBook Pro M3', price: 2299, stock: 15 },
    { id: 2, name: 'AirPods Pro', price: 299, stock: 8 },
    { id: 3, name: 'iPhone 15 Pro', price: 1199, stock: 22 },
    { id: 4, name: 'Apple Watch Ultra', price: 799, stock: 5 },
    { id: 5, name: 'iPad Pro', price: 1299, stock: 12 },
    { id: 6, name: 'Studio Display', price: 1599, stock: 3 },
    { id: 7, name: 'Magic Keyboard', price: 299, stock: 18 }
  ];
  
  // Get selected row from query params
  const initialSelectedId = req.query.selectedId ? parseInt(req.query.selectedId) : null;
  
  try {
    // Render the server-safe React component to HTML string
    const htmlString = renderToString(
      React.createElement(ServerSafeInteractiveTable, { 
        data, 
        initialSelectedId
      })
    );
    
    // Wrap the component HTML with a container and interactive script
    const fullHtml = `
      <div id="react-ssr-container">
        ${htmlString}
      </div>
      <script>
        window.ssrData = ${JSON.stringify({ data, initialSelectedId })};
        console.log('SSR component loaded with data:', window.ssrData);
        
        // Add immediate interactivity to the SSR HTML
        (function() {
          let currentSelectedId = ${initialSelectedId || 'null'};
          
          // Wait for DOM to be ready
          function addInteractivity() {
            const rows = document.querySelectorAll('.interactive-row');
            const statusSpan = document.querySelector('[data-status="selected"]') || 
                             document.querySelector('span[style*="font-weight:bold"]');
            
            console.log('Found', rows.length, 'interactive rows');
            
            rows.forEach(row => {
              row.style.cursor = 'pointer';
              
              row.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const rowId = parseInt(this.getAttribute('data-row-id'));
                console.log('Row clicked:', rowId);
                
                // Update visual selection
                rows.forEach(r => {
                  r.style.backgroundColor = 'white';
                });
                this.style.backgroundColor = '#fff3e0';
                
                // Update status text
                const product = window.ssrData.data.find(p => p.id === rowId);
                if (statusSpan) {
                  statusSpan.textContent = \`Row \${rowId} - \${product ? product.name : 'Unknown'}\`;
                  statusSpan.style.color = '#2e7d32';
                }
                
                currentSelectedId = rowId;
                
                // Notify parent window
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({
                    type: 'ROW_SELECTED',
                    rowId: rowId,
                    productName: product ? product.name : 'Unknown',
                    source: 'ssr-interactive-table',
                    timestamp: Date.now()
                  }, '*');
                }
                
                console.log('Selection updated to:', rowId);
              });
              
              // Add hover effect
              row.addEventListener('mouseenter', function() {
                if (currentSelectedId !== parseInt(this.getAttribute('data-row-id'))) {
                  this.style.backgroundColor = '#f5f5f5';
                }
              });
              
              row.addEventListener('mouseleave', function() {
                if (currentSelectedId !== parseInt(this.getAttribute('data-row-id'))) {
                  this.style.backgroundColor = 'white';
                }
              });
            });
          }
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addInteractivity);
          } else {
            addInteractivity();
          }
        })();
      </script>
    `;
    
    // Set proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3003');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Return the pre-rendered React component as HTML
    res.status(200).send(fullHtml);
  } catch (error) {
    console.error('Error rendering React fragment:', error);
    res.status(500).json({ error: 'Failed to render React fragment' });
  }
}