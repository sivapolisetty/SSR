import React, { useState, useEffect, useRef } from 'react';
import { islandRegistry } from './IslandRegistry';
import { hydrationManager } from './HydrationManager';
import { islandObserver } from './IslandObserver';
import { islandCommunicationHub } from './IslandCommunication';

interface PerformanceMetric {
  islandId: string;
  islandName: string;
  strategy: string;
  priority: string;
  hydrationTime: number;
  observationTime?: number;
  loadTime?: number;
  interactionCount: number;
  errorCount: number;
  status: 'pending' | 'hydrating' | 'hydrated' | 'failed';
  firstContentfulPaint?: number;
  timeToInteractive?: number;
  memoryUsage?: number;
}

interface SystemMetrics {
  totalIslands: number;
  hydratedIslands: number;
  pendingIslands: number;
  failedIslands: number;
  averageHydrationTime: number;
  totalHydrationTime: number;
  memoryUsage: number;
  performanceScore: number;
}

export const IslandPerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalIslands: 0,
    hydratedIslands: 0,
    pendingIslands: 0,
    failedIslands: 0,
    averageHydrationTime: 0,
    totalHydrationTime: 0,
    memoryUsage: 0,
    performanceScore: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(updateMetrics, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  useEffect(() => {
    updateMetrics();
  }, []);

  const updateMetrics = () => {
    const allIslands = islandRegistry.getAllIslands();
    const observationMetrics = islandObserver.getObservationMetrics();
    const hydrationMetrics = hydrationManager.getMetrics();
    const queueStatus = hydrationManager.getQueueStatus();

    const newMetrics: PerformanceMetric[] = allIslands.map(island => {
      const observationMetric = observationMetrics.find(om => om.islandId === island.id);
      const registryMetric = islandRegistry.getMetrics(island.id);
      
      return {
        islandId: island.id,
        islandName: island.name,
        strategy: island.strategy,
        priority: island.priority,
        hydrationTime: registryMetric?.duration || 0,
        observationTime: observationMetric?.duration,
        loadTime: island.loadTime || 0,
        interactionCount: 0, // Would be tracked by communication hub
        errorCount: 0,
        status: island.hydrated ? 'hydrated' : 'pending',
        firstContentfulPaint: island.hydratedAt ? island.hydratedAt - (island.element?.dataset.observedAt ? parseInt(island.element.dataset.observedAt) : 0) : undefined,
        timeToInteractive: island.hydrated ? registryMetric?.duration : undefined,
        memoryUsage: getMemoryUsageEstimate(island.name)
      };
    });

    setMetrics(newMetrics);

    // Calculate system metrics
    const hydratedMetrics = newMetrics.filter(m => m.status === 'hydrated');
    const totalHydrationTime = hydratedMetrics.reduce((sum, m) => sum + m.hydrationTime, 0);
    const averageHydrationTime = hydratedMetrics.length > 0 ? totalHydrationTime / hydratedMetrics.length : 0;

    setSystemMetrics({
      totalIslands: allIslands.length,
      hydratedIslands: queueStatus.completed,
      pendingIslands: queueStatus.queued + queueStatus.active,
      failedIslands: queueStatus.failed,
      averageHydrationTime,
      totalHydrationTime,
      memoryUsage: getSystemMemoryUsage(),
      performanceScore: calculatePerformanceScore(newMetrics, averageHydrationTime)
    });
  };

  const getMemoryUsageEstimate = (islandName: string): number => {
    // Rough estimate based on component complexity
    const baseSizes = {
      'InteractiveDataTable': 150, // KB
      'WeatherWidget': 80,
      'ShoppingCart': 120,
      'default': 60
    };
    return baseSizes[islandName as keyof typeof baseSizes] || baseSizes.default;
  };

  const getSystemMemoryUsage = (): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  };

  const calculatePerformanceScore = (metrics: PerformanceMetric[], avgHydrationTime: number): number => {
    if (metrics.length === 0) return 100;

    let score = 100;
    
    // Deduct points for slow hydration
    if (avgHydrationTime > 100) score -= 20;
    if (avgHydrationTime > 200) score -= 20;
    if (avgHydrationTime > 500) score -= 30;
    
    // Deduct points for failed islands
    const failureRate = metrics.filter(m => m.status === 'failed').length / metrics.length;
    score -= failureRate * 40;
    
    // Deduct points for high memory usage
    if (systemMetrics.memoryUsage > 50) score -= 10;
    if (systemMetrics.memoryUsage > 100) score -= 20;
    
    return Math.max(0, Math.round(score));
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      pending: '#ff9800',
      hydrating: '#2196f3',
      hydrated: '#4caf50',
      failed: '#f44336'
    };
    return colors[status as keyof typeof colors] || '#9e9e9e';
  };

  const getPerformanceScoreColor = (score: number): string => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  const exportMetrics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      systemMetrics,
      islandMetrics: metrics,
      observationMetrics: islandObserver.getObservationMetrics(),
      hydrationMetrics: hydrationManager.getMetrics(),
      queueStatus: hydrationManager.getQueueStatus(),
      messageHistory: islandCommunicationHub.getMessageHistory().slice(-50)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `island-performance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <div
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: getPerformanceScoreColor(systemMetrics.performanceScore),
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 10000,
          fontWeight: 'bold',
          fontSize: '14px'
        }}
      >
        🏝️<br/>{systemMetrics.performanceScore}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '800px',
      maxHeight: '600px',
      backgroundColor: 'white',
      border: '2px solid #2196f3',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      zIndex: 10000,
      overflow: 'hidden',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        backgroundColor: '#2196f3',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>
          🏝️ Islands Performance Monitor
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh
          </label>
          <button
            onClick={exportMetrics}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid white',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
              {systemMetrics.totalIslands}
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>Total Islands</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: getPerformanceScoreColor(systemMetrics.performanceScore) 
            }}>
              {systemMetrics.performanceScore}
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>Performance Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
              {systemMetrics.averageHydrationTime.toFixed(1)}ms
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>Avg Hydration</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
              {systemMetrics.memoryUsage}MB
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>Memory Usage</div>
          </div>
        </div>

        <div style={{ 
          marginTop: '10px', 
          display: 'flex', 
          justifyContent: 'space-around',
          fontSize: '11px'
        }}>
          <span style={{ color: '#4caf50' }}>
            ✅ Hydrated: {systemMetrics.hydratedIslands}
          </span>
          <span style={{ color: '#ff9800' }}>
            ⏳ Pending: {systemMetrics.pendingIslands}
          </span>
          <span style={{ color: '#f44336' }}>
            ❌ Failed: {systemMetrics.failedIslands}
          </span>
        </div>
      </div>

      {/* Island Details */}
      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto',
        backgroundColor: 'white'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px' }}>Island</th>
              <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px' }}>Strategy</th>
              <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px' }}>Status</th>
              <th style={{ padding: '8px', textAlign: 'right', fontSize: '11px' }}>Hydration</th>
              <th style={{ padding: '8px', textAlign: 'right', fontSize: '11px' }}>Memory</th>
              <th style={{ padding: '8px', textAlign: 'right', fontSize: '11px' }}>TTI</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(metric => (
              <tr key={metric.islandId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold' }}>{metric.islandName}</div>
                  <div style={{ fontSize: '9px', color: '#666' }}>
                    {metric.priority} priority
                  </div>
                </td>
                <td style={{ padding: '8px', fontSize: '11px' }}>
                  {metric.strategy}
                </td>
                <td style={{ padding: '8px', fontSize: '11px' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    backgroundColor: getStatusColor(metric.status),
                    color: 'white',
                    fontSize: '9px'
                  }}>
                    {metric.status}
                  </span>
                </td>
                <td style={{ padding: '8px', textAlign: 'right', fontSize: '11px' }}>
                  {metric.hydrationTime > 0 ? `${metric.hydrationTime.toFixed(1)}ms` : '-'}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', fontSize: '11px' }}>
                  {metric.memoryUsage}KB
                </td>
                <td style={{ padding: '8px', textAlign: 'right', fontSize: '11px' }}>
                  {metric.timeToInteractive ? `${metric.timeToInteractive.toFixed(1)}ms` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '10px 15px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '10px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => {
            islandRegistry.cleanup();
            hydrationManager.cleanup();
            islandObserver.cleanup();
            updateMetrics();
          }}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🧹 Cleanup All
        </button>
        <button
          onClick={() => {
            hydrationManager.pauseHydration();
            updateMetrics();
          }}
          style={{
            background: '#ff9800',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          ⏸️ Pause Hydration
        </button>
        <button
          onClick={() => {
            hydrationManager.resumeHydration();
            updateMetrics();
          }}
          style={{
            background: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          ▶️ Resume Hydration
        </button>
        <button
          onClick={updateMetrics}
          style={{
            background: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

export default IslandPerformanceMonitor;