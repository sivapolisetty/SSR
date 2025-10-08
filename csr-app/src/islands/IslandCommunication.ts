import React from 'react';

interface IslandMessage {
  id: string;
  type: string;
  source: string;
  target?: string;
  data: any;
  timestamp: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

interface IslandState {
  islandId: string;
  name: string;
  state: any;
  lastUpdated: number;
  version: number;
  dependencies: string[];
}

interface IslandSubscription {
  islandId: string;
  eventType: string;
  callback: (message: IslandMessage) => void;
  once?: boolean;
}

type MessageHandler = (message: IslandMessage) => void | Promise<void>;

export class IslandCommunicationHub {
  private messageQueue: IslandMessage[] = [];
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private islandStates: Map<string, IslandState> = new Map();
  private subscriptions: Map<string, IslandSubscription[]> = new Map();
  private messageHistory: IslandMessage[] = [];
  private maxHistorySize = 100;
  private isProcessing = false;

  constructor() {
    this.setupGlobalMessageListener();
    this.startMessageProcessor();
  }

  private setupGlobalMessageListener(): void {
    // Listen for messages from parent window (CSR app)
    window.addEventListener('message', (event) => {
      if (event.data && typeof event.data === 'object' && event.data.type) {
        this.receiveMessage(event.data);
      }
    });

    // Listen for messages from child iframes (SSR islands)
    window.addEventListener('message', (event) => {
      if (event.source !== window && event.data && event.data.source) {
        this.receiveMessage(event.data);
      }
    });
  }

  sendMessage(message: Omit<IslandMessage, 'id' | 'timestamp'>): void {
    const fullMessage: IslandMessage = {
      id: this.generateMessageId(),
      timestamp: Date.now(),
      priority: 'normal',
      ...message
    };

    console.log(`📨 Sending message: ${fullMessage.type} from ${fullMessage.source}`, fullMessage);

    this.messageQueue.push(fullMessage);
    this.addToHistory(fullMessage);

    // Send to specific target or broadcast
    if (fullMessage.target) {
      this.sendToTarget(fullMessage);
    } else {
      this.broadcast(fullMessage);
    }
  }

  private sendToTarget(message: IslandMessage): void {
    // Find target island and send message
    const targetHandlers = this.messageHandlers.get(message.target!);
    if (targetHandlers) {
      targetHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in message handler for ${message.target}:`, error);
        }
      });
    }

    // Also send via postMessage for cross-frame communication
    this.postMessageToFrames(message);
  }

  private broadcast(message: IslandMessage): void {
    // Send to all registered handlers
    this.messageHandlers.forEach((handlers, islandId) => {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in message handler for ${islandId}:`, error);
        }
      });
    });

    // Send to parent window
    if (window.parent !== window) {
      window.parent.postMessage(message, '*');
    }

    // Send to child frames
    this.postMessageToFrames(message);
  }

  private postMessageToFrames(message: IslandMessage): void {
    // Send to all iframe elements
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow?.postMessage(message, '*');
      } catch (error) {
        // Cross-origin iframe, can't send message
        console.warn('Cannot send message to cross-origin iframe');
      }
    });
  }

  receiveMessage(message: IslandMessage): void {
    console.log(`📬 Received message: ${message.type} from ${message.source}`, message);

    this.addToHistory(message);

    // Trigger subscriptions
    this.triggerSubscriptions(message);

    // Process message based on type
    this.processMessage(message);
  }

  private processMessage(message: IslandMessage): void {
    switch (message.type) {
      case 'ISLAND_STATE_UPDATE':
        this.handleStateUpdate(message);
        break;
      case 'ISLAND_STATE_REQUEST':
        this.handleStateRequest(message);
        break;
      case 'ISLAND_HYDRATED':
        this.handleIslandHydrated(message);
        break;
      case 'ISLAND_ERROR':
        this.handleIslandError(message);
        break;
      case 'ISLAND_INTERACTION':
        this.handleIslandInteraction(message);
        break;
      default:
        // Generic message, just propagate to handlers
        this.triggerHandlers(message);
        break;
    }
  }

  private handleStateUpdate(message: IslandMessage): void {
    const { islandId, state, dependencies } = message.data;
    
    const currentState = this.islandStates.get(islandId);
    const newState: IslandState = {
      islandId,
      name: message.source,
      state,
      lastUpdated: Date.now(),
      version: currentState ? currentState.version + 1 : 1,
      dependencies: dependencies || []
    };

    this.islandStates.set(islandId, newState);
    
    console.log(`🔄 State updated for island ${islandId}:`, newState);

    // Notify dependent islands
    this.notifyDependentIslands(islandId, newState);
  }

  private handleStateRequest(message: IslandMessage): void {
    const { requestedIslandId } = message.data;
    const state = this.islandStates.get(requestedIslandId);
    
    if (state) {
      this.sendMessage({
        type: 'ISLAND_STATE_RESPONSE',
        source: 'CommunicationHub',
        target: message.source,
        data: { islandId: requestedIslandId, state: state.state }
      });
    } else {
      this.sendMessage({
        type: 'ISLAND_STATE_NOT_FOUND',
        source: 'CommunicationHub',
        target: message.source,
        data: { requestedIslandId }
      });
    }
  }

  private handleIslandHydrated(message: IslandMessage): void {
    console.log(`✅ Island hydrated: ${message.source}`);
    
    // Broadcast hydration event
    this.sendMessage({
      type: 'ISLAND_LIFECYCLE',
      source: 'CommunicationHub',
      data: {
        action: 'hydrated',
        islandId: message.data.islandId,
        islandName: message.source,
        timestamp: Date.now()
      }
    });
  }

  private handleIslandError(message: IslandMessage): void {
    console.error(`❌ Island error from ${message.source}:`, message.data);
    
    // Broadcast error for error boundaries and monitoring
    this.sendMessage({
      type: 'ISLAND_LIFECYCLE',
      source: 'CommunicationHub',
      data: {
        action: 'error',
        islandId: message.data.islandId,
        islandName: message.source,
        error: message.data.error,
        timestamp: Date.now()
      }
    });
  }

  private handleIslandInteraction(message: IslandMessage): void {
    console.log(`🖱️ Island interaction from ${message.source}:`, message.data);
    
    // Track interaction for analytics
    this.sendMessage({
      type: 'ISLAND_ANALYTICS',
      source: 'CommunicationHub',
      data: {
        action: 'interaction',
        islandName: message.source,
        interaction: message.data,
        timestamp: Date.now()
      }
    });
  }

  private notifyDependentIslands(islandId: string, newState: IslandState): void {
    // Find islands that depend on this one
    const dependentIslands = Array.from(this.islandStates.values())
      .filter(state => state.dependencies.includes(islandId));

    dependentIslands.forEach(dependentState => {
      this.sendMessage({
        type: 'DEPENDENCY_STATE_CHANGED',
        source: 'CommunicationHub',
        target: dependentState.islandId,
        data: {
          changedIslandId: islandId,
          newState: newState.state
        }
      });
    });
  }

  private triggerHandlers(message: IslandMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(async handler => {
        try {
          await handler(message);
        } catch (error) {
          console.error(`Error in message handler for ${message.type}:`, error);
        }
      });
    }
  }

  private triggerSubscriptions(message: IslandMessage): void {
    const subscriptions = this.subscriptions.get(message.type) || [];
    
    subscriptions.forEach((subscription, index) => {
      try {
        subscription.callback(message);
        
        // Remove one-time subscriptions
        if (subscription.once) {
          subscriptions.splice(index, 1);
        }
      } catch (error) {
        console.error(`Error in subscription callback:`, error);
      }
    });
  }

  // Public API methods
  registerIsland(islandId: string, messageHandler?: MessageHandler): void {
    console.log(`🏝️ Registering island: ${islandId}`);
    
    if (messageHandler) {
      const handlers = this.messageHandlers.get(islandId) || [];
      handlers.push(messageHandler);
      this.messageHandlers.set(islandId, handlers);
    }

    // Send registration event
    this.sendMessage({
      type: 'ISLAND_REGISTERED',
      source: 'CommunicationHub',
      data: { islandId, timestamp: Date.now() }
    });
  }

  unregisterIsland(islandId: string): void {
    console.log(`🗑️ Unregistering island: ${islandId}`);
    
    this.messageHandlers.delete(islandId);
    this.islandStates.delete(islandId);
    
    // Remove subscriptions
    this.subscriptions.forEach(subscriptions => {
      const index = subscriptions.findIndex(sub => sub.islandId === islandId);
      if (index > -1) {
        subscriptions.splice(index, 1);
      }
    });

    // Send unregistration event
    this.sendMessage({
      type: 'ISLAND_UNREGISTERED',
      source: 'CommunicationHub',
      data: { islandId, timestamp: Date.now() }
    });
  }

  subscribe(
    islandId: string,
    eventType: string,
    callback: (message: IslandMessage) => void,
    once = false
  ): () => void {
    const subscription: IslandSubscription = {
      islandId,
      eventType,
      callback,
      once
    };

    const subscriptions = this.subscriptions.get(eventType) || [];
    subscriptions.push(subscription);
    this.subscriptions.set(eventType, subscriptions);

    console.log(`📡 Island ${islandId} subscribed to ${eventType}`);

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(eventType) || [];
      const index = subs.indexOf(subscription);
      if (index > -1) {
        subs.splice(index, 1);
        console.log(`📡 Island ${islandId} unsubscribed from ${eventType}`);
      }
    };
  }

  updateIslandState(islandId: string, state: any, dependencies: string[] = []): void {
    this.sendMessage({
      type: 'ISLAND_STATE_UPDATE',
      source: islandId,
      data: { islandId, state, dependencies }
    });
  }

  requestIslandState(requestingIslandId: string, targetIslandId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`State request timeout for island ${targetIslandId}`));
      }, 5000);

      const unsubscribe = this.subscribe(
        requestingIslandId,
        'ISLAND_STATE_RESPONSE',
        (message) => {
          if (message.data.islandId === targetIslandId) {
            clearTimeout(timeout);
            unsubscribe();
            resolve(message.data.state);
          }
        },
        true
      );

      this.sendMessage({
        type: 'ISLAND_STATE_REQUEST',
        source: requestingIslandId,
        data: { requestedIslandId: targetIslandId }
      });
    });
  }

  private startMessageProcessor(): void {
    const processQueue = () => {
      if (!this.isProcessing && this.messageQueue.length > 0) {
        this.isProcessing = true;
        
        // Sort by priority
        this.messageQueue.sort((a, b) => {
          const priorities = { critical: 4, high: 3, normal: 2, low: 1 };
          return priorities[b.priority || 'normal'] - priorities[a.priority || 'normal'];
        });

        // Process messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift()!;
          this.processMessage(message);
        }

        this.isProcessing = false;
      }

      requestAnimationFrame(processQueue);
    };

    processQueue();
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToHistory(message: IslandMessage): void {
    this.messageHistory.push(message);
    
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }
  }

  // Debugging and monitoring methods
  getMessageHistory(): IslandMessage[] {
    return [...this.messageHistory];
  }

  getIslandStates(): Map<string, IslandState> {
    return new Map(this.islandStates);
  }

  getActiveSubscriptions(): Map<string, IslandSubscription[]> {
    return new Map(this.subscriptions);
  }

  getRegisteredIslands(): string[] {
    return Array.from(this.messageHandlers.keys());
  }

  clearHistory(): void {
    this.messageHistory = [];
    console.log('📝 Message history cleared');
  }

  cleanup(): void {
    this.messageQueue = [];
    this.messageHandlers.clear();
    this.islandStates.clear();
    this.subscriptions.clear();
    this.messageHistory = [];
    console.log('🧹 Communication hub cleaned up');
  }
}

// Global singleton instance
export const islandCommunicationHub = new IslandCommunicationHub();

// React hook for using island communication
export function useIslandCommunication(islandId: string) {
  const [messages, setMessages] = React.useState<IslandMessage[]>([]);
  const [islandState, setIslandState] = React.useState<any>(null);

  React.useEffect(() => {
    // Register the island
    islandCommunicationHub.registerIsland(islandId, (message) => {
      setMessages(prev => [...prev.slice(-9), message]); // Keep last 10 messages
    });

    // Subscribe to state changes for this island
    const unsubscribe = islandCommunicationHub.subscribe(
      islandId,
      'ISLAND_STATE_UPDATE',
      (message) => {
        if (message.data.islandId === islandId) {
          setIslandState(message.data.state);
        }
      }
    );

    return () => {
      unsubscribe();
      islandCommunicationHub.unregisterIsland(islandId);
    };
  }, [islandId]);

  const sendMessage = React.useCallback((type: string, data: any, target?: string) => {
    islandCommunicationHub.sendMessage({
      type,
      source: islandId,
      target,
      data
    });
  }, [islandId]);

  const updateState = React.useCallback((state: any, dependencies: string[] = []) => {
    islandCommunicationHub.updateIslandState(islandId, state, dependencies);
    setIslandState(state);
  }, [islandId]);

  const requestState = React.useCallback((targetIslandId: string) => {
    return islandCommunicationHub.requestIslandState(islandId, targetIslandId);
  }, [islandId]);

  return {
    messages,
    islandState,
    sendMessage,
    updateState,
    requestState
  };
}

// Development tools
if (process.env.NODE_ENV === 'development') {
  (window as any).islandCommunicationHub = islandCommunicationHub;
}