import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface InteractiveTableProps {
  data?: Product[];
  initialSelectedId?: number | null;
  onSelectionChange?: (id: number) => void;
  isSSR?: boolean;
}

const InteractiveTable: React.FC<InteractiveTableProps> = ({ 
  data = [], 
  initialSelectedId = null, 
  onSelectionChange = () => {}, 
  isSSR = false 
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId);

  useEffect(() => {
    // Notify parent component of selection changes
    if (onSelectionChange && selectedId !== null) {
      onSelectionChange(selectedId);
    }
  }, [selectedId, onSelectionChange]);

  const handleRowClick = (rowId: number) => {
    setSelectedId(rowId);
    
    // For SSR components embedded in CSR, also use window messaging
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({
        type: 'ROW_SELECTED',
        rowId: rowId,
        source: 'interactive-table',
        timestamp: Date.now()
      }, '*');
    }
    
    console.log('Row selected:', rowId);
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '3px solid #2196f3',
      backgroundColor: '#e3f2fd',
      margin: '20px',
      borderRadius: '8px'
    }}>
      <h2 style={{ color: '#1976d2', marginTop: 0 }}>
        🔄 Interactive Product Table {isSSR ? '(SSR)' : '(CSR)'}
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
          Currently Selected: <span style={{ 
            color: selectedId ? '#2e7d32' : '#f57c00',
            fontWeight: 'bold'
          }}>
            {selectedId ? `Row ${selectedId} - ${data.find(item => item.id === selectedId)?.name || 'Unknown'}` : 'None'}
          </span>
        </h3>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          Click any row below to select it. State will sync with parent component!
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#e1f5fe',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '15px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#90caf9' }}>
              <th style={{ padding: '12px', border: '1px solid #2196f3', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #2196f3', textAlign: 'left' }}>Product</th>
              <th style={{ padding: '12px', border: '1px solid #2196f3', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '12px', border: '1px solid #2196f3', textAlign: 'left' }}>Stock</th>
              <th style={{ padding: '12px', border: '1px solid #2196f3', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr 
                key={item.id}
                onClick={() => handleRowClick(item.id)}
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: selectedId === item.id ? '#fff3e0' : 'white',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedId !== item.id) {
                    (e.target as HTMLElement).style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedId !== item.id) {
                    (e.target as HTMLElement).style.backgroundColor = 'white';
                  }
                }}
              >
                <td style={{ padding: '10px', border: '1px solid #2196f3' }}>{item.id}</td>
                <td style={{ padding: '10px', border: '1px solid #2196f3', fontWeight: 'bold' }}>
                  {item.name}
                </td>
                <td style={{ padding: '10px', border: '1px solid #2196f3' }}>${item.price}</td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #2196f3',
                  color: item.stock > 10 ? 'green' : item.stock > 5 ? 'orange' : 'red',
                  fontWeight: 'bold'
                }}>
                  {item.stock}
                </td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #2196f3'
                }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: item.stock > 5 ? '#4caf50' : '#f44336'
                  }}>
                    {item.stock > 5 ? 'In Stock' : 'Low Stock'}
                  </span>
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
        ✨ <strong>{isSSR ? 'SSR' : 'CSR'} Component:</strong> This is a proper React component 
        {isSSR ? ' that can be server-side rendered and then hydrated' : ' rendered entirely on the client side'}.
        Selection state: <strong>{selectedId || 'None'}</strong>
      </div>
    </div>
  );
};

export default InteractiveTable;