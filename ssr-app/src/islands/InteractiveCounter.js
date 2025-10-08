import React, { useState, useEffect } from 'react';

// Interactive counter component for Module Federation hydration
const InteractiveCounter = ({ 
  initialCount = 0,
  title = "Interactive Counter",
  hydrationStrategy = 'immediate',
  priority = 'high' 
}) => {
  const [count, setCount] = useState(initialCount);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    console.log(`🏝️ Interactive Counter hydrated with count: ${count}`);
  }, [count]);

  const handleDecrease = () => {
    setCount(prev => prev - 1);
  };

  const handleReset = () => {
    setCount(initialCount);
  };

  const handleIncrease = () => {
    setCount(prev => prev + 1);
  };

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
          {isHydrated ? '✅ HYDRATED & INTERACTIVE' : '⏳ HYDRATING...'}
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

      {/* Interactive Buttons */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <button
          onClick={handleDecrease}
          style={{
            fontSize: '18px',
            padding: '12px 24px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'transform 0.1s',
            ':hover': {
              transform: 'scale(1.05)'
            }
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          - Decrease
        </button>
        <button
          onClick={handleReset}
          style={{
            fontSize: '18px',
            padding: '12px 24px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          Reset
        </button>
        <button
          onClick={handleIncrease}
          style={{
            fontSize: '18px',
            padding: '12px 24px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          + Increase
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        fontSize: '14px',
        color: '#666',
        backgroundColor: '#e8f5e9',
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'left',
        border: '2px solid #4caf50'
      }}>
        <strong>🎉 Islands Architecture Success!</strong>
        <br />
        ✅ 1. HTML was first rendered on server (port 3002)
        <br />
        ✅ 2. JavaScript loaded via Module Federation
        <br />
        ✅ 3. Component is now fully interactive!
        <br />
        ✅ 4. Current count: {count} | Initial: {initialCount}
        <br />
        ✅ 5. Strategy: {hydrationStrategy} with {priority} priority
      </div>
    </div>
  );
};

export default InteractiveCounter;