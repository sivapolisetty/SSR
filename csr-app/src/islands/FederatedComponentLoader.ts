import React from 'react';

// Federated Component Loader for Module Federation
declare global {
  interface Window {
    __webpack_init_sharing__: (scope: string) => Promise<void>;
    __webpack_share_scopes__: { default: any };
  }
}

interface FederatedModule {
  get: (module: string) => () => Promise<any>;
  init: (shared: any) => Promise<void>;
}

class FederatedComponentLoader {
  private loadedRemotes: Map<string, FederatedModule> = new Map();
  private remoteUrls: Map<string, string> = new Map();

  constructor() {
    // Map remote names to their URLs
    this.remoteUrls.set('ssr_app', 'http://localhost:3002/_next/static/chunks/remoteEntry.js');
  }

  async loadRemoteModule(remoteName: string, moduleName: string): Promise<any> {
    try {
      console.log(`🔗 Loading federated module: ${remoteName}/${moduleName}`);
      
      // Get the remote container
      const container = await this.getRemoteContainer(remoteName);
      
      // Initialize the container with shared modules
      await this.initializeContainer(container);
      
      // Get the specific module
      const factory = await container.get(`./${moduleName}`);
      const module = await factory();
      
      console.log(`✅ Successfully loaded federated module: ${remoteName}/${moduleName}`, module);
      
      // Return the default export or the module itself
      return module.default || module;
      
    } catch (error) {
      console.error(`❌ Failed to load federated module ${remoteName}/${moduleName}:`, error);
      
      // Fallback: try to create a mock component for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Creating fallback component for ${moduleName}`);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return this.createFallbackComponent(moduleName, errorMessage);
      }
      
      throw new Error(`Failed to load federated module: ${remoteName}/${moduleName}`);
    }
  }

  private async getRemoteContainer(remoteName: string): Promise<FederatedModule> {
    // Check if already loaded
    if (this.loadedRemotes.has(remoteName)) {
      return this.loadedRemotes.get(remoteName)!;
    }

    const remoteUrl = this.remoteUrls.get(remoteName);
    if (!remoteUrl) {
      throw new Error(`Remote URL not found for: ${remoteName}`);
    }

    // Load the remote entry script
    const container = await this.loadRemoteEntry(remoteName, remoteUrl);
    this.loadedRemotes.set(remoteName, container);
    
    return container;
  }

  private async loadRemoteEntry(remoteName: string, remoteUrl: string): Promise<FederatedModule> {
    return new Promise((resolve, reject) => {
      // Check if the remote is already available
      if ((window as any)[remoteName]) {
        resolve((window as any)[remoteName]);
        return;
      }

      // Create script element to load the remote entry
      const script = document.createElement('script');
      script.src = remoteUrl;
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => {
        // The remote container should now be available on the window object
        const container = (window as any)[remoteName];
        if (container) {
          resolve(container);
        } else {
          reject(new Error(`Remote container ${remoteName} not found after loading`));
        }
      };

      script.onerror = (error) => {
        reject(new Error(`Failed to load remote entry: ${remoteUrl}`));
      };

      document.head.appendChild(script);
    });
  }

  private async initializeContainer(container: FederatedModule): Promise<void> {
    try {
      // Initialize webpack sharing
      if (typeof (window as any).__webpack_init_sharing__ === 'function') {
        if (!window.__webpack_share_scopes__) {
          await (window as any).__webpack_init_sharing__('default');
        }
        // Initialize the container with shared dependencies
        await container.init(window.__webpack_share_scopes__.default);
      } else {
        // Fallback initialization without sharing
        console.log('🔧 Webpack sharing not available, initializing container without shared scope');
        await container.init({});
      }
      
    } catch (error) {
      console.warn('Container initialization failed, trying fallback:', error);
      // Try fallback initialization
      try {
        await container.init({});
      } catch (fallbackError) {
        console.warn('Fallback initialization also failed, but continuing:', fallbackError);
      }
    }
  }

  // Method to preload a remote container
  async preloadRemote(remoteName: string): Promise<void> {
    try {
      await this.getRemoteContainer(remoteName);
      console.log(`🔮 Preloaded remote: ${remoteName}`);
    } catch (error) {
      console.warn(`Failed to preload remote ${remoteName}:`, error);
    }
  }

  // Method to check if a remote is available
  isRemoteLoaded(remoteName: string): boolean {
    return this.loadedRemotes.has(remoteName) || !!(window as any)[remoteName];
  }

  // Method to get available remotes
  getAvailableRemotes(): string[] {
    return Array.from(this.remoteUrls.keys());
  }

  // Method to add a new remote URL mapping
  addRemote(remoteName: string, remoteUrl: string): void {
    this.remoteUrls.set(remoteName, remoteUrl);
  }

  // Create a fallback component for development
  private createFallbackComponent(componentName: string, errorMessage: string): any {
    const FallbackComponent = (props: any) => {
      return React.createElement('div', {
        style: {
          padding: '20px',
          border: '2px dashed #ff9800',
          borderRadius: '8px',
          backgroundColor: '#fff3e0',
          color: '#ef6c00',
          textAlign: 'center',
          margin: '20px'
        }
      }, [
        React.createElement('h3', { key: 'title' }, `🔧 Fallback: ${componentName}`),
        React.createElement('p', { key: 'message' }, 'This is a fallback component shown when the federated module fails to load.'),
        React.createElement('details', { key: 'details' }, [
          React.createElement('summary', { key: 'summary' }, 'Error Details'),
          React.createElement('pre', { key: 'error', style: { fontSize: '12px', textAlign: 'left' } }, errorMessage)
        ]),
        React.createElement('p', { key: 'help', style: { fontSize: '12px' } }, 
          'Make sure the SSR app is running on port 3002 and Module Federation is properly configured.')
      ]);
    };
    
    return FallbackComponent;
  }

  // Cleanup method
  cleanup(): void {
    this.loadedRemotes.clear();
    console.log('🧹 Federated component loader cleaned up');
  }
}

// Global singleton instance
export const federatedLoader = new FederatedComponentLoader();

// Helper function for React components
export async function loadFederatedComponent(remoteName: string, componentName: string): Promise<React.ComponentType<any>> {
  const module = await federatedLoader.loadRemoteModule(remoteName, componentName);
  return module.default || module;
}

// Development helpers
if (process.env.NODE_ENV === 'development') {
  (window as any).federatedLoader = federatedLoader;
}