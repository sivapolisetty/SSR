import React, { useEffect, useRef, useState } from 'react';

interface SimpleIslandBoundaryProps {
  name: string;
  remoteModule?: string;
  remoteName?: string;
  props?: Record<string, any>;
  strategy?: string;
  priority?: string;
}

const SimpleIslandBoundary: React.FC<SimpleIslandBoundaryProps> = ({
  name,
  remoteModule = 'ssr_app',
  remoteName,
  props = {},
  strategy = 'lazy',
  priority = 'normal'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    loadIslandContent();
  }, [name, props]);

  const loadIslandContent = async () => {
    try {
      setIsLoading(true);
      
      // Step 1: Fetch SSR HTML first
      console.log(`🏝️ Fetching SSR HTML for island: ${name}`);
      
      const ssrUrl = `http://localhost:3002/api/island-html?component=${encodeURIComponent(name)}&props=${encodeURIComponent(JSON.stringify(props))}&strategy=${strategy}&priority=${priority}`;
      
      const response = await fetch(ssrUrl);
      if (response.ok) {
        const html = await response.text();
        setHtmlContent(html);
        console.log(`✅ SSR HTML loaded for ${name}`);
        
        // Step 2: After a brief delay, attempt hydration
        setTimeout(() => {
          attemptHydration();
        }, 1000);
      } else {
        throw new Error(`Failed to fetch SSR HTML: ${response.status}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to load island ${name}:`, error);
      setHtmlContent(`
        <div style="padding: 20px; border: 2px solid #f44336; border-radius: 8px; background-color: #ffebee; text-align: center;">
          <h3>❌ Island Load Failed: ${name}</h3>
          <p>Could not load SSR HTML from server</p>
          <small>Make sure SSR app is running on port 3002</small>
        </div>
      `);
    } finally {
      setIsLoading(false);
    }
  };

  const attemptHydration = async () => {
    try {
      console.log(`💧 Attempting hydration for ${name}`);
      
      // Load the interactive component via Module Federation
      const { federatedLoader } = await import('./FederatedComponentLoader');
      const InteractiveComponent = await federatedLoader.loadRemoteModule(remoteModule, 'InteractiveCounter');
      
      console.log(`✅ Loaded interactive component for ${name}`);
      
      // Replace the SSR HTML with the interactive React component
      if (containerRef.current) {
        const React = await import('react');
        const ReactDOM = await import('react-dom/client');
        
        // Clear the SSR HTML
        containerRef.current.innerHTML = '';
        
        // Create React root and render interactive component
        const root = ReactDOM.createRoot(containerRef.current);
        root.render(React.createElement(InteractiveComponent, props));
        
        setIsHydrated(true);
        console.log(`✅ ${name} hydrated with interactive component`);
      }
      
    } catch (error) {
      console.error(`❌ Hydration failed for ${name}:`, error);
      // Continue with SSR HTML only
      console.log(`📄 Continuing with SSR HTML only for ${name}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        padding: '40px',
        border: '2px dashed #2196f3',
        borderRadius: '8px',
        backgroundColor: '#e3f2fd',
        textAlign: 'center'
      }}>
        <h3>🔄 Loading {name} Island...</h3>
        <p>Fetching SSR HTML from port 3002...</p>
      </div>
    );
  }

  return (
    <div 
      data-island={name}
      data-hydrated={isHydrated}
      data-strategy={strategy}
      data-priority={priority}
    >
      {/* Container for the island content */}
      <div ref={containerRef}>
        {/* Render SSR HTML only if not hydrated */}
        {!isHydrated && (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        )}
        {/* When hydrated, the interactive component is rendered directly into containerRef */}
      </div>
      
      {/* Hydration status indicator */}
      {isHydrated && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#e8f5e9',
          border: '1px solid #4caf50',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center',
          color: '#2e7d32'
        }}>
          ✅ Island hydrated successfully with interactive component!
        </div>
      )}
    </div>
  );
};

export default SimpleIslandBoundary;