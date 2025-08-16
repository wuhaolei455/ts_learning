// 第四阶段：异步EventEmitter的测试用例
import { Assert, createMock, TestRunner } from './test-framework';

// TODO: 定义异步事件映射接口
interface AsyncEventMap {
  // TODO: 定义异步事件类型
  'data:save': { id: string; data: any };
  'file:upload': { filename: string; size: number };
  'user:authenticate': { username: string; password: string };
}

function isAsyncFunction(func: Function): boolean {
  return func instanceof Function && func[Symbol.toStringTag] === 'AsyncFunction';
}

// TODO: 你需要在这里实现 AsyncEventEmitter 类
class AsyncEventEmitter<TEventMap extends Record<string, any> = AsyncEventMap> {
  private eventMap: Map<keyof TEventMap, Set<Function>> = new Map();

  constructor() {
    // TODO: 初始化
  }

  // TODO: 实现 on 方法，支持同步和异步监听器
  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => any | Promise<any>
  ): this {
    if (!this.eventMap.has(event)) {
      this.eventMap.set(event, new Set())
    }
    this.eventMap.get(event)!.add(listener)
    return this;
  }

  // TODO: 实现 emitAsync 方法 - 并行执行所有异步监听器
  // 返回：Promise<any[]> - 所有监听器的返回值
  async emitAsync<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): Promise<any[]> {
    const listeners = this.eventMap.get(event)
    if (!listeners || listeners.size === 0) {
      return Promise.resolve([]);
    }

    return Promise.all([...listeners].map((listener) => {
      if (isAsyncFunction(listener)) {
        return listener(data).catch((error) => {
          console.error(`Error in listener for ${event.toString()}:`, error);
          return null;
        })
      }
      return Promise.resolve(listener(data))
    }))
  }

  // TODO: 实现 emitAsyncSerial 方法 - 串行执行异步监听器
  // 返回：Promise<any[]> - 按顺序执行的结果
  async emitAsyncSerial<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): Promise<any[]> {
    const listeners = this.eventMap.get(event)
    if (!listeners || listeners.size === 0) {
      return Promise.resolve([]);
    }

    const results = []
    for (const listener of listeners) {
      if (isAsyncFunction(listener)) {
        try{
          results.push(await listener(data));
        } catch (error) {
          console.error(`Error in listener for ${event.toString()}:`, error);
          results.push(null);
        }
      }
    }
    return results
  }

  // TODO: 实现同步 emit 方法
  emit<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): boolean {
    const listeners = this.eventMap.get(event)
    if (!listeners || listeners.size === 0) {
      return false;
    }

    listeners?.forEach((listener) => {
      if (isAsyncFunction(listener)) {
        listener(data).catch((error) => {
          console.error(`Error in listener for ${event.toString()}:`, error);
        })
      } else {
        listener(data)
      }
    })
    return true
  }

  // TODO: 实现 listenerCount 方法
  listenerCount<K extends keyof TEventMap>(event: K): number {
    return this.eventMap.get(event)?.size || 0;
  }

  // TODO: 实现 removeAllListeners 方法
  removeAllListeners<K extends keyof TEventMap>(event?: K): this {
    if (event) {
      this.eventMap.delete(event)
    } else {
      this.eventMap.clear()
    }
    return this
  }
}

// 测试用例
export function runAsyncEventEmitterTests() {
  const runner = new TestRunner();

  runner.test('应该能够创建AsyncEventEmitter实例', () => {
    const emitter = new AsyncEventEmitter<AsyncEventMap>();
    Assert.true(emitter instanceof AsyncEventEmitter, 'emitter应该是AsyncEventEmitter的实例');
  });

  runner.test('应该能够添加同步监听器', () => {
    const emitter = new AsyncEventEmitter<AsyncEventMap>();
    const mockCallback = createMock<(data: AsyncEventMap['data:save']) => void>();
    
    emitter.on('data:save', mockCallback.getMock());
    
    Assert.equal(emitter.listenerCount('data:save'), 1, '监听器数量应该为1');
  });

  runner.test('应该能够添加异步监听器', () => {
    const emitter = new AsyncEventEmitter<AsyncEventMap>();
    const asyncCallback = async (data: AsyncEventMap['data:save']) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return `saved-${data.id}`;
    };
    
    emitter.on('data:save', asyncCallback);
    
    Assert.equal(emitter.listenerCount('data:save'), 1, '异步监听器数量应该为1');
  });

  runner.test('emitAsync应该并行执行所有监听器', async () => {
    const emitter = new AsyncEventEmitter<AsyncEventMap>();
    const startTime = Date.now();
    
    // 添加多个异步监听器，每个延迟50ms
    emitter.on('data:save', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'result1';
    });
    
    emitter.on('data:save', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'result2';
    });
    
    emitter.on('data:save', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'result3';
    });
    
    const results = await emitter.emitAsync('data:save', { id: 'test', data: {} });
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    Assert.equal(results.length, 3, '应该返回3个结果');
    Assert.arrayContains(results, 'result1', '应该包含第一个结果');
    Assert.arrayContains(results, 'result2', '应该包含第二个结果');
    Assert.arrayContains(results, 'result3', '应该包含第三个结果');
    
    // 并行执行应该在100ms内完成（而不是150ms）
    Assert.lessThan(duration, 100, '并行执行应该更快');
  });

  runner.test('emitAsyncSerial应该串行执行所有监听器', async () => {
    const emitter = new AsyncEventEmitter<AsyncEventMap>();
    const executionOrder: number[] = [];
    
    emitter.on('data:save', async () => {
      await new Promise(resolve => setTimeout(resolve, 30));
      executionOrder.push(1);
      return 'result1';
    });
    
    emitter.on('data:save', async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
      executionOrder.push(2);
      return 'result2';
    });
    
    emitter.on('data:save', async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      executionOrder.push(3);
      return 'result3';
    });
    
    const results = await emitter.emitAsyncSerial('data:save', { id: 'test', data: {} });
    
    Assert.equal(results.length, 3, '应该返回3个结果');
    Assert.deepEqual(executionOrder, [1, 2, 3], '应该按添加顺序执行');
    Assert.deepEqual(results, ['result1', 'result2', 'result3'], '结果应该按执行顺序返回');
  });

  runner.test('应该能够处理异步监听器中的错误', async () => {
    const emitter = new AsyncEventEmitter<AsyncEventMap>();
    
    emitter.on('data:save', async () => {
      return 'success';
    });
    
    emitter.on('data:save', async () => {
      throw new Error('async error');
    });
    
    emitter.on('data:save', async () => {
      return 'another success';
    });
    
    const results = await emitter.emitAsync('data:save', { id: 'test', data: {} });
    
    // 应该有结果，错误不应该阻止其他监听器执行
    Assert.equal(results.length, 3, '应该返回3个结果（包括错误处理）');
    Assert.arrayContains(results, 'success', '成功的监听器结果应该被包含');
    Assert.arrayContains(results, 'another success', '另一个成功的监听器结果应该被包含');
  });

  runner.test('同步emit应该立即返回，不等待异步监听器', () => {
    const emitter = new AsyncEventEmitter<AsyncEventMap>();
    let asyncCompleted = false;
    
    emitter.on('data:save', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      asyncCompleted = true;
    });
    
    const startTime = Date.now();
    const result = emitter.emit('data:save', { id: 'test', data: {} });
    const endTime = Date.now();
    
    Assert.true(result, 'emit应该返回true');
    Assert.lessThan(endTime - startTime, 10, 'emit应该立即返回');
    Assert.false(asyncCompleted, '异步操作不应该在emit返回时完成');
  });

  runner.test('应该能够混合同步和异步监听器', async () => {
    const emitter = new AsyncEventEmitter<AsyncEventMap>();
    const executionOrder: string[] = [];
    
    // 同步监听器
    emitter.on('data:save', (data) => {
      executionOrder.push('sync');
      return 'sync-result';
    });
    
    // 异步监听器
    emitter.on('data:save', async (data) => {
      await new Promise(resolve => setTimeout(resolve, 20));
      executionOrder.push('async');
      return 'async-result';
    });
    
    const results = await emitter.emitAsync('data:save', { id: 'test', data: {} });
    
    Assert.equal(results.length, 2, '应该有2个结果');
    Assert.arrayContains(results, 'sync-result', '应该包含同步结果');
    Assert.arrayContains(results, 'async-result', '应该包含异步结果');
  });

  runner.test('串行执行中的错误不应该阻止后续监听器执行', async () => {
    const emitter = new AsyncEventEmitter<AsyncEventMap>();
    const executionOrder: number[] = [];
    
    emitter.on('data:save', async () => {
      executionOrder.push(1);
      return 'result1';
    });
    
    emitter.on('data:save', async () => {
      executionOrder.push(2);
      throw new Error('error in listener 2');
    });
    
    emitter.on('data:save', async () => {
      executionOrder.push(3);
      return 'result3';
    });
    
    const results = await emitter.emitAsyncSerial('data:save', { id: 'test', data: {} });
    
    Assert.deepEqual(executionOrder, [1, 2, 3], '所有监听器都应该被执行');
    Assert.equal(results.length, 3, '应该返回3个结果');
  });

  runner.test('应该能够正确处理空监听器列表', async () => {
    const emitter = new AsyncEventEmitter<AsyncEventMap>();
    
    const asyncResults = await emitter.emitAsync('data:save', { id: 'test', data: {} });
    const serialResults = await emitter.emitAsyncSerial('data:save', { id: 'test', data: {} });
    const syncResult = emitter.emit('data:save', { id: 'test', data: {} });
    
    Assert.deepEqual(asyncResults, [], 'emitAsync应该返回空数组');
    Assert.deepEqual(serialResults, [], 'emitAsyncSerial应该返回空数组');
    Assert.false(syncResult, 'emit应该返回false');
  });

  return runner;
}

// 如果直接运行此文件
if (require.main === module) {
  console.log('🎯 第四阶段：异步EventEmitter测试');
  console.log('📝 请实现 AsyncEventEmitter 类中的 TODO 部分，然后运行测试');
  console.log('💡 提示：区分并行和串行执行，处理Promise和错误\n');
  
  runAsyncEventEmitterTests().run();
}
