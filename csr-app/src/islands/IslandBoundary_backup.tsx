import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { islandRegistry, HydrationStrategy, HydrationPriority, IslandMetadata } from './IslandRegistry';
import { federatedLoader } from './FederatedComponentLoader';

interface IslandBoundaryProps {
  name: string;
  strategy?: HydrationStrategy;
  priority?: HydrationPriority;
  dependencies?: string[];
  errorBoundary?: boolean;
  remoteModule?: string;
  remoteName?: string;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  children?: ReactNode;
  onHydrated?: (metadata: IslandMetadata) => void;
  props?: Record<string, any>;
}

interface IslandBoundaryState {
  hasError: boolean;
  error?: Error;
  isLoading: boolean;
  isHydrated: boolean;
  Component?: React.ComponentType<any>;
}

export const IslandBoundary: React.FC<IslandBoundaryProps> = ({
  name,
  strategy = 'lazy',
  priority = 'normal',
  dependencies = [],
  errorBoundary = true,
  remoteModule,
  remoteName,
  fallback,
  loadingComponent,
  errorComponent,
  children,
  onHydrated,
  props = {}
}) => {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<IslandBoundaryState>({
    hasError: false,
    isLoading: !!remoteModule,
    isHydrated: false
  });

  const islandId = useRef(`${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const fetchSSRHtml = async (componentName: string, componentProps: Record<string, any>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      const searchParams = new URLSearchParams({
        component: componentName,
        props: JSON.stringify(componentProps),
        strategy,
        priority,
        islandId: islandId.current
      });
      
      console.log(`🏝️ Fetching SSR HTML for: ${componentName}`);
      
      const response = await fetch(`http://localhost:3002/api/island-html?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch SSR HTML`);
      }
      
      const htmlContent = await response.text();
      
      console.log(`✅ Received SSR HTML for: ${componentName} (${htmlContent.length} chars)`);
      
      // Inject the HTML into the container
      if (boundaryRef.current) {
        boundaryRef.current.innerHTML = htmlContent;
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        isHydrated: false // HTML is rendered but not yet hydrated
      }));
      
    } catch (error) {
      console.error(`Failed to fetch SSR HTML for ${componentName}:`, error);
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        error: error as Error, 
        isLoading: false 
      }));
      
      // Fallback to JavaScript-only rendering
      loadRemoteComponent('ssr_app', componentName);
    }
  };

  const loadRemoteComponent = async (remoteName: string, componentName: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      // Load federated component
      const Component = await federatedLoader.loadRemoteModule(remoteName, componentName);
      
      if (!Component) {
        throw new Error(`Component ${componentName} not found in remote ${remoteName}`);
      }
      
      setState(prev => ({ 
        ...prev, 
        Component, 
        isLoading: false 
      }));
      
    } catch (error) {
      console.error(`Failed to load remote component ${componentName}:`, error);
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        error: error as Error, 
        isLoading: false 
      }));
    }
  };

  useEffect(() => {
    if (!boundaryRef.current) return;

    const metadata: IslandMetadata = {
      id: islandId.current,
      name,
      strategy,
      priority,
      dependencies,
      element: boundaryRef.current,
      props,
      errorBoundary,
      remoteModule,
      remoteName
    };

    // Set up error boundary if enabled
    if (errorBoundary) {
      const originalError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        if (error && boundaryRef.current?.contains(document.activeElement)) {
          setState(prev => ({ ...prev, hasError: true, error }));
          return true;
        }
        return originalError ? originalError(message, source, lineno, colno, error) : false;
      };
    }

    // Register hydration callback
    islandRegistry.onHydrated(islandId.current, (hydratedMetadata) => {
      setState(prev => ({ 
        ...prev, 
        isHydrated: true, 
        isLoading: false 
      }));
      
      if (onHydrated) {
        onHydrated(hydratedMetadata);
      }
    });

    // Register the island for hydration
    if (remoteModule && remoteName) {
      islandRegistry.registerRemoteIsland(metadata);
    } else {
      // Local component (children)
      islandRegistry.register({
        Component: () => <>{children}</>,
        metadata
      });
    }

    // Cleanup function
    return () => {
      if (errorBoundary) {
        window.onerror = null;
      }
    };
  }, [name, strategy, priority, remoteModule, remoteName]);

  // Separate effect for fetching SSR HTML
  useEffect(() => {
    if (remoteModule && remoteName) {
      fetchSSRHtml(remoteName, props);
    }
  }, [remoteModule, remoteName, props, fetchSSRHtml]);

  const manualHydrate = () => {
    islandRegistry.manualHydrate(islandId.current);
  };

  const renderContent = () => {
    if (state.hasError) {
      return errorComponent || (
        <div style={{
          padding: '20px',
          border: '2px solid #f44336',
          borderRadius: '8px',
          backgroundColor: '#ffebee',
          color: '#c62828'
        }}>
          <h4>🚨 Island Error: {name}</h4>
          <p>Component failed to load or hydrate</p>
          <details>
            <summary>Error Details</summary>
            <pre>{state.error?.message}</pre>
          </details>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    if (state.isLoading) {
      return loadingComponent || (
        <div style={{
          padding: '20px',
          border: '2px dashed #2196f3',
          borderRadius: '8px',
          backgroundColor: '#e3f2fd',
          textAlign: 'center',
          color: '#1976d2'
        }}>
          <div style={{ marginBottom: '10px' }}>🏝️ Loading Island: {name}</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            Strategy: {strategy} | Priority: {priority}
            {remoteModule && <div>Fetching SSR HTML...</div>}
          </div>
        </div>
      );
    }

    // If we have a remote module but no Component, it means we're using HTML injection
    if (remoteModule && !state.Component) {
      // Content will be injected via innerHTML, return empty
      return null;
    }

    if (remoteModule && state.Component) {
      const { Component } = state;
      return <Component {...props} />;
    }

    return children || fallback;
  };

  const getBoundaryStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      isolation: 'isolate'
    };

    // Visual debugging in development
    if (process.env.NODE_ENV === 'development') {
      return {
        ...baseStyles,
        outline: state.isHydrated 
          ? '2px solid #4caf50' 
          : '2px dashed #ff9800',
        outlineOffset: '2px'
      };
    }

    return baseStyles;
  };

  return (
    <div
      ref={boundaryRef}
      style={getBoundaryStyles()}
      data-island={name}
      data-hydration-strategy={strategy}
      data-priority={priority}
      data-remote-module={remoteModule}
      data-remote-name={remoteName}
      data-props={JSON.stringify(props)}
      data-hydrated={state.isHydrated}
      data-island-id={islandId.current}
    >
      {/* Development Tools */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '-25px',
          left: '0',
          fontSize: '11px',
          backgroundColor: state.isHydrated ? '#4caf50' : '#ff9800',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          🏝️ {name} {state.isHydrated ? '✅' : '⏳'} 
          {strategy === 'manual' && !state.isHydrated && (
            <button 
              onClick={manualHydrate}
              style={{
                marginLeft: '5px',
                fontSize: '10px',
                padding: '1px 3px',
                pointerEvents: 'auto'
              }}
            >
              Hydrate
            </button>
          )}
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

// Higher-order component for wrapping existing components as islands
export function withIslandBoundary<P extends object>(
  Component: React.ComponentType<P>,
  islandConfig: Omit<IslandBoundaryProps, 'children'>
) {
  return (props: P) => (
    <IslandBoundary {...islandConfig}>
      <Component {...props} />
    </IslandBoundary>
  );
}

// Hook for accessing island state within boundary
export function useIslandState(islandName?: string) {
  const [metadata, setMetadata] = useState<IslandMetadata | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!islandName) return;

    const islands = islandRegistry.getAllIslands();
    const island = islands.find(i => i.name === islandName);
    
    if (island) {
      setMetadata(island);
      setIsHydrated(!!island.hydrated);
    }

    // Set up polling for hydration status (could be optimized with events)
    const interval = setInterval(() => {
      const updatedIsland = islandRegistry.getIslandMetadata(island?.id || '');
      if (updatedIsland && updatedIsland.hydrated !== isHydrated) {
        setIsHydrated(!!updatedIsland.hydrated);
        setMetadata(updatedIsland);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [islandName, isHydrated]);

  return {
    metadata,
    isHydrated,
    manualHydrate: metadata ? () => islandRegistry.manualHydrate(metadata.id) : undefined
  };
}

export default IslandBoundary;