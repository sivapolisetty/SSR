import React, { useEffect, useState } from 'react';

interface DataItem {
  id: number;
  name: string;
  value: number;
  status: string;
}

const HeavyCSRComponent: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    // Simulate data fetching in browser
    setTimeout(() => {
      const generatedData = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        value: Math.floor(Math.random() * 1000),
        status: Math.random() > 0.5 ? 'Active' : 'Pending'
      }));
      
      setData(generatedData);
      setLoading(false);
      
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
      
      console.log('=== CSR Performance Metrics ===');
      console.log('JS Parse + Execute + Render:', endTime - startTime, 'ms');
    }, 500); // Simulate network delay
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        border: '3px solid #ff9800',
        backgroundColor: '#fff3e0',
        margin: '20px',
        textAlign: 'center'
      }}>
        <h2>Loading CSR Component...</h2>
        <p>JavaScript is parsing and fetching data...</p>
        <div style={{ fontSize: '48px', margin: '20px' }}>⏳</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '3px solid #ff0000',
      backgroundColor: '#ffebee',
      margin: '20px'
    }}>
      <h2 style={{ color: '#c62828' }}>CSR Component (Client-side Rendered)</h2>
      <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
        Rendered on: Client (Browser)
      </p>
      <p>Time to Render: <span style={{ color: 'red', fontWeight: 'bold' }}>{renderTime.toFixed(2)}ms</span> (after JS parsing)</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Large Data Table (Rendered in Browser)</h3>
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
        backgroundColor: '#ffebee',
        borderRadius: '5px'
      }}>
        <h4>CSR Limitations Demonstrated:</h4>
        <ul>
          <li>❌ Blank page until JS loads and executes</li>
          <li>❌ Data fetching happens after JS parsing</li>
          <li>❌ Poor SEO - crawlers see empty content</li>
          <li>❌ Slower Time to First Contentful Paint (FCP)</li>
        </ul>
      </div>
    </div>
  );
};

export default HeavyCSRComponent;