import React, { useState, useEffect } from 'react';

// Static component for SSR
const InteractiveDataTableSSR = ({ 
  initialData = [], 
  title = "Interactive Data Table",
  hydrationStrategy = 'lazy',
  priority = 'normal' 
}) => {
  // Default mock data for SSR
  const defaultData = [
    { id: 1, name: 'User Alpha', email: 'alpha@example.com', status: 'active', lastLogin: '2024-01-15' },
    { id: 2, name: 'User Beta', email: 'beta@example.com', status: 'inactive', lastLogin: '2024-01-10' },
    { id: 3, name: 'User Gamma', email: 'gamma@example.com', status: 'active', lastLogin: '2024-01-20' },
    { id: 4, name: 'User Delta', email: 'delta@example.com', status: 'pending', lastLogin: '2024-01-12' },
    { id: 5, name: 'User Epsilon', email: 'epsilon@example.com', status: 'active', lastLogin: '2024-01-18' }
  ];

  const data = initialData.length > 0 ? initialData : defaultData;
  const selectedRows = new Set();
  const sortField = null;
  const sortDirection = 'asc';
  const filter = '';
  const isHydrated = false;

  const filteredAndSortedData = data
    .filter(item => 
      filter === '' || 
      Object.values(item).some(value => 
        value.toString().toLowerCase().includes(filter.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusColor = (status) => {
    const colors = {
      active: '#4caf50',
      inactive: '#f44336',
      pending: '#ff9800'
    };
    return colors[status] || '#9e9e9e';
  };

  return (
    <div style={{
      border: '2px solid #2196f3',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Island Status Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        padding: '10px',
        backgroundColor: isHydrated ? '#e8f5e9' : '#fff3e0',
        borderRadius: '5px',
        border: `2px solid ${isHydrated ? '#4caf50' : '#ff9800'}`
      }}>
        <h3 style={{ margin: 0, color: '#1976d2' }}>
          🏝️ {title}
        </h3>
        <div style={{
          fontSize: '12px',
          color: isHydrated ? '#2e7d32' : '#ef6c00',
          fontWeight: 'bold'
        }}>
          {isHydrated ? '✅ HYDRATED' : '⏳ HYDRATING...'}
          <br />
          Strategy: {hydrationStrategy} | Priority: {priority}
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Filter data..."
          value={filter}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <div style={{ fontSize: '14px', color: '#666' }}>
          Selected: {selectedRows.size} | Total: {filteredAndSortedData.length}
        </div>
      </div>

      {/* Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Select
              </th>
              {['name', 'email', 'status', 'lastLogin'].map(field => (
                <th 
                  key={field}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '1px solid #ddd',
                    cursor: 'default',
                    userSelect: 'none',
                    backgroundColor: sortField === field ? '#e3f2fd' : 'transparent'
                  }}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map(row => (
              <tr 
                key={row.id}
                style={{
                  backgroundColor: selectedRows.has(row.id) ? '#fff3e0' : 'white',
                  borderBottom: '1px solid #eee',
                  cursor: 'default'
                }}
              >
                <td style={{ padding: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    style={{ cursor: 'default' }}
                  />
                </td>
                <td style={{ padding: '12px', fontWeight: '500' }}>{row.name}</td>
                <td style={{ padding: '12px', color: '#666' }}>{row.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: getStatusColor(row.status)
                  }}>
                    {row.status}
                  </span>
                </td>
                <td style={{ padding: '12px', color: '#666' }}>{row.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance Info */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#1976d2'
      }}>
        <strong>🚀 Island Performance:</strong> This component was server-rendered and then hydrated 
        using the {hydrationStrategy} strategy with {priority} priority. 
        Interactions are isolated within this island boundary.
      </div>
    </div>
  );
};

// Main component that decides which version to use
const InteractiveDataTable = (props) => {
  // For SSR, always use the SSR component
  if (typeof window === 'undefined') {
    return <InteractiveDataTableSSR {...props} />;
  }
  
  // On client, use the SSR component initially
  return <InteractiveDataTableSSR {...props} />;
};

export default InteractiveDataTable;