import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import TabMenu from './components/TabMenu';
import { ProductsSection, UsersSection, MixedSection } from './components/FederatedComponents';
import CSRDemo from './pages/CSRDemo';
import SSRHtmlSection from './components/SSRHtmlSection';
import HydratedSSRSection from './components/HydratedSSRSection';
import ProperHydrationDemo from './components/ProperHydrationDemo';
import StyledComponentsExample from './components/StyledComponentsExample';

function App() {
  const [activeTab, setActiveTab] = useState('csr-demo');

  return (
    <div className="App">
      <Header />
      <TabMenu onTabChange={setActiveTab} />
      
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem' 
      }}>
        <div style={{
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px'
        }}>
          <h2>🔬 Module Federation Demo</h2>
          <p>
            This CSR app consumes SSR components from a Next.js app via Webpack Module Federation.
            The federated components maintain their server-side rendering benefits while being
            dynamically loaded into this client-side app.
          </p>
          <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
            <li>✅ Fast initial paint from SSR components</li>
            <li>✅ Progressive hydration for interactivity</li>
            <li>✅ Runtime component sharing</li>
            <li>✅ Independent deployments</li>
          </ul>
        </div>

        {activeTab === 'csr-demo' && <CSRDemo />}
        {activeTab === 'ssr-html' && (
          <div>
            <h1 style={{ textAlign: 'center', color: '#2e7d32' }}>
              SSR HTML Injected into CSR Page
            </h1>
            <div style={{ 
              textAlign: 'center', 
              padding: '10px',
              backgroundColor: '#e8f5e9',
              margin: '20px'
            }}>
              <p>This demonstrates fetching pre-rendered HTML from the SSR server and injecting it into the CSR page.</p>
            </div>
            <SSRHtmlSection />
          </div>
        )}
        {activeTab === 'hydrated' && (
          <div>
            <h1 style={{ textAlign: 'center', color: '#1976d2' }}>
              🔄 SSR + CSR Hydration Demo (OLD - with inline scripts)
            </h1>
            <div style={{ 
              textAlign: 'center', 
              padding: '10px',
              backgroundColor: '#e3f2fd',
              margin: '20px'
            }}>
              <p>This demonstrates SSR content becoming interactive through CSR hydration. Click rows to see state management!</p>
            </div>
            <HydratedSSRSection />
          </div>
        )}
        {activeTab === 'proper-hydration' && (
          <div>
            <h1 style={{ textAlign: 'center', color: '#1976d2' }}>
              ⚡ Proper React SSR + CSR Hydration
            </h1>
            <div style={{ 
              textAlign: 'center', 
              padding: '10px',
              backgroundColor: '#e8f5e9',
              margin: '20px'
            }}>
              <p><strong>🎯 This solves both problems:</strong> Easy React development + Working state communication!</p>
            </div>
            <ProperHydrationDemo />
          </div>
        )}
        {activeTab === 'styled-components' && <StyledComponentsExample />}
        <ProductsSection visible={activeTab === 'products'} />
        <UsersSection visible={activeTab === 'users'} />
        <MixedSection visible={activeTab === 'mixed'} />
      </main>
    </div>
  );
}

export default App;
