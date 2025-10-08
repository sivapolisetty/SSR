import React from 'react';
import WorkingIslandBoundary from '../islands/WorkingIslandBoundary';

const CounterDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '10px' }}>
        🏝️ Islands Architecture Demo
      </h1>
      
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
          How it works:
        </h2>
        <p style={{ margin: '5px 0', fontSize: '16px' }}>
          1. 📄 <strong>SSR HTML First:</strong> Counter HTML is generated on server (port 3002)
        </p>
        <p style={{ margin: '5px 0', fontSize: '16px' }}>
          2. ⚡ <strong>Fast Load:</strong> You see the component immediately 
        </p>
        <p style={{ margin: '5px 0', fontSize: '16px' }}>
          3. 🔄 <strong>Then Hydration:</strong> JavaScript makes it interactive
        </p>
        <p style={{ margin: '5px 0', fontSize: '16px' }}>
          4. 🎯 <strong>Selective:</strong> Only this component gets JavaScript, not the whole page
        </p>
      </div>

      {/* Single Counter Island Example */}
      <WorkingIslandBoundary
        name="Counter"
        strategy="immediate"
        priority="high"
        remoteModule="ssr_app"
        remoteName="Counter"
        props={{ 
          initialCount: 10,
          title: "SSR → Interactive Counter"
        }}
      />

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🔍 Technical Details:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>CSR App:</strong> localhost:3003 (this page)</li>
          <li><strong>SSR App:</strong> localhost:3002 (renders island HTML)</li>
          <li><strong>Module Federation:</strong> Loads interactive JavaScript</li>
          <li><strong>Islands Architecture:</strong> SSR HTML first + selective hydration</li>
        </ul>
      </div>
    </div>
  );
};

export default CounterDemo;