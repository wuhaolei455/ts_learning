// 第三阶段：类型安全EventEmitter的参考实现
// 注意：这是参考答案，建议先自己尝试实现

interface EventMap {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'data:update': { id: string; data: any };
  'error': { message: string; code: number };
}

export class TypedEventEmitter<TEventMap extends Record<string, any> = EventMap> {
  private events: Map<keyof TEventMap, Set<Function>> = new Map();

  constructor() {
    // 初始化事件存储（已在属性声明中完成）
  }

  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    // 如果事件不存在，创建一个新的 Set
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    // 将监听器添加到 Set 中
    this.events.get(event)!.add(listener);
    
    // 返回 this 以支持链式调用
    return this;
  }

  once<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    // 创建一个包装函数，在执行后自动移除监听器
    const onceWrapper = (data: TEventMap[K]) => {
      // 先执行原始监听器
      listener(data);
      // 然后移除这个包装函数
      this.off(event, onceWrapper);
    };
    
    // 添加包装函数作为监听器
    return this.on(event, onceWrapper);
  }

  off<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(listener);
      // 如果没有监听器了，删除整个事件
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
    return this;
  }

  emit<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): boolean {
    // 获取事件对应的监听器
    const listeners = this.events.get(event);
    
    // 如果没有监听器，返回 false
    if (!listeners || listeners.size === 0) {
      return false;
    }
    
    // 遍历所有监听器并调用
    listeners.forEach(listener => {
      try {
        (listener as (data: TEventMap[K]) => void)(data);
      } catch (error) {
        // 添加错误处理
        console.error(`Error in listener for ${String(event)}:`, error);
      }
    });
    
    // 返回 true 表示有监听器被触发
    return true;
  }

  listenerCount<K extends keyof TEventMap>(event: K): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.size : 0;
  }

  removeAllListeners<K extends keyof TEventMap>(event?: K): this {
    if (event) {
      // 移除指定事件的所有监听器
      this.events.delete(event);
    } else {
      // 移除所有事件的监听器
      this.events.clear();
    }
    return this;
  }

  eventNames(): (keyof TEventMap)[] {
    // 返回所有事件名称的数组
    return Array.from(this.events.keys());
  }
}

// 使用示例
const emitter = new TypedEventEmitter<EventMap>();

// 类型安全的事件监听
emitter.on('user:login', (data) => {
  // data 自动推断为 { userId: string; timestamp: number }
  console.log(`用户 ${data.userId} 在 ${new Date(data.timestamp).toLocaleTimeString()} 登录`);
});

// 链式调用
emitter
  .on('user:logout', (data) => {
    console.log(`用户 ${data.userId} 已登出`);
  })
  .on('data:update', (data) => {
    console.log(`数据 ${data.id} 已更新:`, data.data);
  });

// 一次性监听
emitter.once('error', (data) => {
  console.error(`错误 ${data.code}: ${data.message}`);
});

// 类型安全的事件发射
emitter.emit('user:login', {
  userId: 'user123',
  timestamp: Date.now()
});

emitter.emit('data:update', {
  id: 'data456',
  data: { name: 'test', value: 42 }
});

emitter.emit('error', {
  code: 404,
  message: '资源未找到'
});

// 自定义事件映射示例
interface CustomEventMap {
  'custom:event': { value: number };
  'another:event': { text: string };
}

const customEmitter = new TypedEventEmitter<CustomEventMap>();
customEmitter.on('custom:event', (data) => {
  console.log(`自定义事件值: ${data.value}`);
});

export default TypedEventEmitter;
