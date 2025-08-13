// 第二步：添加取消订阅功能
type Subscription = {
    unsubscribe: () => void;
};

class ImprovedEventEmitter {
    private events: Map<string, Set<Function>> = new Map();

    subscribe(eventName: string, callback: Function): Subscription {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }
        
        this.events.get(eventName)!.add(callback);

        return {
            unsubscribe: () => {
                const listeners = this.events.get(eventName);
                if (listeners) {
                    listeners.delete(callback);
                    if (listeners.size === 0) {
                        this.events.delete(eventName);
                    }
                }
            }
        };
    }

    emit(eventName: string, ...args: any[]): any[] {
        const listeners = this.events.get(eventName);
        if (!listeners) return [];

        const results: any[] = [];
        listeners.forEach(listener => {
            try {
                const result = listener(...args);
                results.push(result);
            } catch (error) {
                console.error(`Error in listener for ${eventName}:`, error);
            }
        });

        return results;
    }

    // 移除所有监听器
    removeAllListeners(eventName?: string) {
        if (eventName) {
            this.events.delete(eventName);
        } else {
            this.events.clear();
        }
    }

    // 获取监听器数量
    listenerCount(eventName: string): number {
        return this.events.get(eventName)?.size || 0;
    }

    // 获取所有事件名称
    eventNames(): string[] {
        return Array.from(this.events.keys());
    }
}

// 使用示例
console.log('=== 改进版EventEmitter演示 ===');
const emitter = new ImprovedEventEmitter();

const subscription1 = emitter.subscribe('data', (data: any) => {
    console.log('监听器1 - Received data:', data);
    return `processed-${data.id}`;
});

const subscription2 = emitter.subscribe('data', (data: any) => {
    console.log('监听器2 - Processing data:', data.name);
    return `validated-${data.name}`;
});

console.log('监听器数量:', emitter.listenerCount('data')); // 2

const results = emitter.emit('data', { id: 1, name: 'test' });
console.log('返回结果:', results);

// 取消第一个订阅
subscription1.unsubscribe();
console.log('取消订阅后，监听器数量:', emitter.listenerCount('data')); // 1

emitter.emit('data', { id: 2, name: 'test2' }); // 只触发监听器2

// 清理所有监听器
emitter.removeAllListeners();
console.log('清理后事件列表:', emitter.eventNames()); // []

export { ImprovedEventEmitter, Subscription };
