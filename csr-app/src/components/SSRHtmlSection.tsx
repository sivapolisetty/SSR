import React, { useState, useEffect } from 'react';

const SSRHtmlSection: React.FC = () => {
  const [ssrHtml, setSsrHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [fetchTime, setFetchTime] = useState<number>(0);

  useEffect(() => {
    const fetchSSRHtml = async () => {
      const startTime = performance.now();
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch pre-rendered HTML from SSR server
        const response = await fetch('http://localhost:3002/api/html-fragment');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const htmlContent = await response.text();
        const endTime = performance.now();
        
        setSsrHtml(htmlContent);
        setFetchTime(endTime - startTime);
        setLoading(false);
        
        console.log('=== SSR HTML Fetch Performance ===');
        console.log('Fetch + Render Time:', endTime - startTime, 'ms');
        console.log('HTML Length:', htmlContent.length, 'characters');
        
      } catch (err) {
        console.error('Failed to fetch SSR HTML:', err);
        setError('Failed to load SSR content');
        setLoading(false);
      }
    };

    fetchSSRHtml();
  }, []);

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
        <h3>🔄 Fetching Pre-rendered HTML from SSR Server...</h3>
        <p>Loading server-side rendered content...</p>
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
        <h3>❌ Error Loading SSR Content</h3>
        <p>{error}</p>
        <p>Make sure the SSR server is running on port 3002</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        padding: '15px',
        backgroundColor: '#e3f2fd',
        border: '2px solid #2196f3',
        borderRadius: '8px',
        margin: '20px 20px 0 20px'
      }}>
        <h3 style={{ marginTop: 0 }}>📊 SSR HTML Injection Demo</h3>
        <p><strong>Fetch Time:</strong> {fetchTime.toFixed(2)}ms</p>
        <p><strong>Content Size:</strong> {ssrHtml.length} characters</p>
        <p><strong>Method:</strong> Fetched pre-rendered HTML from SSR server and injected into CSR page</p>
        <div style={{ 
          fontSize: '14px',
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#bbdefb',
          borderRadius: '4px'
        }}>
          <strong>🎯 Advantage:</strong> The content below was already rendered as HTML on the server. 
          No JavaScript component rendering needed - just pure HTML injection!
        </div>
      </div>
      
      {/* Inject the pre-rendered HTML */}
      <div 
        dangerouslySetInnerHTML={{ __html: ssrHtml }}
      />
      
      <div style={{ 
        padding: '15px',
        backgroundColor: '#f3e5f5',
        border: '2px solid #9c27b0',
        borderRadius: '8px',
        margin: '0 20px 20px 20px'
      }}>
        <h4 style={{ marginTop: 0 }}>🔍 How This Works:</h4>
        <ol style={{ marginBottom: 0 }}>
          <li>SSR server (port 3002) renders React component to HTML string</li>
          <li>CSR app (port 3001) fetches this pre-rendered HTML via API call</li>
          <li>HTML is injected directly into the page using dangerouslySetInnerHTML</li>
          <li>Result: Server-rendered content appears in CSR page without client-side rendering</li>
        </ol>
      </div>
    </div>
  );
};

export default SSRHtmlSection;