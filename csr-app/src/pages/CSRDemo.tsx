import React, { useEffect, useState } from 'react';
import HeavyCSRComponent from '../components/HeavyCSRComponent';
import SSRHtmlSection from '../components/SSRHtmlSection';

const CSRDemo: React.FC = () => {
  const [metrics, setMetrics] = useState<string>('');

  useEffect(() => {
    // Measure performance after component loads
    const measurePerformance = () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      console.log('=== CSR Full Page Performance ===');
      console.log('Time to First Byte:', perfData.responseEnd - perfData.fetchStart, 'ms');
      console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.fetchStart, 'ms');
      console.log('Full Page Load:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
      
      setMetrics(`
        Server Response: ${Math.round(perfData.responseEnd - perfData.fetchStart)}ms
        DOM Ready: ${Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)}ms
        Full Load: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms
      `);
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: 'center', color: '#d32f2f' }}>
        CSR Demo - Client-side JavaScript Rendering
      </h1>
      
      <div style={{ 
        textAlign: 'center', 
        padding: '10px',
        backgroundColor: '#ffebee',
        margin: '20px'
      }}>
        <p><strong>Client Render Time:</strong> {new Date().toISOString()}</p>
        <p style={{ whiteSpace: 'pre-line' }}>
          <strong>Actual Performance Metrics:</strong><br/>
          {metrics || 'Measuring...'}
        </p>
        <p style={{ 
          fontSize: '14px', 
          color: '#666',
          marginTop: '10px'
        }}>
          View Page Source - Notice the empty div#root!
        </p>
      </div>

      <HeavyCSRComponent />
      
      <SSRHtmlSection />
      
      <div style={{ 
        margin: '20px',
        padding: '20px',
        backgroundColor: '#fce4ec',
        border: '2px solid #e91e63'
      }}>
        <h3>How CSR Works:</h3>
        <ol>
          <li>Browser receives minimal HTML with empty root div</li>
          <li>Browser downloads JavaScript bundle</li>
          <li>JavaScript parses and executes</li>
          <li>React renders components in browser</li>
          <li>Data fetching happens AFTER JS loads</li>
          <li>Finally, content appears (delayed first paint)</li>
        </ol>
      </div>
    </div>
  );
};

export default CSRDemo;