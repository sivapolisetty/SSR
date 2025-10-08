// Islands Architecture Core
export { islandRegistry } from './IslandRegistry';
export { hydrationManager } from './HydrationManager';
export { islandObserver } from './IslandObserver';
export { islandCommunicationHub, useIslandCommunication } from './IslandCommunication';

// Components
export { default as IslandBoundary, withIslandBoundary, useIslandState } from './IslandBoundary';
export { default as IslandPerformanceMonitor } from './IslandPerformanceMonitor';

// Types
export type { 
  HydrationStrategy, 
  HydrationPriority, 
  IslandMetadata, 
  IslandComponent 
} from './IslandRegistry';

// Utilities
export { discoverIslands } from './IslandRegistry';

// Auto-initialize islands on import
import { discoverIslands } from './IslandRegistry';

// Initialize discovery when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', discoverIslands);
  } else {
    discoverIslands();
  }
}