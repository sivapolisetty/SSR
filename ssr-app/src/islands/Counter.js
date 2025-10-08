import React from 'react';

// Static SSR-only counter component
const Counter = ({ 
  initialCount = 0,
  title = "Interactive Counter",
  hydrationStrategy = 'immediate',
  priority = 'high' 
}) => {
  // No hooks - pure SSR render
  const count = initialCount;
  const isHydrated = false;

  return (
    <div style={{
      border: '3px solid #4caf50',
      borderRadius: '12px',
      padding: '30px',
      margin: '20px',
      backgroundColor: '#f8f9fa',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Island Status Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: isHydrated ? '#e8f5e9' : '#fff3e0',
        borderRadius: '8px',
        border: `2px solid ${isHydrated ? '#4caf50' : '#ff9800'}`
      }}>
        <h2 style={{ margin: 0, color: '#4caf50' }}>
          🏝️ {title}
        </h2>
        <div style={{
          fontSize: '12px',
          color: isHydrated ? '#2e7d32' : '#ef6c00',
          fontWeight: 'bold'
        }}>
          {isHydrated ? '✅ HYDRATED' : '⏳ SSR HTML ONLY'}
          <br />
          Strategy: {hydrationStrategy} | Priority: {priority}
        </div>
      </div>

      {/* Counter Display */}
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#4caf50',
        marginBottom: '20px'
      }}>
        {count}
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <button
          style={{
            fontSize: '18px',
            padding: '12px 24px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'default',
            fontWeight: 'bold'
          }}
        >
          - Decrease
        </button>
        <button
          style={{
            fontSize: '18px',
            padding: '12px 24px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'default',
            fontWeight: 'bold'
          }}
        >
          Reset
        </button>
        <button
          style={{
            fontSize: '18px',
            padding: '12px 24px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'default',
            fontWeight: 'bold'
          }}
        >
          + Increase
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        fontSize: '14px',
        color: '#666',
        backgroundColor: '#e3f2fd',
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'left'
      }}>
        <strong>🚀 Islands Architecture Demo:</strong>
        <br />
        1. This HTML was rendered on the server (port 3002)
        <br />
        2. Initial count: {count}
        <br />
        3. Buttons are static (SSR HTML only)
        <br />
        4. Status: ⏳ Ready for hydration
        <br />
        5. Strategy: {hydrationStrategy} with {priority} priority
      </div>
    </div>
  );
};

export default Counter;