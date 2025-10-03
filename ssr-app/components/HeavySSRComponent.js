import React from 'react';

// This component demonstrates SSR benefits - HTML is pre-rendered on server
const HeavySSRComponent = ({ data }) => {
  // This will be rendered on the server and sent as HTML
  const renderTime = typeof window === 'undefined' ? 'Server' : 'Client';
  
  return (
    <div style={{ 
      padding: '20px', 
      border: '3px solid #00ff00',
      backgroundColor: '#f0fff0',
      margin: '20px'
    }}>
      <h2 style={{ color: '#008000' }}>SSR Component (Pre-rendered HTML)</h2>
      <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
        Rendered on: {renderTime}
      </p>
      <p>First Paint Time: <span id="ssr-fcp">Immediate (HTML already rendered)</span></p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Large Data Table (Pre-rendered on Server)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#e0e0e0' }}>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>ID</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Value</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{item.id}</td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{item.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{item.value}</td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                  <span style={{ 
                    color: item.status === 'Active' ? 'green' : 'orange',
                    fontWeight: 'bold'
                  }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#e8f5e9',
        borderRadius: '5px'
      }}>
        <h4>SSR Benefits Demonstrated:</h4>
        <ul>
          <li>✅ Content visible immediately (no JS parsing needed)</li>
          <li>✅ HTML fully formed on first byte</li>
          <li>✅ Better SEO - crawlers see full content</li>
          <li>✅ Faster Time to First Contentful Paint (FCP)</li>
        </ul>
      </div>
    </div>
  );
};

export default HeavySSRComponent;