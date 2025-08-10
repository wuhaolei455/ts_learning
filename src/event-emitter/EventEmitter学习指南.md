# EventEmitter 循序渐进学习指南

## 目录

1. [基础概念](#基础概念)
2. [简单实现](#简单实现)
3. [改进版本](#改进版本)
4. [泛型版本](#泛型版本)
5. [高级功能](#高级功能)
6. [实战应用](#实战应用)
7. [类隔离方案](#类隔离方案)

## 基础概念

EventEmitter（事件发射器）是一种观察者模式的实现，允许对象在特定事件发生时通知其他对象。

### 核心概念

- **事件名称**: 用于标识不同类型的事件
- **监听器**: 当事件发生时执行的回调函数
- **发射**: 触发事件并执行所有相关监听器

## 简单实现

### 第一步：最基础的 EventEmitter

```typescript
// examples/01-basic-event-emitter.ts
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
      this.events[eventName].forEach((callback) => {
        callback(...args);
      });
    }
  }
}

// 使用示例
const emitter = new BasicEventEmitter();

emitter.on("hello", (name: string) => {
  console.log(`Hello, ${name}!`);
});

emitter.emit("hello", "World"); // 输出: Hello, World!
```

### 学习要点

- 使用对象存储事件和对应的回调函数数组
- `on` 方法用于注册监听器
- `emit` 方法用于触发事件

## 改进版本

### 第二步：添加取消订阅功能

```typescript
// examples/02-improved-event-emitter.ts
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
      },
    };
  }

  emit(eventName: string, ...args: any[]): any[] {
    const listeners = this.events.get(eventName);
    if (!listeners) return [];

    const results: any[] = [];
    listeners.forEach((listener) => {
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
}

// 使用示例
const emitter = new ImprovedEventEmitter();

const subscription = emitter.subscribe("data", (data: any) => {
  console.log("Received data:", data);
  return data.id;
});

emitter.emit("data", { id: 1, name: "test" });
subscription.unsubscribe(); // 取消订阅
emitter.emit("data", { id: 2, name: "test2" }); // 不会触发
```

### 改进要点

- 使用 `Map` 和 `Set` 提高性能
- 返回订阅对象，支持取消订阅
- 添加错误处理
- 支持获取监听器数量

## 泛型版本

### 第三步：类型安全的 EventEmitter

```typescript
// examples/03-typed-event-emitter.ts
interface EventMap {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
  "data:update": { id: string; data: any };
  error: { message: string; code: number };
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

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.size === 0) {
      return false;
    }

    listeners.forEach((listener) => {
      try {
        (listener as (data: TEventMap[K]) => void)(data);
      } catch (error) {
        console.error(`Error in listener for ${String(event)}:`, error);
      }
    });

    return true;
  }
}

// 使用示例
const typedEmitter = new TypedEventEmitter<EventMap>();

// 类型安全的事件监听
typedEmitter.on("user:login", (data) => {
  // data 自动推断为 { userId: string; timestamp: number }
  console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});

// 一次性监听
typedEmitter.once("error", (data) => {
  console.error(`Error ${data.code}: ${data.message}`);
});

// 类型安全的事件发射
typedEmitter.emit("user:login", {
  userId: "user123",
  timestamp: Date.now(),
});
```

### 泛型版本优势

- **编译时类型检查**: 防止事件名称拼写错误
- **智能提示**: IDE 自动补全事件名和数据结构
- **重构安全**: 修改事件结构时自动更新所有使用处

## 高级功能

### 第四步：异步事件支持

```typescript
// examples/04-async-event-emitter.ts
class AsyncEventEmitter<TEventMap extends Record<string, any>> {
  private events: Map<keyof TEventMap, Set<Function>> = new Map();

  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void | Promise<void>
  ): this {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
    return this;
  }

  // 并行执行所有异步监听器
  async emitAsync<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): Promise<any[]> {
    const listeners = this.events.get(event);
    if (!listeners || listeners.size === 0) {
      return [];
    }

    const promises = Array.from(listeners).map(async (listener) => {
      try {
        return await (listener as any)(data);
      } catch (error) {
        console.error(`Async listener error for ${String(event)}:`, error);
        return null;
      }
    });

    return Promise.all(promises);
  }

  // 串行执行异步监听器
  async emitAsyncSerial<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): Promise<any[]> {
    const listeners = this.events.get(event);
    if (!listeners || listeners.size === 0) {
      return [];
    }

    const results = [];
    for (const listener of listeners) {
      try {
        const result = await (listener as any)(data);
        results.push(result);
      } catch (error) {
        console.error(`Serial async listener error:`, error);
      }
    }

    return results;
  }
}

// 使用示例
interface AsyncEventMap {
  "data:save": { id: string; data: any };
  "file:upload": { filename: string; content: Buffer };
}

const asyncEmitter = new AsyncEventEmitter<AsyncEventMap>();

// 异步监听器
asyncEmitter.on("data:save", async (data) => {
  console.log("Saving data...");
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟异步操作
  console.log(`Data ${data.id} saved!`);
});

asyncEmitter.on("data:save", async (data) => {
  console.log("Creating backup...");
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`Backup for ${data.id} created!`);
});

// 并行执行
await asyncEmitter.emitAsync("data:save", {
  id: "123",
  data: { name: "test" },
});

// 串行执行
await asyncEmitter.emitAsyncSerial("data:save", {
  id: "456",
  data: { name: "test2" },
});
```

### 第五步：中间件系统

```typescript
// examples/05-middleware-event-emitter.ts
type EventMiddleware<TEventMap> = <K extends keyof TEventMap>(
  event: K,
  data: TEventMap[K],
  next: () => void
) => void;

class MiddlewareEventEmitter<TEventMap extends Record<string, any>> {
  private events: Map<keyof TEventMap, Set<Function>> = new Map();
  private middlewares: EventMiddleware<TEventMap>[] = [];

  // 添加中间件
  use(middleware: EventMiddleware<TEventMap>): this {
    this.middlewares.push(middleware);
    return this;
  }

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

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean {
    let index = 0;
    const middlewares = this.middlewares;

    const next = (): void => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        try {
          middleware(event, data, next);
        } catch (error) {
          console.error("Middleware error:", error);
          next();
        }
      } else {
        // 执行实际的事件发射
        this.executeListeners(event, data);
      }
    };

    next();
    return true;
  }

  private executeListeners<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          (listener as any)(data);
        } catch (error) {
          console.error(`Listener error for ${String(event)}:`, error);
        }
      });
    }
  }
}

// 中间件示例
const loggingMiddleware: EventMiddleware<any> = (event, data, next) => {
  console.log(`[LOG] Event: ${String(event)}, Data:`, data);
  next();
};

const timingMiddleware: EventMiddleware<any> = (event, data, next) => {
  const start = performance.now();
  next();
  const end = performance.now();
  console.log(`[TIMING] Event ${String(event)} took ${end - start}ms`);
};

const validationMiddleware: EventMiddleware<any> = (event, data, next) => {
  if (data && typeof data === "object") {
    console.log(`[VALIDATION] Event ${String(event)} data is valid`);
    next();
  } else {
    console.error(`[VALIDATION] Invalid data for event ${String(event)}`);
  }
};

// 使用示例
const middlewareEmitter = new MiddlewareEventEmitter<EventMap>();

middlewareEmitter
  .use(loggingMiddleware)
  .use(validationMiddleware)
  .use(timingMiddleware);

middlewareEmitter.on("user:login", (data) => {
  console.log(`Processing login for user: ${data.userId}`);
});

middlewareEmitter.emit("user:login", {
  userId: "user123",
  timestamp: Date.now(),
});
```

## 实战应用

### 第六步：视频播放器事件系统

```typescript
// examples/06-video-player-events.ts
interface VideoEventMap {
  play: { currentTime: number };
  pause: { currentTime: number };
  ended: { duration: number };
  timeupdate: { currentTime: number; duration: number };
  error: { code: number; message: string };
  volumechange: { volume: number; muted: boolean };
}

class VideoEventEmitter extends TypedEventEmitter<VideoEventMap> {
  // 专门的视频事件方法
  onPlay(listener: (data: VideoEventMap["play"]) => void): this {
    return this.on("play", listener);
  }

  onPause(listener: (data: VideoEventMap["pause"]) => void): this {
    return this.on("pause", listener);
  }

  onTimeUpdate(listener: (data: VideoEventMap["timeupdate"]) => void): this {
    return this.on("timeupdate", listener);
  }

  onError(listener: (data: VideoEventMap["error"]) => void): this {
    return this.on("error", listener);
  }

  // 便捷的发射方法
  emitPlay(currentTime: number): boolean {
    return this.emit("play", { currentTime });
  }

  emitPause(currentTime: number): boolean {
    return this.emit("pause", { currentTime });
  }

  emitTimeUpdate(currentTime: number, duration: number): boolean {
    return this.emit("timeupdate", { currentTime, duration });
  }

  emitError(code: number, message: string): boolean {
    return this.emit("error", { code, message });
  }
}

// 模拟视频播放器
class VideoPlayer {
  private eventEmitter = new VideoEventEmitter();
  private currentTime = 0;
  private duration = 100;
  private isPlaying = false;
  private timer?: NodeJS.Timeout;

  get events() {
    return this.eventEmitter;
  }

  play(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.eventEmitter.emitPlay(this.currentTime);

    // 模拟时间更新
    this.timer = setInterval(() => {
      this.currentTime += 0.1;
      this.eventEmitter.emitTimeUpdate(this.currentTime, this.duration);

      if (this.currentTime >= this.duration) {
        this.stop();
        this.eventEmitter.emit("ended", { duration: this.duration });
      }
    }, 100);
  }

  pause(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.eventEmitter.emitPause(this.currentTime);

    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private stop(): void {
    this.isPlaying = false;
    this.currentTime = 0;
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  seek(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
    this.eventEmitter.emitTimeUpdate(this.currentTime, this.duration);
  }
}

// 使用示例
const player = new VideoPlayer();

// 监听播放事件
player.events.onPlay((data) => {
  console.log(`▶️ 开始播放，当前时间: ${data.currentTime.toFixed(1)}s`);
});

// 监听暂停事件
player.events.onPause((data) => {
  console.log(`⏸️ 暂停播放，当前时间: ${data.currentTime.toFixed(1)}s`);
});

// 监听时间更新（节流显示）
let lastLogTime = 0;
player.events.onTimeUpdate((data) => {
  if (data.currentTime - lastLogTime >= 1) {
    console.log(
      `⏱️ 时间更新: ${data.currentTime.toFixed(1)}s / ${data.duration}s`
    );
    lastLogTime = Math.floor(data.currentTime);
  }
});

// 监听播放结束
player.events.on("ended", (data) => {
  console.log(`🏁 播放结束，总时长: ${data.duration}s`);
});

// 模拟播放操作
console.log("开始演示视频播放器事件系统...");
player.play();

setTimeout(() => {
  player.pause();
  console.log("3秒后继续播放...");
  setTimeout(() => {
    player.play();
  }, 3000);
}, 2000);
```

## 类隔离方案

当项目中有多个 EventEmitter 实现时，可以采用以下隔离方案：

### 方案 1: 命名空间隔离

```typescript
// examples/07-namespace-isolation.ts
namespace BasicEmitter {
  export class EventEmitter {
    private events: { [key: string]: Function[] } = {};

    on(event: string, callback: Function) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
    }

    emit(event: string, ...args: any[]) {
      if (this.events[event]) {
        this.events[event].forEach((cb) => cb(...args));
      }
    }
  }
}

namespace AdvancedEmitter {
  export class EventEmitter {
    private events: Map<string, Set<Function>> = new Map();

    subscribe(event: string, callback: Function) {
      if (!this.events.has(event)) {
        this.events.set(event, new Set());
      }
      this.events.get(event)!.add(callback);

      return {
        unsubscribe: () => {
          this.events.get(event)?.delete(callback);
        },
      };
    }

    emit(event: string, ...args: any[]) {
      this.events.get(event)?.forEach((cb) => cb(...args));
    }
  }
}

// 使用时明确指定命名空间
const basicEmitter = new BasicEmitter.EventEmitter();
const advancedEmitter = new AdvancedEmitter.EventEmitter();
```

### 方案 2: 模块隔离 + 别名

```typescript
// basic-event-emitter.ts
export class EventEmitter {
  // 基础实现
}

// advanced-event-emitter.ts
export class EventEmitter {
  // 高级实现
}

// main.ts
import { EventEmitter as BasicEventEmitter } from "./basic-event-emitter";
import { EventEmitter as AdvancedEventEmitter } from "./advanced-event-emitter";

const basicEmitter = new BasicEventEmitter();
const advancedEmitter = new AdvancedEventEmitter();
```

### 方案 3: 类名差异化

```typescript
// examples/08-class-name-isolation.ts
class BasicEventEmitter {
  private events: { [key: string]: Function[] } = {};
  // ... 基础实现
}

class AdvancedEventEmitter {
  private events: Map<string, Set<Function>> = new Map();
  // ... 高级实现
}

class TypedEventEmitter<T extends Record<string, any>> {
  private events: Map<keyof T, Set<Function>> = new Map();
  // ... 泛型实现
}

// 清晰的使用
const basic = new BasicEventEmitter();
const advanced = new AdvancedEventEmitter();
const typed = new TypedEventEmitter<EventMap>();
```

### 方案 4: 工厂函数模式

```typescript
// examples/09-factory-pattern.ts
interface EventEmitterFactory {
  createBasic(): BasicEventEmitter;
  createAdvanced(): AdvancedEventEmitter;
  createTyped<T extends Record<string, any>>(): TypedEventEmitter<T>;
}

class EventEmitterFactoryImpl implements EventEmitterFactory {
  createBasic(): BasicEventEmitter {
    return new BasicEventEmitter();
  }

  createAdvanced(): AdvancedEventEmitter {
    return new AdvancedEventEmitter();
  }

  createTyped<T extends Record<string, any>>(): TypedEventEmitter<T> {
    return new TypedEventEmitter<T>();
  }
}

// 使用工厂
const factory = new EventEmitterFactoryImpl();
const basicEmitter = factory.createBasic();
const advancedEmitter = factory.createAdvanced();
const typedEmitter = factory.createTyped<EventMap>();
```

## 学习总结

### 进阶路径

1. **基础版本** → 理解核心概念
2. **改进版本** → 学习最佳实践
3. **泛型版本** → 掌握类型安全
4. **异步版本** → 处理异步场景
5. **中间件版本** → 实现可扩展架构
6. **实战应用** → 解决真实问题

### 关键要点

- **类型安全**: 使用泛型提供编译时检查
- **错误处理**: 防止单个监听器错误影响其他监听器
- **内存管理**: 及时清理不需要的监听器
- **性能优化**: 使用 Map 和 Set 提高查找效率
- **可扩展性**: 通过中间件模式支持功能扩展

### 最佳实践

- 始终提供取消订阅机制
- 使用类型安全的事件定义
- 合理使用异步事件处理
- 实现适当的错误处理和日志记录
- 考虑事件的生命周期管理

通过这个循序渐进的学习路径，你可以从最基础的概念开始，逐步掌握 EventEmitter 的各种高级特性和实际应用场景。
