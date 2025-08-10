// 第二阶段：改进版EventEmitter的参考实现
// 注意：这是参考答案，建议先自己尝试实现

interface Subscription {
  unsubscribe: () => void;
}

export class ImprovedEventEmitter {
  private events: Map<string, Set<Function>> = new Map();

  constructor() {
    // 初始化事件存储（已在属性声明中完成）
  }

  subscribe(eventName: string, callback: Function): Subscription {
    // 如果事件不存在，创建一个新的 Set
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    
    // 将回调函数添加到 Set 中
    this.events.get(eventName)!.add(callback);
    
    // 返回包含 unsubscribe 方法的对象
    return {
      unsubscribe: () => {
        const listeners = this.events.get(eventName);
        if (listeners) {
          listeners.delete(callback);
          // 如果没有监听器了，删除整个事件
          if (listeners.size === 0) {
            this.events.delete(eventName);
          }
        }
      }
    };
  }

  emit(eventName: string, ...args: any[]): any[] {
    // 获取事件对应的监听器 Set
    const listeners = this.events.get(eventName);
    
    // 如果不存在，返回空数组
    if (!listeners || listeners.size === 0) {
      return [];
    }
    
    const results: any[] = [];
    
    // 遍历所有监听器，收集返回值
    listeners.forEach(listener => {
      try {
        const result = listener(...args);
        results.push(result);
      } catch (error) {
        // 添加错误处理，不让单个监听器的错误影响其他监听器
        console.error(`Error in listener for ${eventName}:`, error);
        results.push(null); // 或者可以选择不添加结果
      }
    });
    
    return results;
  }

  removeAllListeners(eventName?: string): void {
    if (eventName) {
      // 移除指定事件的所有监听器
      this.events.delete(eventName);
    } else {
      // 移除所有事件的监听器
      this.events.clear();
    }
  }

  listenerCount(eventName: string): number {
    const listeners = this.events.get(eventName);
    return listeners ? listeners.size : 0;
  }

  eventNames(): string[] {
    // 返回所有事件名称的数组
    return Array.from(this.events.keys());
  }

  hasListeners(eventName: string): boolean {
    const listeners = this.events.get(eventName);
    return listeners ? listeners.size > 0 : false;
  }
}

// 使用示例
const emitter = new ImprovedEventEmitter();

const sub1 = emitter.subscribe('data', (data: any) => {
  console.log('处理数据:', data);
  return `processed-${data.id}`;
});

const sub2 = emitter.subscribe('data', (data: any) => {
  console.log('验证数据:', data);
  return `validated-${data.id}`;
});

console.log('监听器数量:', emitter.listenerCount('data')); // 2

const results = emitter.emit('data', { id: 1, name: 'test' });
console.log('返回结果:', results); // ['processed-1', 'validated-1']

sub1.unsubscribe();
console.log('取消订阅后监听器数量:', emitter.listenerCount('data')); // 1

export default ImprovedEventEmitter;
