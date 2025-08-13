# EventEmitter TDD 学习指南

## 🎯 学习目标

通过测试驱动开发（TDD）的方式，循序渐进地实现 EventEmitter 的各种功能，从基础版本到高级特性。

## 📚 TDD 学习流程

### 1. 红绿重构循环

- **红（Red）**: 运行测试，看到失败
- **绿（Green）**: 编写最简代码让测试通过
- **重构（Refactor）**: 优化代码结构

### 2. 学习阶段

#### 🟡 第一阶段：基础 EventEmitter

**文件**: `01-basic-event-emitter.test.ts`

**目标功能**:

- [x] 创建 EventEmitter 实例
- [x] 添加事件监听器 (`on`)
- [x] 触发事件 (`emit`)
- [x] 获取监听器数量 (`listenerCount`)
- [x] 处理多个监听器
- [x] 处理不存在的事件
- [x] 传递多个参数
- [x] 保持监听器执行顺序

**实现提示**:

```typescript
class BasicEventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(eventName: string, callback: Function): void {
    // TODO: 实现添加监听器逻辑
  }

  emit(eventName: string, ...args: any[]): void {
    // TODO: 实现触发事件逻辑
  }
}
```

#### 🟠 第二阶段：改进版 EventEmitter

**文件**: `02-improved-event-emitter.test.ts`

**新增功能**:

- [x] 订阅模式 (`subscribe` 返回 `Subscription`)
- [x] 取消订阅 (`unsubscribe`)
- [x] 使用 Map 和 Set 优化性能
- [x] 收集监听器返回值
- [x] 错误处理
- [x] 批量移除监听器 (`removeAllListeners`)
- [x] 获取所有事件名称 (`eventNames`)
- [x] 检查是否有监听器 (`hasListeners`)
- [x] 防止重复添加相同监听器

**实现提示**:

```typescript
interface Subscription {
  unsubscribe: () => void;
}

class ImprovedEventEmitter {
  private events: Map<string, Set<Function>> = new Map();

  subscribe(eventName: string, callback: Function): Subscription {
    // TODO: 返回包含unsubscribe方法的对象
  }
}
```

#### 🔵 第三阶段：类型安全 EventEmitter

**文件**: `03-typed-event-emitter.test.ts`

**新增功能**:

- [x] 泛型类型约束
- [x] 编译时类型检查
- [x] 链式调用支持
- [x] 一次性监听器 (`once`)
- [x] 类型安全的监听器移除 (`off`)
- [x] 自定义事件映射支持

**实现提示**:

```typescript
interface EventMap {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
}

class TypedEventEmitter<TEventMap extends Record<string, any> = EventMap> {
  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    // TODO: 实现类型安全的监听器添加
  }
}
```

#### 🟢 第四阶段：异步 EventEmitter

**文件**: `04-async-event-emitter.test.ts`

**新增功能**:

- [x] 异步监听器支持
- [x] 并行异步执行 (`emitAsync`)
- [x] 串行异步执行 (`emitAsyncSerial`)
- [x] 异步错误处理
- [x] 混合同步/异步监听器
- [x] Promise 返回值收集

**实现提示**:

```typescript
class AsyncEventEmitter<TEventMap extends Record<string, any>> {
  async emitAsync<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): Promise<any[]> {
    // TODO: 使用Promise.all并行执行
  }

  async emitAsyncSerial<K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K]
  ): Promise<any[]> {
    // TODO: 使用for循环串行执行
  }
}
```

## 🚀 开始学习

### 1. 运行单个阶段测试

```bash
# 第一阶段
npx ts-node --files src/event-emitter/tdd/01-basic-event-emitter.test.ts

# 第二阶段
npx ts-node --files src/event-emitter/tdd/02-improved-event-emitter.test.ts

# 第三阶段
npx ts-node --files src/event-emitter/tdd/03-typed-event-emitter.test.ts

# 第四阶段
npx ts-node --files src/event-emitter/tdd/04-async-event-emitter.test.ts
```

### 2. 运行所有测试

```bash
npx ts-node --files src/event-emitter/tdd/run-all-tests.ts
```

## 📝 学习建议

### 1. 按阶段学习

- 先完成第一阶段的所有测试
- 确保理解每个概念后再进入下一阶段
- 不要急于实现高级功能

### 2. 理解测试用例

- 仔细阅读每个测试的描述
- 理解测试期望的行为
- 思考为什么需要这个功能

### 3. 实现策略

- 先让测试通过（最简实现）
- 再优化代码结构
- 考虑边界情况

### 4. 调试技巧

- 使用`console.log`输出中间状态
- 单独运行失败的测试
- 检查类型错误和运行时错误

## 🧪 测试框架说明

### 断言方法

```typescript
Assert.equal(actual, expected); // 相等断言
Assert.true(value); // 真值断言
Assert.false(value); // 假值断言
Assert.deepEqual(actual, expected); // 深度相等断言
Assert.arrayContains(array, item); // 数组包含断言
Assert.greaterThan(a, b); // 大于断言
Assert.lessThan(a, b); // 小于断言
```

### 模拟函数

```typescript
const mock = createMock<(arg: string) => void>();
mock.toHaveBeenCalled(); // 检查是否被调用
mock.toHaveBeenCalledTimes(2); // 检查调用次数
mock.toHaveBeenCalledWith("arg"); // 检查调用参数
mock.getCallArgs(0); // 获取第N次调用的参数
```

## 🎓 进阶学习

完成所有阶段后，你可以：

1. **扩展功能**: 添加中间件、优先级、过滤器等
2. **性能优化**: 分析和优化关键路径
3. **实际应用**: 将 EventEmitter 应用到实际项目中
4. **源码学习**: 研究 Node.js EventEmitter 源码

## 🔍 常见问题

### Q: 测试失败怎么办？

A:

1. 仔细阅读错误信息
2. 检查实现逻辑
3. 确认是否理解测试需求
4. 使用调试工具定位问题

### Q: 如何处理 TypeScript 类型错误？

A:

1. 理解泛型约束的作用
2. 确保事件映射接口正确定义
3. 检查方法签名是否匹配

### Q: 异步测试比较复杂怎么办？

A:

1. 先理解 Promise 和 async/await
2. 区分并行和串行执行的差异
3. 注意错误处理的重要性

## 📈 学习成果

通过完成这个 TDD 学习过程，你将掌握：

- ✅ 测试驱动开发的基本流程
- ✅ EventEmitter 的核心概念和实现
- ✅ TypeScript 泛型和类型安全
- ✅ 异步编程和 Promise 处理
- ✅ 错误处理和边界情况考虑
- ✅ 代码重构和优化技巧

开始你的 TDD 学习之旅吧！🚀
