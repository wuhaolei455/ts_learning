// 第一步：最基础的EventEmitter
class BasicEventEmitter {
    private events: { [key: string]: Function[] } = {};

    // 添加事件监听器
    on(eventName: string, callback: Function) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    // 触发事件
    emit(eventName: string, ...args: any[]) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                callback(...args);
            });
        }
    }
}

// 使用示例
const emitter = new BasicEventEmitter();

emitter.on('hello', (name: string) => {
    console.log(`Hello, ${name}!`);
});

emitter.on('hello', (name: string) => {
    console.log(`Welcome, ${name}!`);
});

console.log('=== 基础EventEmitter演示 ===');
emitter.emit('hello', 'World'); // 输出两条消息

// 测试多个事件
emitter.on('goodbye', (name: string) => {
    console.log(`Goodbye, ${name}!`);
});

emitter.emit('goodbye', 'World');

export { BasicEventEmitter };
