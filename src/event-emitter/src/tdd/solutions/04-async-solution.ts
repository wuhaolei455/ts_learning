// 第四阶段：异步EventEmitter的参考实现
// 注意：这是参考答案，建议先自己尝试实现

interface AsyncEventMap {
  'data:save': { id: string; data: any };
  'file:upload': { filename: string; size: number };
  'user:authenticate': { username: string; password: string };
}

export class AsyncEventEmitter<TEventMap extends Record<string, any> = AsyncEventMap> {
  private events: Map<keyof TEventMap, Set<Function>> = new Map();

  constructor() {
    // 初始化事件存储（已在属性声明中完成）
  }

  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void | Promise<void>
  ): this {
    // 如果事件不存在，创建一个新的 Set
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    // 将监听器添加到 Set 中
    this.events.get(event)!.add(listener);
    
    return this;
  }

  async emitAsync<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): Promise<any[]> {
    // 获取所有监听器
    const listeners = this.events.get(event);
    
    if (!listeners || listeners.size === 0) {
      return [];
    }
    
    // 使用 Promise.all 并行执行所有监听器
    const promises = Array.from(listeners).map(async (listener) => {
      try {
        // 执行监听器（可能是同步或异步）
        return await (listener as any)(data);
      } catch (error) {
        // 处理错误，不要让单个监听器的错误影响其他监听器
        console.error(`Async listener error for ${String(event)}:`, error);
        return null; // 返回null表示这个监听器出错了
      }
    });
    
    // 等待所有监听器完成并返回结果
    return Promise.all(promises);
  }

  async emitAsyncSerial<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): Promise<any[]> {
    // 获取所有监听器
    const listeners = this.events.get(event);
    
    if (!listeners || listeners.size === 0) {
      return [];
    }
    
    const results = [];
    
    // 使用 for...of 串行执行监听器
    for (const listener of listeners) {
      try {
        // 等待当前监听器完成再执行下一个
        const result = await (listener as any)(data);
        results.push(result);
      } catch (error) {
        // 处理错误，但继续执行后续监听器
        console.error(`Serial async listener error for ${String(event)}:`, error);
        results.push(null);
      }
    }
    
    return results;
  }

  emit<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): boolean {
    // 同步 emit 方法，不等待异步监听器完成
    const listeners = this.events.get(event);
    
    if (!listeners || listeners.size === 0) {
      return false;
    }
    
    // 触发所有监听器但不等待结果
    listeners.forEach(listener => {
      try {
        // 执行监听器，如果是Promise就不等待
        const result = (listener as any)(data);
        // 如果返回Promise，可以选择处理未捕获的错误
        if (result && typeof result.catch === 'function') {
          result.catch((error: any) => {
            console.error(`Unhandled async error in listener for ${String(event)}:`, error);
          });
        }
      } catch (error) {
        console.error(`Sync listener error for ${String(event)}:`, error);
      }
    });
    
    return true;
  }

  listenerCount<K extends keyof TEventMap>(event: K): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.size : 0;
  }

  removeAllListeners<K extends keyof TEventMap>(event?: K): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }
}

// 使用示例
async function demonstrateAsyncEmitter() {
  const emitter = new AsyncEventEmitter<AsyncEventMap>();
  
  // 添加异步监听器
  emitter.on('data:save', async (data) => {
    console.log(`开始保存数据: ${data.id}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // 模拟异步操作
    console.log(`数据保存完成: ${data.id}`);
    return `saved-${data.id}`;
  });
  
  emitter.on('data:save', async (data) => {
    console.log(`开始创建备份: ${data.id}`);
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(`备份创建完成: ${data.id}`);
    return `backup-${data.id}`;
  });
  
  // 添加同步监听器
  emitter.on('data:save', (data) => {
    console.log(`记录日志: ${data.id}`);
    return `logged-${data.id}`;
  });
  
  console.log('=== 并行执行异步监听器 ===');
  const startTime = Date.now();
  const results = await emitter.emitAsync('data:save', { id: 'test1', data: {} });
  const endTime = Date.now();
  
  console.log('并行执行结果:', results);
  console.log(`并行执行耗时: ${endTime - startTime}ms`);
  
  console.log('\n=== 串行执行异步监听器 ===');
  const startTime2 = Date.now();
  const results2 = await emitter.emitAsyncSerial('data:save', { id: 'test2', data: {} });
  const endTime2 = Date.now();
  
  console.log('串行执行结果:', results2);
  console.log(`串行执行耗时: ${endTime2 - startTime2}ms`);
  
  console.log('\n=== 同步执行（不等待异步） ===');
  const syncResult = emitter.emit('data:save', { id: 'test3', data: {} });
  console.log('同步执行结果:', syncResult);
}

// 如果直接运行此文件，执行演示
if (require.main === module) {
  demonstrateAsyncEmitter().catch(console.error);
}

export default AsyncEventEmitter;
