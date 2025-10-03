import React, { useState, useEffect, useRef } from 'react';

const HydratedSSRSection: React.FC = () => {
  const [ssrHtml, setSsrHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [fetchTime, setFetchTime] = useState<number>(0);
  const [hydrationTime, setHydrationTime] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInteractiveSSRHtml = async () => {
      const startTime = performance.now();
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch pre-rendered interactive HTML from SSR server
        const response = await fetch('http://localhost:3002/api/interactive-fragment');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const htmlContent = await response.text();
        const endTime = performance.now();
        
        setSsrHtml(htmlContent);
        setFetchTime(endTime - startTime);
        setLoading(false);
        
        console.log('=== Interactive SSR HTML Fetch Performance ===');
        console.log('Fetch + Render Time:', endTime - startTime, 'ms');
        console.log('HTML Length:', htmlContent.length, 'characters');
        
      } catch (err) {
        console.error('Failed to fetch interactive SSR HTML:', err);
        setError('Failed to load interactive SSR content');
        setLoading(false);
      }
    };

    fetchInteractiveSSRHtml();
  }, []);

  useEffect(() => {
    // Set up hydration and message listener after HTML is injected
    if (ssrHtml && !loading) {
      const hydrationStart = performance.now();
      
      // Listen for messages from the injected SSR component
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'ROW_SELECTED' && event.data.source === 'ssr-hydrated-component') {
          setSelectedRowId(event.data.rowId);
          
          const hydrationEnd = performance.now();
          setHydrationTime(hydrationEnd - hydrationStart);
          
          console.log('=== Hydration Complete ===');
          console.log('Row selected:', event.data.rowId);
          console.log('Hydration time:', hydrationEnd - hydrationStart, 'ms');
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Simulate additional hydration (enhance the injected content)
      setTimeout(() => {
        if (containerRef.current) {
          const rows = containerRef.current.querySelectorAll('.interactive-row');
          rows.forEach((row) => {
            // Add hover effects via hydration
            (row as HTMLElement).addEventListener('mouseenter', () => {
              (row as HTMLElement).style.backgroundColor = '#f5f5f5';
            });
            (row as HTMLElement).addEventListener('mouseleave', () => {
              const isSelected = (row as HTMLElement).getAttribute('data-row-id') === selectedRowId;
              (row as HTMLElement).style.backgroundColor = isSelected ? '#fff3e0' : 'white';
            });
          });
        }
      }, 100);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [ssrHtml, loading, selectedRowId]);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        border: '2px solid #ff9800',
        backgroundColor: '#fff3e0',
        margin: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>🔄 Fetching Interactive SSR Content...</h3>
        <p>Loading server-side rendered component with hydration support...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        border: '2px solid #f44336',
        backgroundColor: '#ffebee',
        margin: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>❌ Error Loading Interactive SSR Content</h3>
        <p>{error}</p>
        <p>Make sure the SSR server is running on port 3002</p>
      </div>
    );
  }

  return (
    <div>
      {/* CSR Status Display */}
      <div style={{ 
        padding: '15px',
        backgroundColor: '#e8f5e9',
        border: '3px solid #4caf50',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3 style={{ marginTop: 0, color: '#2e7d32' }}>
          🎯 CSR Hydration Status & Selection Tracking
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <p><strong>Fetch Time:</strong> {fetchTime.toFixed(2)}ms</p>
            <p><strong>Content Size:</strong> {ssrHtml.length} characters</p>
            <p><strong>Hydration Time:</strong> {hydrationTime ? `${hydrationTime.toFixed(2)}ms` : 'Waiting for interaction...'}</p>
          </div>
          <div style={{ 
            padding: '10px',
            backgroundColor: selectedRowId ? '#c8e6c9' : '#ffecb3',
            borderRadius: '5px',
            border: selectedRowId ? '2px solid #4caf50' : '2px solid #ff9800'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>
              {selectedRowId ? '✅ Row Selected!' : '⏳ No Selection Yet'}
            </h4>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              {selectedRowId ? `Selected Row: ${selectedRowId}` : 'Click a row below to see hydration in action'}
            </p>
          </div>
        </div>
        
        <div style={{ 
          fontSize: '14px',
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f1f8e9',
          borderRadius: '4px',
          border: '1px solid #8bc34a'
        }}>
          <strong>🔄 Hydration Process:</strong> The content below was rendered as HTML on the server. 
          CSR JavaScript has now "hydrated" it, adding click handlers and state management 
          while preserving the original DOM structure for optimal performance.
        </div>
      </div>
      
      {/* Inject the pre-rendered interactive HTML */}
      <div 
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: ssrHtml }}
      />
      
      <div style={{ 
        padding: '15px',
        backgroundColor: '#e3f2fd',
        border: '2px solid #2196f3',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h4 style={{ marginTop: 0, color: '#1976d2' }}>🧪 What Just Happened (SSR + Hydration):</h4>
        <ol style={{ marginBottom: 0 }}>
          <li><strong>SSR:</strong> Server rendered the component to HTML with all data and basic structure</li>
          <li><strong>HTML Injection:</strong> CSR page fetched and injected the pre-rendered HTML</li>
          <li><strong>Hydration:</strong> CSR JavaScript added event listeners and interactive features</li>
          <li><strong>State Sync:</strong> Selection state flows from hydrated component back to CSR parent</li>
          <li><strong>Enhancement:</strong> Additional features (hover effects) added via hydration</li>
        </ol>
        
        <div style={{ 
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#bbdefb',
          borderRadius: '4px'
        }}>
          <strong>📈 Performance Benefits:</strong> Fast first paint (SSR HTML) + 
          Full interactivity (CSR hydration) = Best of both worlds!
        </div>
      </div>
    </div>
  );
};

export default HydratedSSRSection;