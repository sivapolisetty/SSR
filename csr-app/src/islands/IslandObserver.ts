interface ObserverConfig {
  rootMargin?: string;
  threshold?: number | number[];
  observeViewport?: boolean;
  observeUserIntent?: boolean;
  prefetchDistance?: string;
}

interface IslandObserverEntry {
  element: HTMLElement;
  islandId: string;
  islandName: string;
  strategy: string;
  priority: string;
  callback: (entry: IntersectionObserverEntry) => void;
  observerType: 'viewport' | 'prefetch' | 'intent';
}

export class IslandObserver {
  private viewportObserver: IntersectionObserver | null = null;
  private prefetchObserver: IntersectionObserver | null = null;
  private intentObserver: IntersectionObserver | null = null;
  private observedElements: Map<string, IslandObserverEntry> = new Map();
  private config: Required<ObserverConfig>;
  private performanceMetrics: Map<string, { observedAt: number; triggeredAt?: number; duration?: number }> = new Map();

  constructor(config: ObserverConfig = {}) {
    this.config = {
      rootMargin: '50px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
      observeViewport: true,
      observeUserIntent: true,
      prefetchDistance: '200px',
      ...config
    };

    this.initializeObservers();
  }

  private initializeObservers(): void {
    // Viewport observer for lazy hydration
    if (this.config.observeViewport && 'IntersectionObserver' in window) {
      this.viewportObserver = new IntersectionObserver(
        this.handleViewportIntersection.bind(this),
        {
          rootMargin: this.config.rootMargin,
          threshold: this.config.threshold
        }
      );
      console.log('🔭 Viewport observer initialized for island hydration');
    }

    // Prefetch observer for anticipatory loading
    if ('IntersectionObserver' in window) {
      this.prefetchObserver = new IntersectionObserver(
        this.handlePrefetchIntersection.bind(this),
        {
          rootMargin: this.config.prefetchDistance,
          threshold: 0
        }
      );
      console.log('🔮 Prefetch observer initialized for anticipatory loading');
    }

    // User intent observer for interaction-based hydration
    if (this.config.observeUserIntent && 'IntersectionObserver' in window) {
      this.intentObserver = new IntersectionObserver(
        this.handleIntentIntersection.bind(this),
        {
          rootMargin: '100px',
          threshold: 0.1
        }
      );
      console.log('🎯 Intent observer initialized for user interaction detection');
    }
  }

  observeIsland(
    element: HTMLElement,
    islandId: string,
    islandName: string,
    strategy: string,
    priority: string,
    callback: (entry: IntersectionObserverEntry) => void
  ): void {
    if (!element || this.observedElements.has(islandId)) {
      return;
    }

    console.log(`👁️ Observing island: ${islandName} (${strategy})`);

    const observerEntry: IslandObserverEntry = {
      element,
      islandId,
      islandName,
      strategy,
      priority,
      callback,
      observerType: this.getObserverType(strategy)
    };

    this.observedElements.set(islandId, observerEntry);
    this.startPerformanceTracking(islandId);

    // Choose appropriate observer based on strategy
    switch (strategy) {
      case 'lazy':
        this.viewportObserver?.observe(element);
        break;
      case 'interaction':
        this.intentObserver?.observe(element);
        this.setupInteractionListeners(element, islandId);
        break;
      case 'priority':
        // For priority strategy, use viewport observer with different settings
        this.viewportObserver?.observe(element);
        break;
      default:
        // Default to viewport observation
        this.viewportObserver?.observe(element);
        break;
    }

    // Always observe with prefetch observer for anticipatory loading
    this.prefetchObserver?.observe(element);
  }

  private getObserverType(strategy: string): 'viewport' | 'prefetch' | 'intent' {
    switch (strategy) {
      case 'interaction':
        return 'intent';
      case 'lazy':
      case 'priority':
        return 'viewport';
      default:
        return 'viewport';
    }
  }

  private handleViewportIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const islandEntry = this.findIslandEntry(entry.target as HTMLElement);
      if (!islandEntry) return;

      console.log(`👁️ Viewport intersection: ${islandEntry.islandName} - ${entry.intersectionRatio.toFixed(2)}`);

      // Trigger hydration when element becomes visible
      if (entry.isIntersecting) {
        this.triggerHydration(islandEntry, entry, 'viewport');
      }

      // Update element with intersection data
      this.updateElementVisibility(entry.target as HTMLElement, entry);
    });
  }

  private handlePrefetchIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const islandEntry = this.findIslandEntry(entry.target as HTMLElement);
      if (!islandEntry) return;

      if (entry.isIntersecting) {
        console.log(`🔮 Prefetch triggered: ${islandEntry.islandName}`);
        this.prefetchIslandResources(islandEntry);
      }
    });
  }

  private handleIntentIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const islandEntry = this.findIslandEntry(entry.target as HTMLElement);
      if (!islandEntry) return;

      if (entry.isIntersecting) {
        console.log(`🎯 User intent detected: ${islandEntry.islandName}`);
        // Set up more sensitive interaction detection
        this.setupSensitiveInteractionListeners(entry.target as HTMLElement, islandEntry.islandId);
      }
    });
  }

  private setupInteractionListeners(element: HTMLElement, islandId: string): void {
    const events = ['mouseenter', 'touchstart', 'focusin'];
    const islandEntry = this.observedElements.get(islandId);
    
    if (!islandEntry) return;

    const handleInteraction = (event: Event) => {
      console.log(`🖱️ Interaction detected on ${islandEntry.islandName}: ${event.type}`);
      this.triggerHydration(islandEntry, null, 'interaction');
      
      // Remove listeners after first interaction
      events.forEach(eventType => 
        element.removeEventListener(eventType, handleInteraction)
      );
    };

    events.forEach(eventType => 
      element.addEventListener(eventType, handleInteraction, { passive: true })
    );
  }

  private setupSensitiveInteractionListeners(element: HTMLElement, islandId: string): void {
    const sensitiveEvents = ['mousemove', 'scroll', 'touchmove'];
    const islandEntry = this.observedElements.get(islandId);
    
    if (!islandEntry) return;

    let interactionCount = 0;
    const threshold = 3; // Require multiple interactions

    const handleSensitiveInteraction = (event: Event) => {
      interactionCount++;
      
      if (interactionCount >= threshold) {
        console.log(`🎯 Strong user intent detected for ${islandEntry.islandName}`);
        this.triggerHydration(islandEntry, null, 'intent');
        
        // Remove listeners
        sensitiveEvents.forEach(eventType => 
          element.removeEventListener(eventType, handleSensitiveInteraction)
        );
      }
    };

    sensitiveEvents.forEach(eventType => 
      element.addEventListener(eventType, handleSensitiveInteraction, { passive: true })
    );

    // Auto-cleanup after 5 seconds
    setTimeout(() => {
      sensitiveEvents.forEach(eventType => 
        element.removeEventListener(eventType, handleSensitiveInteraction)
      );
    }, 5000);
  }

  private triggerHydration(
    islandEntry: IslandObserverEntry, 
    intersectionEntry: IntersectionObserverEntry | null,
    triggerType: string
  ): void {
    console.log(`🚀 Triggering hydration: ${islandEntry.islandName} (${triggerType})`);
    
    this.endPerformanceTracking(islandEntry.islandId, triggerType);
    
    // Call the hydration callback
    if (intersectionEntry) {
      islandEntry.callback(intersectionEntry);
    }
    
    // Stop observing this element
    this.unobserveIsland(islandEntry.islandId);
    
    // Update element state
    islandEntry.element.setAttribute('data-hydration-triggered', 'true');
    islandEntry.element.setAttribute('data-hydration-trigger', triggerType);
  }

  private prefetchIslandResources(islandEntry: IslandObserverEntry): void {
    // Extract remote module info from element
    const remoteModule = islandEntry.element.getAttribute('data-remote-module');
    const remoteName = islandEntry.element.getAttribute('data-remote-name');
    
    if (remoteModule && remoteName) {
      console.log(`🔮 Prefetching resources for: ${islandEntry.islandName}`);
      
      // Use link prefetch for anticipatory loading
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = remoteModule;
      link.as = 'script';
      document.head.appendChild(link);
      
      // Mark as prefetched
      islandEntry.element.setAttribute('data-prefetched', 'true');
    }
  }

  private updateElementVisibility(element: HTMLElement, entry: IntersectionObserverEntry): void {
    element.setAttribute('data-intersection-ratio', entry.intersectionRatio.toString());
    element.setAttribute('data-is-intersecting', entry.isIntersecting.toString());
    
    // Add visual debugging in development
    if (process.env.NODE_ENV === 'development') {
      const debugInfo = element.querySelector('.island-debug-info') as HTMLElement;
      if (debugInfo) {
        debugInfo.textContent = `Intersection: ${(entry.intersectionRatio * 100).toFixed(1)}%`;
        debugInfo.style.opacity = entry.isIntersecting ? '1' : '0.5';
      }
    }
  }

  private findIslandEntry(element: HTMLElement): IslandObserverEntry | undefined {
    // Find the island entry for this element
    for (const [, entry] of Array.from(this.observedElements.entries())) {
      if (entry.element === element || entry.element.contains(element)) {
        return entry;
      }
    }
    return undefined;
  }

  unobserveIsland(islandId: string): void {
    const entry = this.observedElements.get(islandId);
    if (entry) {
      console.log(`👁️‍🗨️ Stopping observation: ${entry.islandName}`);
      
      this.viewportObserver?.unobserve(entry.element);
      this.prefetchObserver?.unobserve(entry.element);
      this.intentObserver?.unobserve(entry.element);
      
      this.observedElements.delete(islandId);
    }
  }

  private startPerformanceTracking(islandId: string): void {
    this.performanceMetrics.set(islandId, {
      observedAt: performance.now()
    });
  }

  private endPerformanceTracking(islandId: string, triggerType: string): void {
    const metric = this.performanceMetrics.get(islandId);
    if (metric) {
      metric.triggeredAt = performance.now();
      metric.duration = metric.triggeredAt - metric.observedAt;
      
      console.log(`📊 Observation metrics for ${islandId}: ${metric.duration.toFixed(2)}ms (${triggerType})`);
    }
  }

  getObservationMetrics(): Array<{ islandId: string; duration?: number; observedAt: number; triggeredAt?: number }> {
    return Array.from(this.performanceMetrics.entries()).map(([islandId, metrics]) => ({
      islandId,
      ...metrics
    }));
  }

  getObservedIslands(): IslandObserverEntry[] {
    return Array.from(this.observedElements.values());
  }

  updateObserverConfig(newConfig: Partial<ObserverConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Observer config updated:', newConfig);
    
    // Reinitialize observers with new config
    this.cleanup();
    this.initializeObservers();
    
    // Re-observe existing elements
    const existingEntries = Array.from(this.observedElements.values());
    this.observedElements.clear();
    
    existingEntries.forEach(entry => {
      this.observeIsland(
        entry.element,
        entry.islandId,
        entry.islandName,
        entry.strategy,
        entry.priority,
        entry.callback
      );
    });
  }

  cleanup(): void {
    console.log('🧹 Cleaning up island observers');
    
    this.viewportObserver?.disconnect();
    this.prefetchObserver?.disconnect();
    this.intentObserver?.disconnect();
    
    this.observedElements.clear();
    this.performanceMetrics.clear();
  }
}

// Global singleton instance
export const islandObserver = new IslandObserver();

// Development tools
if (process.env.NODE_ENV === 'development') {
  // Expose observer to window for debugging
  (window as any).islandObserver = islandObserver;
  
  // Add visual debugging helpers
  const addDebugStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      [data-island] {
        position: relative;
      }
      
      [data-island]::before {
        content: '🏝️ ' attr(data-island);
        position: absolute;
        top: -20px;
        left: 0;
        font-size: 10px;
        background: #2196f3;
        color: white;
        padding: 2px 5px;
        border-radius: 3px;
        z-index: 10000;
        pointer-events: none;
      }
      
      [data-hydration-triggered="true"]::before {
        background: #4caf50;
        content: '✅ ' attr(data-island);
      }
      
      [data-prefetched="true"]::after {
        content: '🔮';
        position: absolute;
        top: -20px;
        right: 0;
        font-size: 12px;
        z-index: 10001;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDebugStyles);
  } else {
    addDebugStyles();
  }
}