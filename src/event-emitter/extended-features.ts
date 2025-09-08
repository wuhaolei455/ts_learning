// 扩展功能示例

// 1. 异步事件支持
export class AsyncEventEmitter<TEventMap extends Record<string, any>> {
  private eventListeners: Map<keyof TEventMap, Set<Function>> = new Map();

  // 异步事件发射
  async emitAsync<K extends keyof TEventMap>(
    event: K, 
    data: TEventMap[K]
  ): Promise<any[]> {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return [];

    const results = await Promise.all(
      Array.from(listeners).map(async (listener) => {
        try {
          return await listener(data);
        } catch (error) {
          console.error(`Async listener error for ${String(event)}:`, error);
          return null;
        }
      })
    );

    return results.filter(result => result !== null);
  }

  // 串行异步执行
  async emitAsyncSerial<K extends keyof TEventMap>(
    event: K, 
    data: TEventMap[K]
  ): Promise<any[]> {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return [];

    const results = [];
    for (const listener of listeners) {
      try {
        const result = await listener(data);
        results.push(result);
      } catch (error) {
        console.error(`Serial async listener error for ${String(event)}:`, error);
      }
    }

    return results;
  }

  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void | Promise<void>
  ): this {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
    return this;
  }
}

// 2. 优先级事件系统
interface PriorityListener<T> {
  listener: (data: T) => void;
  priority: number; // 数字越大优先级越高
}

export class PriorityEventEmitter<TEventMap extends Record<string, any>> {
  private eventListeners: Map<keyof TEventMap, PriorityListener<any>[]> = new Map();

  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void,
    priority: number = 0
  ): this {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    const listeners = this.eventListeners.get(event)!;
    listeners.push({ listener, priority });
    
    // 按优先级排序（高优先级在前）
    listeners.sort((a, b) => b.priority - a.priority);
    
    return this;
  }

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean {
    const listeners = this.eventListeners.get(event);
    if (!listeners || listeners.length === 0) return false;

    for (const { listener } of listeners) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Priority listener error for ${String(event)}:`, error);
      }
    }

    return true;
  }
}

// 3. 事件过滤器
export class FilterableEventEmitter<TEventMap extends Record<string, any>> {
  private eventListeners: Map<keyof TEventMap, Set<Function>> = new Map();
  private eventFilters: Map<keyof TEventMap, ((data: any) => boolean)[]> = new Map();

  // 添加事件过滤器
  addFilter<K extends keyof TEventMap>(
    event: K,
    filter: (data: TEventMap[K]) => boolean
  ): this {
    if (!this.eventFilters.has(event)) {
      this.eventFilters.set(event, []);
    }
    this.eventFilters.get(event)!.push(filter);
    return this;
  }

  // 移除过滤器
  removeFilter<K extends keyof TEventMap>(
    event: K,
    filter: (data: TEventMap[K]) => boolean
  ): this {
    const filters = this.eventFilters.get(event);
    if (filters) {
      const index = filters.indexOf(filter);
      if (index > -1) {
        filters.splice(index, 1);
      }
    }
    return this;
  }

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean {
    // 应用过滤器
    const filters = this.eventFilters.get(event);
    if (filters && filters.length > 0) {
      const shouldEmit = filters.every(filter => {
        try {
          return filter(data);
        } catch (error) {
          console.error(`Filter error for ${String(event)}:`, error);
          return false;
        }
      });

      if (!shouldEmit) {
        return false;
      }
    }

    const listeners = this.eventListeners.get(event);
    if (!listeners || listeners.size === 0) return false;

    for (const listener of listeners) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Listener error for ${String(event)}:`, error);
      }
    }

    return true;
  }

  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
    return this;
  }
}

// 4. 事件重放系统
interface EventRecord<T> {
  timestamp: number;
  data: T;
}

export class ReplayableEventEmitter<TEventMap extends Record<string, any>> {
  private eventListeners: Map<keyof TEventMap, Set<Function>> = new Map();
  private eventHistory: Map<keyof TEventMap, EventRecord<any>[]> = new Map();
  private maxHistorySize: number = 100;

  // 设置历史记录大小
  setMaxHistorySize(size: number): this {
    this.maxHistorySize = size;
    return this;
  }

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean {
    // 记录事件历史
    if (!this.eventHistory.has(event)) {
      this.eventHistory.set(event, []);
    }

    const history = this.eventHistory.get(event)!;
    history.push({
      timestamp: Date.now(),
      data
    });

    // 限制历史记录大小
    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    // 发射事件
    const listeners = this.eventListeners.get(event);
    if (!listeners || listeners.size === 0) return false;

    for (const listener of listeners) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Listener error for ${String(event)}:`, error);
      }
    }

    return true;
  }

  // 重放历史事件
  replay<K extends keyof TEventMap>(
    event: K,
    fromTimestamp?: number
  ): this {
    const history = this.eventHistory.get(event);
    if (!history) return this;

    const filteredHistory = fromTimestamp
      ? history.filter(record => record.timestamp >= fromTimestamp)
      : history;

    for (const record of filteredHistory) {
      this.emit(event, record.data);
    }

    return this;
  }

  // 获取事件历史
  getHistory<K extends keyof TEventMap>(event: K): EventRecord<TEventMap[K]>[] {
    return this.eventHistory.get(event) || [];
  }

  // 清除历史
  clearHistory<K extends keyof TEventMap>(event?: K): this {
    if (event) {
      this.eventHistory.delete(event);
    } else {
      this.eventHistory.clear();
    }
    return this;
  }

  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
    return this;
  }
}

// 5. 事件节流和防抖
export class ThrottledEventEmitter<TEventMap extends Record<string, any>> {
  private eventListeners: Map<keyof TEventMap, Set<Function>> = new Map();
  private throttleTimers: Map<keyof TEventMap, NodeJS.Timeout> = new Map();
  private debounceTimers: Map<keyof TEventMap, NodeJS.Timeout> = new Map();
  private throttleDelays: Map<keyof TEventMap, number> = new Map();
  private debounceDelays: Map<keyof TEventMap, number> = new Map();

  // 设置节流延迟
  setThrottleDelay<K extends keyof TEventMap>(event: K, delay: number): this {
    this.throttleDelays.set(event, delay);
    return this;
  }

  // 设置防抖延迟
  setDebounceDelay<K extends keyof TEventMap>(event: K, delay: number): this {
    this.debounceDelays.set(event, delay);
    return this;
  }

  // 节流发射
  emitThrottled<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean {
    const delay = this.throttleDelays.get(event);
    if (!delay) {
      return this.emit(event, data);
    }

    if (this.throttleTimers.has(event)) {
      return false; // 在节流期间，忽略事件
    }

    const result = this.emit(event, data);
    
    this.throttleTimers.set(event, setTimeout(() => {
      this.throttleTimers.delete(event);
    }, delay));

    return result;
  }

  // 防抖发射
  emitDebounced<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void {
    const delay = this.debounceDelays.get(event);
    if (!delay) {
      this.emit(event, data);
      return;
    }

    // 清除之前的定时器
    const existingTimer = this.debounceTimers.get(event);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 设置新的定时器
    const newTimer = setTimeout(() => {
      this.emit(event, data);
      this.debounceTimers.delete(event);
    }, delay);

    this.debounceTimers.set(event, newTimer);
  }

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean {
    const listeners = this.eventListeners.get(event);
    if (!listeners || listeners.size === 0) return false;

    for (const listener of listeners) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Listener error for ${String(event)}:`, error);
      }
    }

    return true;
  }

  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
    return this;
  }

  // 清理定时器
  destroy(): void {
    for (const timer of this.throttleTimers.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.throttleTimers.clear();
    this.debounceTimers.clear();
  }
}

// 6. 组合所有功能的超级事件发射器
export class SuperEventEmitter<TEventMap extends Record<string, any>>
  extends AsyncEventEmitter<TEventMap> {
  
  private priorityListeners: Map<keyof TEventMap, PriorityListener<any>[]> = new Map();
  private filters: Map<keyof TEventMap, ((data: any) => boolean)[]> = new Map();
  private history: Map<keyof TEventMap, EventRecord<any>[]> = new Map();
  private middlewares: ((event: keyof TEventMap, data: any, next: () => void) => void)[] = [];

  // 集成所有功能...
  use(middleware: (event: keyof TEventMap, data: any, next: () => void) => void): this {
    this.middlewares.push(middleware);
    return this;
  }

  // 可以继续添加其他功能的集成...
}

// 使用示例
interface MyEventMap {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'data:update': { id: string; data: any };
}

const emitter = new SuperEventEmitter<MyEventMap>();

// 类型安全的使用
emitter.on('user:login', (data) => {
  console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});

// 异步监听器
emitter.on('data:update', async (data) => {
  await saveToDatabase(data.id, data.data);
});

async function saveToDatabase(id: string, data: any) {
  // 模拟数据库保存
  return Promise.resolve();
}
