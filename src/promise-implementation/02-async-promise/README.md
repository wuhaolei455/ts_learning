# 第二阶段：异步Promise实现

## 🎯 学习目标

在这个阶段，我们将为Promise添加真正的异步支持，这是Promise最核心的功能：

1. 支持异步的resolve/reject操作
2. 实现回调队列管理
3. 理解微任务（microtask）的概念
4. 完善then方法的异步处理逻辑

## 📋 核心概念

### 回调队列

当Promise处于pending状态时，通过then注册的回调需要被存储起来，等待Promise状态改变时执行：

```typescript
interface CallbackItem<T> {
  onFulfilled?: (value: T) => any;
  onRejected?: (reason: any) => any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}
```

### 微任务队列

Promise的回调应该在微任务队列中执行，确保正确的执行顺序：

```typescript
// 使用queueMicrotask或setTimeout模拟微任务
const runMicrotask = (callback: () => void) => {
  if (typeof queueMicrotask !== 'undefined') {
    queueMicrotask(callback);
  } else {
    setTimeout(callback, 0);
  }
};
```

## 🔍 实现要点

### 1. 回调存储
```typescript
private onFulfilledCallbacks: Array<() => void> = [];
private onRejectedCallbacks: Array<() => void> = [];
```

### 2. 异步状态变更
```typescript
const resolve = (value: T): void => {
  if (this.state === PromiseState.PENDING) {
    this.state = PromiseState.FULFILLED;
    this.value = value;
    // 执行所有等待的成功回调
    this.onFulfilledCallbacks.forEach(callback => callback());
  }
};
```

### 3. then方法的完整实现
```typescript
then<U>(onFulfilled?: OnFulfilled<T, U>, onRejected?: OnRejected<U>): MyPromise<U> {
  return new MyPromise<U>((resolve, reject) => {
    if (this.state === PromiseState.PENDING) {
      // 将回调添加到队列中等待执行
      this.onFulfilledCallbacks.push(() => {
        runMicrotask(() => {
          // 异步执行回调
        });
      });
    }
    // ... 其他状态处理
  });
}
```

## 💡 关键挑战

1. **异步执行时机**: 确保回调在正确的时机执行
2. **微任务模拟**: 在不同环境中正确模拟微任务行为
3. **回调队列管理**: 正确存储和执行多个then回调
4. **错误传播**: 确保错误能够正确传播到后续的Promise

## 🚀 使用示例

```typescript
const promise = new MyPromise<number>((resolve) => {
  // 异步resolve
  setTimeout(() => {
    resolve(42);
  }, 1000);
});

promise.then(value => {
  console.log(value); // 1秒后输出: 42
});
```

## 📚 学习要点

1. 理解异步编程的执行模型
2. 掌握回调队列的管理方式
3. 学习微任务和宏任务的区别
4. 理解Promise状态变更的时机

## 🔗 下一阶段

完成异步支持后，我们将在第三阶段完善then的链式调用，处理更复杂的值传递场景。
