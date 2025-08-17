# 第一阶段：基础Promise实现

## 🎯 学习目标

在这个阶段，我们将实现一个最基础的Promise类，理解Promise的核心概念：

1. Promise的三种状态：pending、fulfilled、rejected
2. 状态的不可逆性（一旦改变就不能再变）
3. 基础的then方法实现
4. TypeScript泛型在Promise中的应用

## 📋 核心概念

### Promise状态

```typescript
enum PromiseState {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected'
}
```

- **pending**: 初始状态，既不是成功也不是失败
- **fulfilled**: 操作成功完成
- **rejected**: 操作失败

### 状态转换规则

- pending → fulfilled（通过resolve）
- pending → rejected（通过reject）
- fulfilled和rejected状态不能再改变

## 🔍 实现要点

### 1. 泛型支持
```typescript
class MyPromise<T> {
  // T 表示 Promise resolve 的值的类型
}
```

### 2. 构造函数
```typescript
constructor(executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void)
```

### 3. then方法的类型签名
```typescript
then<U>(
  onFulfilled?: (value: T) => U | MyPromise<U>,
  onRejected?: (reason: any) => U | MyPromise<U>
): MyPromise<U>
```

## 💡 关键挑战

1. **类型安全**: 确保resolve的值类型和then回调的参数类型匹配
2. **状态管理**: 防止状态的重复改变
3. **错误处理**: 正确处理executor中的同步错误
4. **链式调用**: then方法需要返回新的Promise实例

## 🚀 使用示例

```typescript
const promise = new MyPromise<number>((resolve, reject) => {
  // 同步resolve
  resolve(42);
});

promise.then(value => {
  console.log(value); // 42
  return value * 2;
}).then(value => {
  console.log(value); // 84
});
```

## 📚 学习要点

1. 理解Promise构造函数的执行时机（立即执行）
2. 掌握状态管理的重要性
3. 学习TypeScript泛型在异步编程中的应用
4. 理解then方法的基本工作原理

## 🔗 下一阶段

完成基础实现后，我们将在第二阶段添加异步支持，让Promise能够处理真正的异步操作。
