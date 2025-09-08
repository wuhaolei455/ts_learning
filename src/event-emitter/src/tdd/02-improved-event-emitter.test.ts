// 第二阶段：改进版EventEmitter的测试用例
import { Assert, createMock, TestRunner } from './test-framework';

// TODO: 定义 Subscription 接口
interface Subscription {
  // TODO: 添加 unsubscribe 方法的类型定义
  unsubscribe: Function;
}

// TODO: 你需要在这里实现 ImprovedEventEmitter 类
class ImprovedEventEmitter {
  // TODO: 使用 Map 和 Set 来存储事件监听器
  // 提示：Map<string, Set<Function>>
  private eventMap: Map<string, Set<Function>> = new Map();

  constructor() {
    // TODO: 初始化事件存储
  }

  // TODO: 实现 subscribe 方法（替代 on）
  // 参数：eventName: string, callback: Function
  // 返回：Subscription 对象，包含 unsubscribe 方法
  subscribe(eventName: string, callback: Function): Subscription {
    // TODO: 实现这个方法
    // 1. 如果事件不存在，创建一个新的 Set
    // 2. 将回调函数添加到 Set 中
    // 3. 返回包含 unsubscribe 方法的对象
    if (!this.eventMap.has(eventName)) {
      this.eventMap.set(eventName, new Set());
    }

    this.eventMap.get(eventName)?.add(callback);

    return {
      unsubscribe: () => {
        // this.eventMap.get(eventName)?.delete(callback);
        const callbacks = this.eventMap.get(eventName);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            this.eventMap.delete(eventName);
          }
        }
      }
    };
  }

  // TODO: 实现 emit 方法
  // 参数：eventName: string, ...args: any[]
  // 返回：any[] - 所有监听器的返回值
  emit(eventName: string, ...args: any[]): any[] {
    // TODO: 实现这个方法
    // 1. 获取事件对应的监听器 Set
    // 2. 如果不存在，返回空数组
    // 3. 遍历所有监听器，收集返回值
    // 4. 添加错误处理
    const callbacks = this.eventMap.get(eventName);

    const results = [];
    callbacks?.forEach((callback) => {
      try{
        results.push(callback(...args));
      } catch (error) {
        // return [];
        console.error(`Error in listener for ${eventName}:`, error);
        results.push(null);
      }
    });

    return results;
  }

  // TODO: 实现 removeAllListeners 方法
  // 参数：eventName?: string
  // 功能：移除指定事件的所有监听器，或移除所有事件的监听器
  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.eventMap.delete(eventName);
    } else {
      this.eventMap.clear();
    }
  }

  // TODO: 实现 listenerCount 方法
  listenerCount(eventName: string): number {
    return this.eventMap.get(eventName)?.size || 0;
  }

  // TODO: 实现 eventNames 方法
  // 返回：string[] - 所有事件名称的数组
  eventNames(): string[] {
    return Array.from(this.eventMap.keys())
  }

  // TODO: 实现 hasListeners 方法
  // 参数：eventName: string
  // 返回：boolean - 是否有监听器
  hasListeners(eventName: string): boolean {
    return this.listenerCount(eventName) > 0;
  }
}

// 测试用例
export function runImprovedEventEmitterTests() {
  const runner = new TestRunner();

  runner.test('应该能够创建ImprovedEventEmitter实例', () => {
    const emitter = new ImprovedEventEmitter();
    Assert.true(emitter instanceof ImprovedEventEmitter, 'emitter应该是ImprovedEventEmitter的实例');
  });

  runner.test('subscribe方法应该返回Subscription对象', () => {
    const emitter = new ImprovedEventEmitter();
    const subscription = emitter.subscribe('test', () => {});
    
    Assert.true(typeof subscription === 'object', 'subscription应该是对象');
    Assert.true(typeof subscription.unsubscribe === 'function', 'subscription应该有unsubscribe方法');
  });

  runner.test('应该能够取消订阅', () => {
    const emitter = new ImprovedEventEmitter();
    const mockCallback = createMock<() => void>();
    
    const subscription = emitter.subscribe('test', mockCallback.getMock());
    Assert.equal(emitter.listenerCount('test'), 1, '订阅后监听器数量应该为1');
    
    subscription.unsubscribe();
    Assert.equal(emitter.listenerCount('test'), 0, '取消订阅后监听器数量应该为0');
    
    emitter.emit('test');
    Assert.false(mockCallback.toHaveBeenCalled(), '取消订阅后监听器不应该被调用');
  });

  runner.test('emit方法应该返回监听器的返回值数组', () => {
    const emitter = new ImprovedEventEmitter();
    
    emitter.subscribe('test', () => 'result1');
    emitter.subscribe('test', () => 'result2');
    emitter.subscribe('test', () => 42);
    
    const results = emitter.emit('test');
    
    Assert.equal(results.length, 3, '应该返回3个结果');
    Assert.true(results.includes('result1'), '应该包含第一个监听器的返回值');
    Assert.true(results.includes('result2'), '应该包含第二个监听器的返回值');
    Assert.true(results.includes(42), '应该包含第三个监听器的返回值');
  });

  runner.test('应该能够处理监听器中的错误', () => {
    const emitter = new ImprovedEventEmitter();
    const mockCallback1 = createMock<() => string>();
    const mockCallback2 = createMock<() => string>();
    
    mockCallback1.mockReturnValue('success');
    mockCallback2.mockThrowError(new Error('test error'));
    
    emitter.subscribe('test', mockCallback1.getMock());
    emitter.subscribe('test', mockCallback2.getMock());
    
    // 应该不抛出错误，继续执行其他监听器
    const results = emitter.emit('test');
    
    Assert.true(mockCallback1.toHaveBeenCalled(), '正常的监听器应该被调用');
    Assert.true(mockCallback2.toHaveBeenCalled(), '出错的监听器也应该被调用');
  });

  runner.test('removeAllListeners应该能够移除指定事件的所有监听器', () => {
    const emitter = new ImprovedEventEmitter();
    
    emitter.subscribe('event1', () => {});
    emitter.subscribe('event1', () => {});
    emitter.subscribe('event2', () => {});
    
    Assert.equal(emitter.listenerCount('event1'), 2, 'event1应该有2个监听器');
    Assert.equal(emitter.listenerCount('event2'), 1, 'event2应该有1个监听器');
    
    emitter.removeAllListeners('event1');
    
    Assert.equal(emitter.listenerCount('event1'), 0, 'event1的监听器应该被全部移除');
    Assert.equal(emitter.listenerCount('event2'), 1, 'event2的监听器应该保持不变');
  });

  runner.test('removeAllListeners不传参数应该移除所有事件的监听器', () => {
    const emitter = new ImprovedEventEmitter();
    
    emitter.subscribe('event1', () => {});
    emitter.subscribe('event2', () => {});
    emitter.subscribe('event3', () => {});
    
    Assert.greaterThan(emitter.eventNames().length, 0, '应该有事件存在');
    
    emitter.removeAllListeners();
    
    Assert.equal(emitter.eventNames().length, 0, '所有事件应该被移除');
  });

  runner.test('eventNames应该返回所有事件名称', () => {
    const emitter = new ImprovedEventEmitter();
    
    emitter.subscribe('event1', () => {});
    emitter.subscribe('event2', () => {});
    emitter.subscribe('event1', () => {}); // 重复事件名
    
    const eventNames = emitter.eventNames();
    
    Assert.equal(eventNames.length, 2, '应该有2个不同的事件名');
    Assert.arrayContains(eventNames, 'event1', '应该包含event1');
    Assert.arrayContains(eventNames, 'event2', '应该包含event2');
  });

  runner.test('hasListeners应该正确判断是否有监听器', () => {
    const emitter = new ImprovedEventEmitter();
    
    Assert.false(emitter.hasListeners('test'), '初始状态应该没有监听器');
    
    const subscription = emitter.subscribe('test', () => {});
    Assert.true(emitter.hasListeners('test'), '添加监听器后应该返回true');
    
    subscription.unsubscribe();
    Assert.false(emitter.hasListeners('test'), '移除监听器后应该返回false');
  });

  runner.test('应该能够避免重复添加相同的监听器', () => {
    const emitter = new ImprovedEventEmitter();
    const callback = () => {};
    
    emitter.subscribe('test', callback);
    emitter.subscribe('test', callback);
    
    // Set 的特性应该防止重复添加
    Assert.equal(emitter.listenerCount('test'), 1, '相同的监听器不应该被重复添加');
  });

  runner.test('取消订阅不存在的监听器不应该出错', () => {
    const emitter = new ImprovedEventEmitter();
    const subscription = emitter.subscribe('test', () => {});
    
    // 先正常取消订阅
    subscription.unsubscribe();
    
    // 再次取消订阅不应该出错
    subscription.unsubscribe();
    
    Assert.equal(emitter.listenerCount('test'), 0, '监听器数量应该保持为0');
  });

  return runner;
}

// 如果直接运行此文件
if (require.main === module) {
  console.log('🎯 第二阶段：改进版EventEmitter测试');
  console.log('📝 请实现 ImprovedEventEmitter 类中的 TODO 部分，然后运行测试');
  console.log('💡 提示：使用 Map 和 Set 数据结构，添加错误处理\n');
  
  runImprovedEventEmitterTests().run();
}
