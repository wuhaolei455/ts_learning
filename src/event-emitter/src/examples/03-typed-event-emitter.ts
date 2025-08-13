// 第三步：类型安全的EventEmitter
interface EventMap {
    'user:login': { userId: string; timestamp: number };
    'user:logout': { userId: string };
    'data:update': { id: string; data: any };
    'error': { message: string; code: number };
}

class TypedEventEmitter<TEventMap extends Record<string, any> = EventMap> {
    private events: Map<keyof TEventMap, Set<Function>> = new Map();

    on<K extends keyof TEventMap>(
        event: K,
        listener: (data: TEventMap[K]) => void
    ): this {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)!.add(listener);
        return this;
    }

    once<K extends keyof TEventMap>(
        event: K,
        listener: (data: TEventMap[K]) => void
    ): this {
        const onceWrapper = (data: TEventMap[K]) => {
            listener(data);
            this.off(event, onceWrapper);
        };
        return this.on(event, onceWrapper);
    }

    off<K extends keyof TEventMap>(
        event: K,
        listener: (data: TEventMap[K]) => void
    ): this {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.delete(listener);
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
        const listeners = this.events.get(event);
        if (!listeners || listeners.size === 0) {
            return false;
        }

        listeners.forEach(listener => {
            try {
                (listener as (data: TEventMap[K]) => void)(data);
            } catch (error) {
                console.error(`Error in listener for ${String(event)}:`, error);
            }
        });

        return true;
    }

    listenerCount<K extends keyof TEventMap>(event: K): number {
        return this.events.get(event)?.size || 0;
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
console.log('=== 类型安全EventEmitter演示 ===');
const typedEmitter = new TypedEventEmitter<EventMap>();

// 类型安全的事件监听
typedEmitter.on('user:login', (data) => {
    // data 自动推断为 { userId: string; timestamp: number }
    console.log(`用户 ${data.userId} 在 ${new Date(data.timestamp).toLocaleTimeString()} 登录`);
});

// 链式调用
typedEmitter
    .on('user:logout', (data) => {
        console.log(`用户 ${data.userId} 已登出`);
    })
    .on('data:update', (data) => {
        console.log(`数据 ${data.id} 已更新:`, data.data);
    });

// 一次性监听
typedEmitter.once('error', (data) => {
    console.error(`错误 ${data.code}: ${data.message}`);
});

// 类型安全的事件发射
typedEmitter.emit('user:login', {
    userId: 'user123',
    timestamp: Date.now()
});

typedEmitter.emit('data:update', {
    id: 'data456',
    data: { name: 'test', value: 42 }
});

typedEmitter.emit('error', {
    code: 404,
    message: '资源未找到'
});

// 再次发射error事件，但不会触发（因为是once）
typedEmitter.emit('error', {
    code: 500,
    message: '服务器错误'
});

typedEmitter.emit('user:logout', { userId: 'user123' });

// 演示类型检查（这些会在编译时报错）
// typedEmitter.emit('user:login', { userId: 123 }); // 错误：userId应该是string
// typedEmitter.emit('unknown:event', {}); // 错误：未定义的事件类型

export { EventMap, TypedEventEmitter };

