import React, { useEffect, useState } from 'react';

interface WorkingIslandBoundaryProps {
  name: string;
  remoteModule?: string;
  remoteName?: string;
  props?: Record<string, any>;
  strategy?: string;
  priority?: string;
}

const WorkingIslandBoundary: React.FC<WorkingIslandBoundaryProps> = ({
  name,
  remoteModule = 'ssr_app',
  remoteName,
  props = {},
  strategy = 'lazy',
  priority = 'normal'
}) => {
  const [ssrHtml, setSsrHtml] = useState<string>('');
  const [InteractiveComponent, setInteractiveComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'ssr' | 'hydrating' | 'interactive'>('ssr');

  useEffect(() => {
    loadIsland();
  }, [name]);

  const loadIsland = async () => {
    try {
      setIsLoading(true);
      setLoadingStage('ssr');
      
      // Step 1: Load SSR HTML
      console.log(`🏝️ Loading SSR HTML for ${name}...`);
      const ssrUrl = `http://localhost:3002/api/island-html?component=${encodeURIComponent(name)}&props=${encodeURIComponent(JSON.stringify(props))}&strategy=${strategy}&priority=${priority}`;
      
      const response = await fetch(ssrUrl);
      if (response.ok) {
        const html = await response.text();
        setSsrHtml(html);
        console.log(`✅ SSR HTML loaded for ${name}`);
        
        // Step 2: After showing SSR HTML, load interactive component
        setTimeout(() => {
          loadInteractiveComponent();
        }, 1500); // Give user time to see SSR version
      } else {
        throw new Error(`Failed to fetch SSR HTML: ${response.status}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to load SSR HTML for ${name}:`, error);
      // If SSR fails, go straight to interactive component
      loadInteractiveComponent();
    } finally {
      setIsLoading(false);
    }
  };

  const loadInteractiveComponent = async () => {
    try {
      setLoadingStage('hydrating');
      console.log(`💧 Loading interactive component for ${name}...`);
      
      // Load the interactive component via Module Federation
      const { federatedLoader } = await import('./FederatedComponentLoader');
      const Component = await federatedLoader.loadRemoteModule(remoteModule, 'InteractiveCounter');
      
      setInteractiveComponent(() => Component);
      setLoadingStage('interactive');
      console.log(`✅ Interactive component loaded for ${name}`);
      
    } catch (error) {
      console.error(`❌ Failed to load interactive component for ${name}:`, error);
      // Stay with SSR HTML only
      setLoadingStage('ssr');
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

  // Show different content based on loading stage
  if (loadingStage === 'interactive' && InteractiveComponent) {
    // Fully interactive version
    return (
      <div 
        data-island={name}
        data-hydrated="true"
        data-strategy={strategy}
        data-priority={priority}
      >
        <InteractiveComponent {...props} />
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
          ✅ Island fully interactive! Click buttons to test.
        </div>
      </div>
    );
  }

  if (loadingStage === 'hydrating') {
    // Show SSR HTML with hydrating indicator
    return (
      <div 
        data-island={name}
        data-hydrated="false"
        data-strategy={strategy}
        data-priority={priority}
      >
        <div dangerouslySetInnerHTML={{ __html: ssrHtml }} />
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center',
          color: '#ef6c00'
        }}>
          🔄 Loading interactive component...
        </div>
      </div>
    );
  }

  // Default: SSR HTML only
  return (
    <div 
      data-island={name}
      data-hydrated="false"
      data-strategy={strategy}
      data-priority={priority}
    >
      <div dangerouslySetInnerHTML={{ __html: ssrHtml }} />
      <div style={{
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '4px',
        fontSize: '12px',
        textAlign: 'center',
        color: '#1976d2'
      }}>
        📄 SSR HTML only (interactive component failed to load)
      </div>
    </div>
  );
};

export default WorkingIslandBoundary;