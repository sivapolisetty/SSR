// This function runs on the server before rendering
export async function getServerSideProps() {
  // Simulate data fetching on server
  const data = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
    status: Math.random() > 0.5 ? 'Active' : 'Pending'
  }));

  return {
    props: {
      data,
      serverTime: new Date().toISOString()
    }
  };
}

const SSRDemo = ({ data, serverTime }) => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', color: '#2e7d32' }}>
        SSR Demo - Pre-rendered HTML
      </h1>
      
      <div style={{ 
        textAlign: 'center', 
        padding: '10px',
        backgroundColor: '#e3f2fd',
        margin: '20px'
      }}>
        <p><strong>Server Render Time:</strong> {serverTime}</p>
        <p style={{ 
          fontSize: '14px', 
          color: '#666',
          marginTop: '10px'
        }}>
          View Page Source to see the pre-rendered HTML content!
        </p>
      </div>

      <div style={{ 
        padding: '20px', 
        border: '3px solid #00ff00',
        backgroundColor: '#f0fff0',
        margin: '20px'
      }}>
        <h2 style={{ color: '#008000' }}>SSR Component (Pre-rendered HTML)</h2>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
          Rendered on: Server
        </p>
        <p>First Paint Time: <span>Immediate (HTML already rendered)</span></p>
        
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
      
      <div style={{ 
        margin: '20px',
        padding: '20px',
        backgroundColor: '#fff3e0',
        border: '2px solid #ff9800'
      }}>
        <h3>How SSR Works:</h3>
        <ol>
          <li>Server receives request</li>
          <li>Server fetches data and renders React components to HTML</li>
          <li>Complete HTML sent to browser (view source to see)</li>
          <li>Browser displays HTML immediately (no JS needed for first paint)</li>
          <li>React hydrates the HTML (makes it interactive)</li>
        </ol>
      </div>
    </div>
  );
};

export default SSRDemo;