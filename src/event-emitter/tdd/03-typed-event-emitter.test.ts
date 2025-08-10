// 第三阶段：类型安全EventEmitter的测试用例
import { Assert, createMock, TestRunner } from './test-framework';

// TODO: 定义事件映射接口
interface EventMap {
  // TODO: 定义各种事件类型
  // 提示：
  // 'user:login': { userId: string; timestamp: number };
  // 'user:logout': { userId: string };
  // 'data:update': { id: string; data: any };
  // 'error': { message: string; code: number };
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'data:update': { id: string; data: any };
  'error': { message: string; code: number };
}

// TODO: 你需要在这里实现 TypedEventEmitter 类
class TypedEventEmitter<TEventMap extends Record<string, any> = EventMap> {
  // TODO: 使用 Map 存储事件监听器
  // 提示：Map<keyof TEventMap, Set<Function>>
  private eventMap: Map<keyof TEventMap, Set<Function>> = new Map();
  
  constructor() {
    // TODO: 初始化事件存储
  }

  // TODO: 实现类型安全的 on 方法
  // 参数：event: K, listener: (data: TEventMap[K]) => void
  // 返回：this (支持链式调用)
  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    // TODO: 实现这个方法
    return this;
  }

  // TODO: 实现类型安全的 once 方法
  // 功能：只触发一次的监听器
  once<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    // TODO: 实现这个方法
    // 提示：创建一个包装函数，在执行后自动移除监听器
    return this;
  }

  // TODO: 实现类型安全的 off 方法
  // 功能：移除指定的监听器
  off<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    // TODO: 实现这个方法
    return this;
  }

  // TODO: 实现类型安全的 emit 方法
  // 参数：event: K, data: TEventMap[K]
  // 返回：boolean - 是否有监听器被触发
  emit<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): boolean {
    // TODO: 实现这个方法
    // 1. 获取事件对应的监听器
    // 2. 如果没有监听器，返回 false
    // 3. 遍历所有监听器并调用
    // 4. 添加错误处理
    // 5. 返回 true
    return false; // 占位符
  }

  // TODO: 实现 listenerCount 方法
  listenerCount<K extends keyof TEventMap>(event: K): number {
    // TODO: 实现这个方法
    return 0; // 占位符
  }

  // TODO: 实现 removeAllListeners 方法
  removeAllListeners<K extends keyof TEventMap>(event?: K): this {
    // TODO: 实现这个方法
    return this;
  }

  // TODO: 实现 eventNames 方法
  eventNames(): (keyof TEventMap)[] {
    // TODO: 实现这个方法
    return []; // 占位符
  }
}

// 测试用例
export function runTypedEventEmitterTests() {
  const runner = new TestRunner();

  runner.test('应该能够创建TypedEventEmitter实例', () => {
    const emitter = new TypedEventEmitter<EventMap>();
    Assert.true(emitter instanceof TypedEventEmitter, 'emitter应该是TypedEventEmitter的实例');
  });

  runner.test('应该能够添加类型安全的事件监听器', () => {
    const emitter = new TypedEventEmitter<EventMap>();
    const mockCallback = createMock<(data: EventMap['user:login']) => void>();
    
    // 这应该通过类型检查
    emitter.on('user:login', mockCallback.getMock());
    
    Assert.equal(emitter.listenerCount('user:login'), 1, '监听器数量应该为1');
  });

  runner.test('应该支持链式调用', () => {
    const emitter = new TypedEventEmitter<EventMap>();
    const mock1 = createMock<(data: EventMap['user:login']) => void>();
    const mock2 = createMock<(data: EventMap['user:logout']) => void>();
    
    const result = emitter
      .on('user:login', mock1.getMock())
      .on('user:logout', mock2.getMock());
    
    Assert.equal(result, emitter, 'on方法应该返回emitter实例以支持链式调用');
    Assert.equal(emitter.listenerCount('user:login'), 1, 'user:login应该有1个监听器');
    Assert.equal(emitter.listenerCount('user:logout'), 1, 'user:logout应该有1个监听器');
  });

  runner.test('应该能够发射类型安全的事件', () => {
    const emitter = new TypedEventEmitter<EventMap>();
    const mockCallback = createMock<(data: EventMap['user:login']) => void>();
    
    emitter.on('user:login', mockCallback.getMock());
    
    const result = emitter.emit('user:login', {
      userId: 'user123',
      timestamp: Date.now()
    });
    
    Assert.true(result, 'emit应该返回true表示有监听器被触发');
    Assert.true(mockCallback.toHaveBeenCalled(), '监听器应该被调用');
    
    const callArgs = mockCallback.getCallArgs(0);
    Assert.true(callArgs && callArgs[0].userId === 'user123', '应该传递正确的参数');
  });

  runner.test('once方法应该只触发一次监听器', () => {
    const emitter = new TypedEventEmitter<EventMap>();
    const mockCallback = createMock<(data: EventMap['error']) => void>();
    
    emitter.once('error', mockCallback.getMock());
    
    // 第一次触发
    emitter.emit('error', { message: 'test error', code: 500 });
    Assert.true(mockCallback.toHaveBeenCalledTimes(1), '第一次应该被调用');
    
    // 第二次触发
    emitter.emit('error', { message: 'another error', code: 404 });
    Assert.true(mockCallback.toHaveBeenCalledTimes(1), '第二次不应该被调用');
    
    Assert.equal(emitter.listenerCount('error'), 0, '监听器应该被自动移除');
  });

  runner.test('off方法应该能够移除指定的监听器', () => {
    const emitter = new TypedEventEmitter<EventMap>();
    const mock1 = createMock<(data: EventMap['data:update']) => void>();
    const mock2 = createMock<(data: EventMap['data:update']) => void>();
    
    emitter.on('data:update', mock1.getMock());
    emitter.on('data:update', mock2.getMock());
    
    Assert.equal(emitter.listenerCount('data:update'), 2, '应该有2个监听器');
    
    emitter.off('data:update', mock1.getMock());
    
    Assert.equal(emitter.listenerCount('data:update'), 1, '应该剩余1个监听器');
    
    emitter.emit('data:update', { id: 'test', data: {} });
    
    Assert.false(mock1.toHaveBeenCalled(), '被移除的监听器不应该被调用');
    Assert.true(mock2.toHaveBeenCalled(), '保留的监听器应该被调用');
  });

  runner.test('应该能够处理不存在的事件', () => {
    const emitter = new TypedEventEmitter<EventMap>();
    
    const result = emitter.emit('user:login', { userId: 'test', timestamp: Date.now() });
    
    Assert.false(result, '没有监听器时emit应该返回false');
  });

  runner.test('应该能够处理监听器中的错误', () => {
    const emitter = new TypedEventEmitter<EventMap>();
    const mock1 = createMock<(data: EventMap['error']) => void>();
    const mock2 = createMock<(data: EventMap['error']) => void>();
    
    mock1.mockThrowError(new Error('listener error'));
    
    emitter.on('error', mock1.getMock());
    emitter.on('error', mock2.getMock());
    
    // 应该不抛出错误
    const result = emitter.emit('error', { message: 'test', code: 500 });
    
    Assert.true(result, 'emit应该返回true');
    Assert.true(mock1.toHaveBeenCalled(), '出错的监听器应该被调用');
    Assert.true(mock2.toHaveBeenCalled(), '正常的监听器也应该被调用');
  });

  runner.test('removeAllListeners应该能够移除指定事件的所有监听器', () => {
    const emitter = new TypedEventEmitter<EventMap>();
    
    emitter.on('user:login', () => {});
    emitter.on('user:login', () => {});
    emitter.on('user:logout', () => {});
    
    Assert.equal(emitter.listenerCount('user:login'), 2, 'user:login应该有2个监听器');
    Assert.equal(emitter.listenerCount('user:logout'), 1, 'user:logout应该有1个监听器');
    
    emitter.removeAllListeners('user:login');
    
    Assert.equal(emitter.listenerCount('user:login'), 0, 'user:login的监听器应该被全部移除');
    Assert.equal(emitter.listenerCount('user:logout'), 1, 'user:logout的监听器应该保持不变');
  });

  runner.test('eventNames应该返回所有事件名称', () => {
    const emitter = new TypedEventEmitter<EventMap>();
    
    emitter.on('user:login', () => {});
    emitter.on('user:logout', () => {});
    emitter.on('data:update', () => {});
    
    const eventNames = emitter.eventNames();
    
    Assert.equal(eventNames.length, 3, '应该有3个事件名');
    Assert.arrayContains(eventNames as string[], 'user:login', '应该包含user:login');
    Assert.arrayContains(eventNames as string[], 'user:logout', '应该包含user:logout');
    Assert.arrayContains(eventNames as string[], 'data:update', '应该包含data:update');
  });

  runner.test('应该支持泛型事件映射', () => {
    // 定义自定义事件映射
    interface CustomEventMap {
      'custom:event': { value: number };
      'another:event': { text: string };
    }
    
    const emitter = new TypedEventEmitter<CustomEventMap>();
    const mockCallback = createMock<(data: { value: number }) => void>();
    
    emitter.on('custom:event', mockCallback.getMock());
    emitter.emit('custom:event', { value: 42 });
    
    Assert.true(mockCallback.toHaveBeenCalledWith({ value: 42 }), '应该支持自定义事件映射');
  });

  return runner;
}

// 如果直接运行此文件
if (require.main === module) {
  console.log('🎯 第三阶段：类型安全EventEmitter测试');
  console.log('📝 请实现 TypedEventEmitter 类中的 TODO 部分，然后运行测试');
  console.log('💡 提示：使用泛型约束确保类型安全，支持链式调用\n');
  
  runTypedEventEmitterTests().run();
}
