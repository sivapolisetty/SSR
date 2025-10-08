import { federatedLoader } from './FederatedComponentLoader';

export type HydrationStrategy = 
  | 'immediate'      // Hydrate immediately when detected
  | 'lazy'          // Hydrate when entering viewport
  | 'idle'          // Hydrate when browser is idle
  | 'interaction'   // Hydrate on first user interaction
  | 'priority'      // Hydrate based on priority level
  | 'manual';       // Hydrate only when explicitly called

export type HydrationPriority = 'critical' | 'high' | 'normal' | 'low';

export interface IslandMetadata {
  id: string;
  name: string;
  strategy: HydrationStrategy;
  priority: HydrationPriority;
  dependencies?: string[];
  props?: Record<string, any>;
  element?: HTMLElement;
  hydrated?: boolean;
  hydratedAt?: number;
  loadTime?: number;
  errorBoundary?: boolean;
  remoteModule?: string;
  remoteName?: string;
}

export interface IslandComponent {
  Component: React.ComponentType<any>;
  metadata: IslandMetadata;
  loader?: () => Promise<{ default: React.ComponentType<any> }>;
}

class IslandRegistry {
  private islands: Map<string, IslandComponent> = new Map();
  private hydrationQueue: Map<string, IslandMetadata> = new Map();
  private observers: Map<string, IntersectionObserver> = new Map();
  private hydrationCallbacks: Map<string, (metadata: IslandMetadata) => void> = new Map();
  private performanceMetrics: Map<string, { start: number; end?: number; duration?: number }> = new Map();

  register(island: IslandComponent): void {
    console.log(`🏝️ Registering island: ${island.metadata.name}`);
    this.islands.set(island.metadata.id, island);
    
    // Auto-discover islands in DOM if element is provided
    if (island.metadata.element) {
      this.queueHydration(island.metadata);
    }
  }

  registerRemoteIsland(metadata: IslandMetadata): void {
    console.log(`🌐 Registering remote island: ${metadata.name} from ${metadata.remoteModule}`);
    
    const island: IslandComponent = {
      Component: () => null, // Will be loaded dynamically
      metadata,
      loader: async () => {
        if (!metadata.remoteModule || !metadata.remoteName) {
          throw new Error(`Remote module info missing for island ${metadata.name}`);
        }
        
        // Load federated module using proper Module Federation loader
        const module = await federatedLoader.loadRemoteModule(metadata.remoteModule, metadata.remoteName);
        return module;
      }
    };
    
    this.islands.set(metadata.id, island);
    this.queueHydration(metadata);
  }

  queueHydration(metadata: IslandMetadata): void {
    if (metadata.hydrated) {
      console.log(`⚡ Island ${metadata.name} already hydrated, skipping`);
      return;
    }

    console.log(`📋 Queuing hydration for island: ${metadata.name} (${metadata.strategy})`);
    this.hydrationQueue.set(metadata.id, metadata);
    this.startPerformanceTracking(metadata.id);

    switch (metadata.strategy) {
      case 'immediate':
        this.hydrateImmediate(metadata);
        break;
      case 'lazy':
        this.setupLazyHydration(metadata);
        break;
      case 'idle':
        this.hydrateWhenIdle(metadata);
        break;
      case 'interaction':
        this.setupInteractionHydration(metadata);
        break;
      case 'priority':
        this.hydrateBySRankStrategyPriority(metadata);
        break;
      case 'manual':
        // Do nothing, wait for manual trigger
        break;
    }
  }

  private async hydrateImmediate(metadata: IslandMetadata): Promise<void> {
    console.log(`🚀 Immediate hydration: ${metadata.name}`);
    await this.performHydration(metadata);
  }

  private setupLazyHydration(metadata: IslandMetadata): void {
    if (!metadata.element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !metadata.hydrated) {
            console.log(`👁️ Lazy hydration triggered: ${metadata.name}`);
            this.performHydration(metadata);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(metadata.element);
    this.observers.set(metadata.id, observer);
  }

  private hydrateWhenIdle(metadata: IslandMetadata): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        console.log(`😴 Idle hydration: ${metadata.name}`);
        this.performHydration(metadata);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        console.log(`😴 Idle hydration (fallback): ${metadata.name}`);
        this.performHydration(metadata);
      }, 100);
    }
  }

  private setupInteractionHydration(metadata: IslandMetadata): void {
    if (!metadata.element) return;

    const events = ['click', 'touchstart', 'keydown', 'mouseenter'];
    const hydrate = () => {
      console.log(`🖱️ Interaction hydration: ${metadata.name}`);
      this.performHydration(metadata);
      events.forEach(event => 
        metadata.element?.removeEventListener(event, hydrate)
      );
    };

    events.forEach(event => 
      metadata.element?.addEventListener(event, hydrate, { once: true })
    );
  }

  private hydrateBySRankStrategyPriority(metadata: IslandMetadata): void {
    const priorityDelays = {
      critical: 0,
      high: 50,
      normal: 200,
      low: 1000
    };

    setTimeout(() => {
      console.log(`⭐ Priority hydration (${metadata.priority}): ${metadata.name}`);
      this.performHydration(metadata);
    }, priorityDelays[metadata.priority]);
  }

  private async performHydration(metadata: IslandMetadata): Promise<void> {
    try {
      const island = this.islands.get(metadata.id);
      if (!island || metadata.hydrated) return;

      console.log(`💧 Hydrating island: ${metadata.name}`);
      
      // Load component if it's a remote module
      if (island.loader) {
        const loadedModule = await island.loader();
        island.Component = loadedModule.default;
      }

      // Simulate hydration process
      await new Promise(resolve => setTimeout(resolve, 10));

      // Mark as hydrated
      metadata.hydrated = true;
      metadata.hydratedAt = Date.now();
      
      this.endPerformanceTracking(metadata.id);
      
      // Trigger callback if registered
      const callback = this.hydrationCallbacks.get(metadata.id);
      if (callback) {
        callback(metadata);
      }

      console.log(`✅ Island hydrated: ${metadata.name} (${this.getMetrics(metadata.id)?.duration}ms)`);
      
    } catch (error) {
      console.error(`❌ Hydration failed for island ${metadata.name}:`, error);
      this.endPerformanceTracking(metadata.id, true);
    }
  }

  onHydrated(islandId: string, callback: (metadata: IslandMetadata) => void): void {
    this.hydrationCallbacks.set(islandId, callback);
  }

  manualHydrate(islandId: string): Promise<void> {
    const metadata = this.hydrationQueue.get(islandId);
    if (!metadata) {
      console.warn(`⚠️ Island ${islandId} not found in hydration queue`);
      return Promise.resolve();
    }
    
    console.log(`🤚 Manual hydration triggered: ${metadata.name}`);
    return this.performHydration(metadata);
  }

  getIslandMetadata(islandId: string): IslandMetadata | undefined {
    return this.hydrationQueue.get(islandId);
  }

  getAllIslands(): IslandMetadata[] {
    return Array.from(this.hydrationQueue.values());
  }

  getHydratedIslands(): IslandMetadata[] {
    return Array.from(this.hydrationQueue.values()).filter(island => island.hydrated);
  }

  getPendingIslands(): IslandMetadata[] {
    return Array.from(this.hydrationQueue.values()).filter(island => !island.hydrated);
  }

  private startPerformanceTracking(islandId: string): void {
    this.performanceMetrics.set(islandId, { start: performance.now() });
  }

  private endPerformanceTracking(islandId: string, error = false): void {
    const metric = this.performanceMetrics.get(islandId);
    if (metric) {
      metric.end = performance.now();
      metric.duration = metric.end - metric.start;
      
      if (!error) {
        console.log(`📊 Hydration metrics for ${islandId}: ${metric.duration.toFixed(2)}ms`);
      }
    }
  }

  getMetrics(islandId: string) {
    return this.performanceMetrics.get(islandId);
  }

  getAllMetrics() {
    return Array.from(this.performanceMetrics.entries()).map(([id, metrics]) => ({
      islandId: id,
      ...metrics
    }));
  }

  cleanup(): void {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Clear callbacks
    this.hydrationCallbacks.clear();
    
    console.log('🧹 Island registry cleaned up');
  }
}

// Global singleton instance
export const islandRegistry = new IslandRegistry();

// Helper function to auto-discover islands in DOM
export function discoverIslands(): void {
  const islandElements = document.querySelectorAll('[data-island]');
  
  islandElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const islandName = htmlElement.dataset.island;
    const strategy = (htmlElement.dataset.hydrationStrategy as HydrationStrategy) || 'lazy';
    const priority = (htmlElement.dataset.priority as HydrationPriority) || 'normal';
    const remoteModule = htmlElement.dataset.remoteModule;
    const remoteName = htmlElement.dataset.remoteName;
    
    if (!islandName) return;
    
    const metadata: IslandMetadata = {
      id: `${islandName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: islandName,
      strategy,
      priority,
      element: htmlElement,
      remoteModule,
      remoteName,
      props: htmlElement.dataset.props ? JSON.parse(htmlElement.dataset.props) : {}
    };
    
    if (remoteModule && remoteName) {
      islandRegistry.registerRemoteIsland(metadata);
    } else {
      console.warn(`⚠️ Island ${islandName} found but no remote module info provided`);
    }
  });
}

// Auto-discover islands when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', discoverIslands);
  } else {
    discoverIslands();
  }
}