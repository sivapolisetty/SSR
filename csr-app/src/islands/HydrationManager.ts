import { islandRegistry, IslandMetadata, HydrationStrategy, HydrationPriority } from './IslandRegistry';

interface HydrationTask {
  metadata: IslandMetadata;
  scheduledAt: number;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
  maxRetries: number;
  timeout?: number;
}

interface HydrationSchedulerConfig {
  maxConcurrentHydrations: number;
  priorityWeights: Record<HydrationPriority, number>;
  strategyTimeouts: Record<HydrationStrategy, number>;
  retryDelays: number[];
  performanceBudget: {
    maxHydrationTime: number;
    maxTotalTime: number;
    cpuThreshold: number;
  };
}

interface PerformanceMetrics {
  totalHydrations: number;
  successfulHydrations: number;
  failedHydrations: number;
  averageHydrationTime: number;
  slowestHydration: { islandName: string; duration: number };
  fastestHydration: { islandName: string; duration: number };
  hydrationsByStrategy: Record<HydrationStrategy, number>;
  hydrationsByPriority: Record<HydrationPriority, number>;
}

export class HydrationManager {
  private config: HydrationSchedulerConfig;
  private taskQueue: Map<string, HydrationTask> = new Map();
  private activeTasks: Map<string, HydrationTask> = new Map();
  private completedTasks: Map<string, HydrationTask> = new Map();
  private failedTasks: Map<string, HydrationTask> = new Map();
  private isProcessing = false;
  private performanceObserver?: PerformanceObserver;
  private mainThreadBusy = false;

  constructor(config?: Partial<HydrationSchedulerConfig>) {
    this.config = {
      maxConcurrentHydrations: 3,
      priorityWeights: {
        critical: 1000,
        high: 500,
        normal: 100,
        low: 10
      },
      strategyTimeouts: {
        immediate: 0,
        lazy: 5000,
        idle: 10000,
        interaction: 30000,
        priority: 2000,
        manual: Infinity
      },
      retryDelays: [100, 500, 1000, 2000],
      performanceBudget: {
        maxHydrationTime: 100,
        maxTotalTime: 5000,
        cpuThreshold: 80
      },
      ...config
    };

    this.setupPerformanceMonitoring();
    this.startProcessingLoop();
  }

  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure' && entry.name.startsWith('island-hydration-')) {
            const islandId = entry.name.replace('island-hydration-', '');
            const task = this.activeTasks.get(islandId) || this.completedTasks.get(islandId);
            
            if (task && entry.duration > this.config.performanceBudget.maxHydrationTime) {
              console.warn(`⚠️ Slow hydration detected: ${task.metadata.name} took ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }

    // Monitor main thread CPU usage
    this.monitorMainThread();
  }

  private monitorMainThread(): void {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const checkCPU = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      frameCount++;
      
      if (deltaTime >= 1000) {
        const fps = frameCount / (deltaTime / 1000);
        this.mainThreadBusy = fps < 50; // Consider busy if FPS drops below 50
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(checkCPU);
    };
    
    requestAnimationFrame(checkCPU);
  }

  scheduleHydration(metadata: IslandMetadata): void {
    if (this.taskQueue.has(metadata.id) || this.activeTasks.has(metadata.id)) {
      console.log(`📝 Island ${metadata.name} already scheduled or processing`);
      return;
    }

    const task: HydrationTask = {
      metadata,
      scheduledAt: performance.now(),
      retryCount: 0,
      maxRetries: 3
    };

    this.taskQueue.set(metadata.id, task);
    console.log(`📅 Scheduled hydration: ${metadata.name} (${metadata.strategy}/${metadata.priority})`);
    
    // Immediate processing for critical items
    if (metadata.priority === 'critical' || metadata.strategy === 'immediate') {
      this.processQueue();
    }
  }

  private startProcessingLoop(): void {
    const processLoop = () => {
      if (!this.isProcessing && this.taskQueue.size > 0) {
        this.processQueue();
      }
      
      // Check for timeouts
      this.checkTimeouts();
      
      // Schedule next check
      setTimeout(processLoop, 50);
    };
    
    processLoop();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.activeTasks.size >= this.config.maxConcurrentHydrations) {
      return;
    }

    this.isProcessing = true;

    try {
      // Sort tasks by priority and strategy
      const sortedTasks = Array.from(this.taskQueue.values())
        .sort((a, b) => this.calculateTaskPriority(b) - this.calculateTaskPriority(a));

      for (const task of sortedTasks) {
        if (this.activeTasks.size >= this.config.maxConcurrentHydrations) {
          break;
        }

        // Check if we should defer due to main thread being busy
        if (this.shouldDeferHydration(task)) {
          continue;
        }

        await this.executeHydration(task);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private calculateTaskPriority(task: HydrationTask): number {
    const priorityWeight = this.config.priorityWeights[task.metadata.priority];
    const ageBonus = (performance.now() - task.scheduledAt) / 1000; // Age in seconds
    const strategyMultiplier = this.getStrategyMultiplier(task.metadata.strategy);
    
    return priorityWeight + ageBonus + strategyMultiplier;
  }

  private getStrategyMultiplier(strategy: HydrationStrategy): number {
    const multipliers = {
      immediate: 1000,
      critical: 800,
      interaction: 600,
      priority: 400,
      lazy: 200,
      idle: 100,
      manual: 0
    };
    
    return multipliers[strategy] || 0;
  }

  private shouldDeferHydration(task: HydrationTask): boolean {
    // Defer non-critical hydrations if main thread is busy
    if (this.mainThreadBusy && task.metadata.priority !== 'critical') {
      console.log(`⏸️ Deferring ${task.metadata.name} due to busy main thread`);
      return true;
    }

    // Defer if approaching performance budget
    const totalTime = performance.now() - (this.getEarliestActiveTask()?.startedAt || performance.now());
    if (totalTime > this.config.performanceBudget.maxTotalTime * 0.8) {
      console.log(`⏸️ Deferring ${task.metadata.name} due to performance budget`);
      return true;
    }

    return false;
  }

  private async executeHydration(task: HydrationTask): Promise<void> {
    this.taskQueue.delete(task.metadata.id);
    this.activeTasks.set(task.metadata.id, task);
    
    task.startedAt = performance.now();
    
    console.log(`🚀 Starting hydration: ${task.metadata.name}`);
    
    // Start performance measurement
    if ('performance' in window) {
      performance.mark(`island-hydration-start-${task.metadata.id}`);
    }

    try {
      // Execute the actual hydration through the registry
      await islandRegistry.manualHydrate(task.metadata.id);
      
      task.completedAt = performance.now();
      this.activeTasks.delete(task.metadata.id);
      this.completedTasks.set(task.metadata.id, task);
      
      // End performance measurement
      if ('performance' in window) {
        performance.mark(`island-hydration-end-${task.metadata.id}`);
        performance.measure(
          `island-hydration-${task.metadata.id}`,
          `island-hydration-start-${task.metadata.id}`,
          `island-hydration-end-${task.metadata.id}`
        );
      }
      
      const duration = task.completedAt - task.startedAt;
      console.log(`✅ Hydration completed: ${task.metadata.name} (${duration.toFixed(2)}ms)`);
      
    } catch (error) {
      console.error(`❌ Hydration failed: ${task.metadata.name}`, error);
      
      task.retryCount++;
      this.activeTasks.delete(task.metadata.id);
      
      if (task.retryCount <= task.maxRetries) {
        const delay = this.config.retryDelays[Math.min(task.retryCount - 1, this.config.retryDelays.length - 1)];
        
        console.log(`🔄 Retrying ${task.metadata.name} in ${delay}ms (attempt ${task.retryCount}/${task.maxRetries})`);
        
        setTimeout(() => {
          this.taskQueue.set(task.metadata.id, task);
        }, delay);
      } else {
        console.error(`💀 Hydration permanently failed: ${task.metadata.name}`);
        this.failedTasks.set(task.metadata.id, task);
      }
    }
  }

  private checkTimeouts(): void {
    const now = performance.now();
    
    this.activeTasks.forEach((task, id) => {
      const timeout = this.config.strategyTimeouts[task.metadata.strategy];
      const elapsed = now - (task.startedAt || task.scheduledAt);
      
      if (timeout !== Infinity && elapsed > timeout) {
        console.warn(`⏰ Hydration timeout: ${task.metadata.name} (${elapsed.toFixed(2)}ms)`);
        this.activeTasks.delete(id);
        this.failedTasks.set(id, task);
      }
    });
  }

  private getEarliestActiveTask(): HydrationTask | undefined {
    let earliest: HydrationTask | undefined;
    
    this.activeTasks.forEach(task => {
      if (!earliest || (task.startedAt && task.startedAt < (earliest.startedAt || Infinity))) {
        earliest = task;
      }
    });
    
    return earliest;
  }

  // Public API methods
  public getMetrics(): PerformanceMetrics {
    const allTasks = [
      ...Array.from(this.completedTasks.values()),
      ...Array.from(this.failedTasks.values())
    ];

    const durations = allTasks
      .filter(task => task.startedAt && task.completedAt)
      .map(task => task.completedAt! - task.startedAt!);

    const successfulTasks = Array.from(this.completedTasks.values());
    
    return {
      totalHydrations: allTasks.length,
      successfulHydrations: successfulTasks.length,
      failedHydrations: this.failedTasks.size,
      averageHydrationTime: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      slowestHydration: this.getSlowestHydration(successfulTasks),
      fastestHydration: this.getFastestHydration(successfulTasks),
      hydrationsByStrategy: this.getHydrationsByStrategy(allTasks),
      hydrationsByPriority: this.getHydrationsByPriority(allTasks)
    };
  }

  private getSlowestHydration(tasks: HydrationTask[]) {
    return tasks.reduce((slowest, task) => {
      if (!task.startedAt || !task.completedAt) return slowest;
      const duration = task.completedAt - task.startedAt;
      return duration > slowest.duration 
        ? { islandName: task.metadata.name, duration }
        : slowest;
    }, { islandName: '', duration: 0 });
  }

  private getFastestHydration(tasks: HydrationTask[]) {
    return tasks.reduce((fastest, task) => {
      if (!task.startedAt || !task.completedAt) return fastest;
      const duration = task.completedAt - task.startedAt;
      return !fastest.islandName || duration < fastest.duration
        ? { islandName: task.metadata.name, duration }
        : fastest;
    }, { islandName: '', duration: 0 });
  }

  private getHydrationsByStrategy(tasks: HydrationTask[]): Record<HydrationStrategy, number> {
    const counts: Record<HydrationStrategy, number> = {
      immediate: 0, lazy: 0, idle: 0, interaction: 0, priority: 0, manual: 0
    };
    
    tasks.forEach(task => {
      counts[task.metadata.strategy]++;
    });
    
    return counts;
  }

  private getHydrationsByPriority(tasks: HydrationTask[]): Record<HydrationPriority, number> {
    const counts: Record<HydrationPriority, number> = {
      critical: 0, high: 0, normal: 0, low: 0
    };
    
    tasks.forEach(task => {
      counts[task.metadata.priority]++;
    });
    
    return counts;
  }

  public getQueueStatus() {
    return {
      queued: this.taskQueue.size,
      active: this.activeTasks.size,
      completed: this.completedTasks.size,
      failed: this.failedTasks.size,
      mainThreadBusy: this.mainThreadBusy
    };
  }

  public pauseHydration(): void {
    this.isProcessing = true;
    console.log('⏸️ Hydration paused');
  }

  public resumeHydration(): void {
    this.isProcessing = false;
    console.log('▶️ Hydration resumed');
    this.processQueue();
  }

  public cancelHydration(islandId: string): boolean {
    if (this.taskQueue.has(islandId)) {
      this.taskQueue.delete(islandId);
      console.log(`🚫 Cancelled queued hydration: ${islandId}`);
      return true;
    }
    return false;
  }

  public cleanup(): void {
    this.performanceObserver?.disconnect();
    this.taskQueue.clear();
    this.activeTasks.clear();
    console.log('🧹 Hydration manager cleaned up');
  }
}

// Global singleton instance
export const hydrationManager = new HydrationManager();

// Integration with island registry
islandRegistry.onHydrated = (islandId: string, callback: (metadata: any) => void) => {
  const originalCallback = callback;
  const wrappedCallback = (metadata: any) => {
    hydrationManager.scheduleHydration(metadata);
    originalCallback(metadata);
  };
  
  // Store the callback for the registry to use
  (islandRegistry as any)._callbacks = (islandRegistry as any)._callbacks || new Map();
  (islandRegistry as any)._callbacks.set(islandId, wrappedCallback);
};