// 第一阶段：基础EventEmitter的参考实现
// 注意：这是参考答案，建议先自己尝试实现

export class BasicEventEmitter {
  private events: { [key: string]: Function[] } = {};

  constructor() {
    // 初始化事件存储（已在属性声明中完成）
  }

  on(eventName: string, callback: Function): void {
    // 如果事件不存在，创建一个空数组
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    
    // 将回调函数添加到对应事件的数组中
    this.events[eventName].push(callback);
  }

  emit(eventName: string, ...args: any[]): void {
    // 检查事件是否存在
    if (this.events[eventName]) {
      // 遍历所有监听器并调用它们
      this.events[eventName].forEach(callback => {
        callback(...args);
      });
    }
  }

  listenerCount(eventName: string): number {
    // 返回指定事件的监听器数量
    return this.events[eventName] ? this.events[eventName].length : 0;
  }
}

// 使用示例
const emitter = new BasicEventEmitter();

emitter.on('test', (message: string) => {
  console.log(`收到消息: ${message}`);
});

emitter.on('test', (message: string) => {
  console.log(`再次处理: ${message}`);
});

emitter.emit('test', 'Hello World!');
console.log(`监听器数量: ${emitter.listenerCount('test')}`);

export default BasicEventEmitter;
