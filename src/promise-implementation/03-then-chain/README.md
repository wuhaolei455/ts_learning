# 第三阶段：完善Then链式调用

## 🎯 学习目标

在这个阶段，我们将完善then方法的链式调用机制，处理各种复杂的值传递场景：

1. 完善Promise解析过程（Resolution Procedure）
2. 处理thenable对象
3. 实现值的透传（value透传和错误透传）
4. 优化链式调用的类型推断

## 📋 核心概念

### Promise Resolution Procedure

这是Promise/A+规范中最重要的部分，定义了如何处理then回调的返回值：

```typescript
function resolvePromise<T>(
  promise: MyPromise<T>,
  x: any,
  resolve: (value: T) => void,
  reject: (reason: any) => void
): void
```

### Thenable对象

任何具有then方法的对象都被认为是thenable：

```typescript
interface Thenable<T> {
  then(
    onFulfilled?: (value: T) => any,
    onRejected?: (reason: any) => any
  ): any;
}
```

### 值透传

当then方法没有提供相应的回调时，值应该透传到下一个Promise：

```typescript
// 成功值透传
promise.then().then(value => console.log(value));

// 错误透传  
promise.then(null, null).catch(error => console.log(error));
```

## 🔍 实现要点

### 1. Promise Resolution Procedure
```typescript
function resolvePromise<T>(promise: MyPromise<T>, x: any, resolve: (value: T) => void, reject: (reason: any) => void): void {
  // 1. 如果promise和x指向同一对象，抛出TypeError
  if (promise === x) {
    reject(new TypeError('Chaining cycle detected'));
    return;
  }

  // 2. 如果x是Promise实例
  if (x instanceof MyPromise) {
    x.then(resolve, reject);
    return;
  }

  // 3. 如果x是对象或函数
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 处理thenable对象
  }

  // 4. 否则，直接resolve x
  resolve(x);
}
```

### 2. Thenable处理
```typescript
try {
  const then = x.then;
  if (typeof then === 'function') {
    // 调用thenable的then方法
    then.call(x, resolve, reject);
  } else {
    resolve(x);
  }
} catch (error) {
  reject(error);
}
```

### 3. 防止重复调用
```typescript
let called = false;
const resolveOnce = (value: T) => {
  if (called) return;
  called = true;
  resolve(value);
};
```

## 💡 关键挑战

1. **循环引用检测**: 防止Promise链中的循环引用
2. **Thenable兼容性**: 正确处理各种thenable对象
3. **类型安全**: 在复杂的链式调用中保持类型安全
4. **错误边界**: 正确处理各种异常情况

## 🚀 使用示例

```typescript
// 复杂的链式调用
promise
  .then(value => ({ data: value }))
  .then(obj => obj.data * 2)
  .then(result => new MyPromise(resolve => resolve(result + 1)))
  .then(final => console.log(final));

// Thenable对象处理
promise.then(() => ({
  then(onFulfilled: Function) {
    onFulfilled('thenable result');
  }
}));
```

## 📚 学习要点

1. 理解Promise Resolution Procedure的重要性
2. 掌握thenable对象的处理方式
3. 学习如何防止循环引用
4. 理解值透传的机制

## 🔗 下一阶段

完成链式调用优化后，我们将在第四阶段完善错误处理机制，包括未捕获错误的处理。
