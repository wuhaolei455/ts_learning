# TypeScript Promise实现学习指南

## 🎯 项目概述

这是一个循序渐进的TypeScript Promise实现教程，从基础概念到完整的Promise/A+规范实现。通过7个阶段的学习，你将深入理解Promise的内部工作原理，掌握TypeScript泛型在异步编程中的应用。

## 📚 学习路径

### 阶段一：基础Promise（01-basic-promise）
**学习目标：** 理解Promise的基本概念
- Promise的三种状态：pending、fulfilled、rejected
- 状态的不可逆性
- 基础的then方法实现
- TypeScript泛型的基础应用

**关键代码：**
```typescript
class MyPromise<T> {
  private state: PromiseState = PromiseState.PENDING;
  private value: T | undefined = undefined;
  private reason: any = undefined;
}
```

**学习重点：**
- 理解Promise构造函数的执行时机
- 掌握状态管理的重要性
- 学习TypeScript泛型的基础用法

### 阶段二：异步Promise（02-async-promise）
**学习目标：** 添加真正的异步支持
- 回调队列管理
- 微任务执行模型
- 异步状态变更处理

**关键代码：**
```typescript
private onFulfilledCallbacks: Array<() => void> = [];
private onRejectedCallbacks: Array<() => void> = [];

// 异步执行回调
runMicrotask(() => {
  this.onFulfilledCallbacks.forEach(callback => callback());
});
```

**学习重点：**
- 理解异步编程的执行模型
- 掌握回调队列的管理方式
- 学习微任务和宏任务的区别

### 阶段三：Then链式调用（03-then-chain）
**学习目标：** 完善then方法的链式调用机制
- Promise Resolution Procedure
- Thenable对象处理
- 循环引用检测
- 值透传机制

**关键代码：**
```typescript
function resolvePromise<T>(
  promise: MyPromise<T>,
  x: any,
  resolve: (value: T) => void,
  reject: (reason: any) => void
): void {
  // 严格按照Promise/A+规范实现
}
```

**学习重点：**
- 理解Promise Resolution Procedure的重要性
- 掌握thenable对象的处理方式
- 学习如何防止循环引用

### 阶段四：错误处理（已整合到其他阶段）
**学习目标：** 完善错误处理机制
- 异常捕获和传播
- 错误恢复机制
- 未捕获错误处理

### 阶段五：静态方法（05-static-methods）
**学习目标：** 实现Promise的静态方法
- Promise.resolve() 和 Promise.reject()
- Promise.all() 和 Promise.race()
- Promise.allSettled() 和 Promise.any()
- 复杂泛型的应用

**关键代码：**
```typescript
static all<T extends readonly unknown[] | []>(
  values: T
): MyPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  // 类型安全的Promise.all实现
}
```

**学习重点：**
- 理解静态方法的设计模式
- 掌握复杂泛型的使用
- 学习Promise组合操作的原理

### 阶段六：Promise工具（已整合到阶段五）

### 阶段七：Promise/A+兼容（07-promises-aplus）
**学习目标：** 创建完全符合Promise/A+规范的实现
- 严格按照Promise/A+规范实现
- 通过官方测试套件验证
- 处理所有边界情况

**关键代码：**
```typescript
// 严格按照规范的状态管理
if (this.state === PENDING) {
  this.state = FULFILLED;
  this.value = value;
}
```

**学习重点：**
- 理解规范的严格性和重要性
- 掌握异步编程的最佳实践
- 学习如何编写可测试的代码

## 🛠️ 实践指南

### 环境准备
```bash
cd src/promise-implementation
npm install
```

### 运行示例
```bash
# 运行单个阶段的演示
npm run demo:01  # 基础Promise演示
npm run demo:02  # 异步Promise演示
npm run demo:03  # Then链式调用演示
npm run demo:05  # 静态方法演示
npm run demo:07  # Promise/A+演示

# 运行所有演示
npm run demo:all
```

### 运行测试
```bash
# 运行单个阶段的测试
npm run test:01  # 基础Promise测试
npm run test:02  # 异步Promise测试
npm run test:03  # Then链式调用测试
npm run test:05  # 静态方法测试
npm run test:07  # Promise/A+测试

# 运行所有测试
npm run test

# 运行Promise/A+官方测试套件
npm run test:aplus
```

## 📖 核心概念详解

### 1. Promise状态机
```
pending ──resolve──> fulfilled
   │
   └─────reject───> rejected
```

- **pending**: 初始状态，可以转换到fulfilled或rejected
- **fulfilled**: 操作成功完成，有一个value
- **rejected**: 操作失败，有一个reason

### 2. 微任务执行模型
```typescript
// Promise的回调总是异步执行
runMicrotask(() => {
  // 执行then回调
});
```

### 3. Promise Resolution Procedure
这是Promise/A+规范的核心，定义了如何处理then回调的返回值：
1. 检查循环引用
2. 处理Promise实例
3. 处理thenable对象
4. 处理普通值

### 4. 类型系统的应用
```typescript
// 泛型Promise
class MyPromise<T> {
  then<U>(onFulfilled?: (value: T) => U): MyPromise<U>
}

// 复杂的静态方法类型
static all<T extends readonly unknown[]>(
  values: T
): MyPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }>
```

## 🎯 学习检查清单

### 基础理解
- [ ] 理解Promise的三种状态
- [ ] 掌握状态转换的规则
- [ ] 理解then方法的基本工作原理
- [ ] 掌握TypeScript泛型的基础用法

### 异步编程
- [ ] 理解微任务和宏任务的区别
- [ ] 掌握回调队列的管理
- [ ] 理解异步执行的时机
- [ ] 学会处理异步错误

### 高级特性
- [ ] 掌握Promise Resolution Procedure
- [ ] 理解thenable对象的处理
- [ ] 学会防止循环引用
- [ ] 掌握复杂的链式调用

### 静态方法
- [ ] 实现Promise.resolve/reject
- [ ] 实现Promise.all/race
- [ ] 实现Promise.allSettled/any
- [ ] 掌握复杂泛型的应用

### 规范兼容
- [ ] 理解Promise/A+规范
- [ ] 通过官方测试套件
- [ ] 处理所有边界情况
- [ ] 优化性能和内存使用

## 🔧 调试技巧

### 1. 状态检查
```typescript
console.log('Promise状态:', promise.getState());
console.log('Promise值:', promise.getValue());
console.log('等待的回调数:', promise.getPendingCallbacksCount());
```

### 2. 执行顺序追踪
```typescript
const order: string[] = [];
promise.then(() => order.push('then1'));
order.push('sync');
setTimeout(() => console.log(order), 0);
```

### 3. 错误追踪
```typescript
promise.catch(error => {
  console.error('错误类型:', error.constructor.name);
  console.error('错误消息:', error.message);
  console.error('错误堆栈:', error.stack);
});
```

## 🚀 进阶学习

### 1. 性能优化
- 内存泄漏预防
- 回调队列优化
- 垃圾回收友好的实现

### 2. 扩展功能
- 取消机制
- 进度通知
- 超时处理
- 重试机制

### 3. 生态系统集成
- 与async/await的配合
- 与Observable的关系
- 在不同环境中的适配

## 📚 参考资料

1. [Promise/A+规范](https://promisesaplus.com/)
2. [ECMAScript Promise规范](https://tc39.es/ecma262/#sec-promise-objects)
3. [TypeScript泛型文档](https://www.typescriptlang.org/docs/handbook/2/generics.html)
4. [JavaScript异步编程](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous)

## 💡 常见问题

### Q: 为什么Promise回调必须异步执行？
A: 这是为了保证执行顺序的一致性，避免同步和异步Promise的行为差异。

### Q: 什么是thenable对象？
A: 任何具有then方法的对象都被认为是thenable，Promise需要能够处理这些对象。

### Q: 为什么需要Promise Resolution Procedure？
A: 这是为了统一处理then回调返回的各种值类型，包括Promise、thenable和普通值。

### Q: 如何处理循环引用？
A: 检查返回值是否与当前Promise相同，如果是则抛出TypeError。

## 🎉 完成标志

当你能够：
1. 从零实现一个符合Promise/A+规范的Promise
2. 通过所有官方测试用例
3. 理解每个实现细节的原因
4. 能够解释Promise的工作原理

恭喜你！你已经深入掌握了Promise的内部机制和TypeScript的高级特性！
