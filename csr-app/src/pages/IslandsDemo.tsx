import React, { useState, useEffect } from 'react';
import IslandBoundary from '../islands/IslandBoundary';
import IslandPerformanceMonitor from '../islands/IslandPerformanceMonitor';
import { islandRegistry } from '../islands/IslandRegistry';
import { islandCommunicationHub } from '../islands/IslandCommunication';

const IslandsDemo: React.FC = () => {
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(true);
  const [messageLog, setMessageLog] = useState<string[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');

  useEffect(() => {
    // Subscribe to island messages for demonstration
    const unsubscribe = islandCommunicationHub.subscribe(
      'IslandsDemo',
      'ISLAND_INTERACTION',
      (message) => {
        const logEntry = `[${new Date().toLocaleTimeString()}] ${message.source}: ${message.data.action}`;
        setMessageLog(prev => [...prev.slice(-4), logEntry]);
      }
    );

    return unsubscribe;
  }, []);

  const strategies = [
    { value: 'all', label: 'All Strategies' },
    { value: 'immediate', label: 'Immediate' },
    { value: 'lazy', label: 'Lazy (Viewport)' },
    { value: 'interaction', label: 'On Interaction' },
    { value: 'idle', label: 'When Idle' },
    { value: 'priority', label: 'Priority-based' },
    { value: 'manual', label: 'Manual' }
  ];

  const shouldShowIsland = (strategy: string) => {
    return selectedStrategy === 'all' || selectedStrategy === strategy;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1976d2',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>
          🏝️ Islands Architecture Demo
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
          Module Federation + Selective Hydration + SSR Components in CSR App
        </p>
      </div>

      {/* Controls */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Filter by Strategy:</label>
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          >
            {strategies.map(strategy => (
              <option key={strategy.value} value={strategy.value}>
                {strategy.label}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={showPerformanceMonitor}
              onChange={(e) => setShowPerformanceMonitor(e.target.checked)}
            />
            Performance Monitor
          </label>
          <button
            onClick={() => {
              islandRegistry.cleanup();
              window.location.reload();
            }}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Reset Demo
          </button>
        </div>
      </div>

      {/* Message Log */}
      {messageLog.length > 0 && (
        <div style={{
          backgroundColor: '#263238',
          color: '#4caf50',
          padding: '10px 20px',
          fontFamily: 'monospace',
          fontSize: '12px',
          borderBottom: '1px solid #eee'
        }}>
          <strong>🔥 Live Island Interactions:</strong>
          {messageLog.map((msg, index) => (
            <div key={index} style={{ marginLeft: '10px' }}>
              {msg}
            </div>
          ))}
        </div>
      )}

      {/* Demo Content */}
      <div style={{ padding: '20px' }}>
        
        {/* Immediate Hydration Section */}
        {shouldShowIsland('immediate') && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#1976d2', 
              borderBottom: '2px solid #1976d2',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              🚀 Immediate Hydration Strategy
            </h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              These islands hydrate immediately when the page loads. Best for critical interactive components.
            </p>
            
            <IslandBoundary
              name="ShoppingCart"
              strategy="immediate"
              priority="critical"
              remoteModule="ssr_app"
              remoteName="ShoppingCart"
              onHydrated={(metadata) => console.log('Shopping cart hydrated:', metadata)}
            />
          </section>
        )}

        {/* Lazy Hydration Section */}
        {shouldShowIsland('lazy') && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#4caf50', 
              borderBottom: '2px solid #4caf50',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              👁️ Lazy Hydration Strategy (Viewport-based)
            </h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              These islands only hydrate when they enter the viewport. Scroll down to see them in action!
            </p>
            
            {/* Add some spacing to demonstrate lazy loading */}
            <div style={{ height: '200px', 
              backgroundColor: '#e3f2fd', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '20px',
              borderRadius: '8px',
              fontSize: '18px',
              color: '#1976d2'
            }}>
              📜 Scroll down to trigger lazy hydration...
            </div>
            
            <IslandBoundary
              name="InteractiveDataTable"
              strategy="lazy"
              priority="normal"
              remoteModule="ssr_app"
              remoteName="InteractiveDataTable"
              onHydrated={(metadata) => console.log('Data table hydrated:', metadata)}
            />
          </section>
        )}

        {/* Interaction-based Hydration */}
        {shouldShowIsland('interaction') && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#ff9800', 
              borderBottom: '2px solid #ff9800',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              🖱️ Interaction-based Hydration
            </h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              These islands only hydrate when the user interacts with them (hover, click, touch).
            </p>
            
            <IslandBoundary
              name="WeatherWidget"
              strategy="interaction"
              priority="low"
              remoteModule="ssr_app"
              remoteName="WeatherWidget"
              props={{ location: 'New York' }}
              onHydrated={(metadata) => console.log('Weather widget hydrated:', metadata)}
            />
          </section>
        )}

        {/* Idle Hydration */}
        {shouldShowIsland('idle') && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#9c27b0', 
              borderBottom: '2px solid #9c27b0',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              😴 Idle Hydration Strategy
            </h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              These islands hydrate when the browser is idle, using requestIdleCallback.
            </p>
            
            <IslandBoundary
              name="WeatherWidget"
              strategy="idle"
              priority="low"
              remoteModule="ssr_app"
              remoteName="WeatherWidget"
              props={{ location: 'London' }}
              onHydrated={(metadata) => console.log('London weather hydrated:', metadata)}
            />
          </section>
        )}

        {/* Priority-based Hydration */}
        {shouldShowIsland('priority') && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#f44336', 
              borderBottom: '2px solid #f44336',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              ⭐ Priority-based Hydration
            </h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              These islands hydrate based on their priority level, with delays applied accordingly.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <IslandBoundary
                name="WeatherWidget"
                strategy="priority"
                priority="high"
                remoteModule="ssr_app"
                remoteName="WeatherWidget"
                props={{ location: 'Tokyo', priority: 'high' }}
                onHydrated={(metadata) => console.log('High priority weather hydrated:', metadata)}
              />
              
              <IslandBoundary
                name="WeatherWidget"
                strategy="priority"
                priority="low"
                remoteModule="ssr_app"
                remoteName="WeatherWidget"
                props={{ location: 'Sydney', priority: 'low' }}
                onHydrated={(metadata) => console.log('Low priority weather hydrated:', metadata)}
              />
            </div>
          </section>
        )}

        {/* Manual Hydration */}
        {shouldShowIsland('manual') && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#607d8b', 
              borderBottom: '2px solid #607d8b',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              🤚 Manual Hydration Strategy
            </h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              These islands only hydrate when explicitly triggered. Look for the "Hydrate" button in development mode.
            </p>
            
            <IslandBoundary
              name="InteractiveDataTable"
              strategy="manual"
              priority="normal"
              remoteModule="ssr_app"
              remoteName="InteractiveDataTable"
              onHydrated={(metadata) => console.log('Manual data table hydrated:', metadata)}
            />
          </section>
        )}

        {/* Architecture Explanation */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '40px'
        }}>
          <h2 style={{ color: '#1976d2', marginTop: 0 }}>
            🏗️ Islands Architecture Explained
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#4caf50', marginBottom: '10px' }}>🏝️ What are Islands?</h4>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                Islands are isolated, interactive components that can be hydrated independently. 
                Each island has its own hydration strategy and state management.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: '#ff9800', marginBottom: '10px' }}>⚡ Selective Hydration</h4>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                Only the components that need interactivity are hydrated, reducing JavaScript bundle size 
                and improving performance.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: '#9c27b0', marginBottom: '10px' }}>🌐 Module Federation</h4>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                Islands are loaded from remote SSR applications using Module Federation, 
                enabling micro-frontend architecture.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: '#f44336', marginBottom: '10px' }}>📊 Performance Monitoring</h4>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                Built-in performance monitoring tracks hydration times, memory usage, 
                and provides real-time metrics.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section style={{ 
          backgroundColor: '#263238',
          color: 'white',
          padding: '30px',
          borderRadius: '8px',
          marginBottom: '40px'
        }}>
          <h2 style={{ color: '#4caf50', marginTop: 0 }}>
            ⚙️ Technical Implementation
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#81c784' }}>Island Registry</h4>
              <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <li>Component registration and discovery</li>
                <li>Hydration strategy management</li>
                <li>Performance tracking</li>
                <li>Error boundary integration</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#81c784' }}>Hydration Manager</h4>
              <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <li>Priority-based scheduling</li>
                <li>Concurrent hydration control</li>
                <li>Performance budgeting</li>
                <li>Retry mechanisms</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#81c784' }}>Observer System</h4>
              <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <li>Intersection Observer for lazy loading</li>
                <li>User intent detection</li>
                <li>Prefetch optimization</li>
                <li>Performance metrics</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#81c784' }}>Communication Hub</h4>
              <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <li>Cross-island messaging</li>
                <li>State synchronization</li>
                <li>Event broadcasting</li>
                <li>Error propagation</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Performance Monitor */}
      {showPerformanceMonitor && <IslandPerformanceMonitor />}
    </div>
  );
};

export default IslandsDemo;