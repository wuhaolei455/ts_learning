# 第五阶段：静态方法实现

## 🎯 学习目标

在这个阶段，我们将实现Promise的所有重要静态方法，使我们的Promise实现更加完整：

1. `Promise.resolve()` - 创建已解决的Promise
2. `Promise.reject()` - 创建已拒绝的Promise  
3. `Promise.all()` - 等待所有Promise完成
4. `Promise.race()` - 等待第一个Promise完成
5. `Promise.allSettled()` - 等待所有Promise settled
6. `Promise.any()` - 等待第一个成功的Promise

## 📋 核心概念

### Promise.resolve()

可以处理多种输入类型：
- 普通值：直接resolve
- Promise实例：返回该Promise
- Thenable对象：转换为Promise

### Promise.all()

- 所有Promise都成功时才成功
- 任意一个失败就立即失败
- 保持结果顺序
- 支持泛型推断

### Promise.race()

- 第一个settled的Promise决定结果
- 支持空数组（永远pending）

## 🔍 实现要点

### 1. Promise.resolve的类型安全实现
```typescript
static resolve<T>(value: T | MyPromise<T> | Thenable<T>): MyPromise<T> {
  if (value instanceof MyPromise) {
    return value;
  }
  
  return new MyPromise<T>((resolve, reject) => {
    resolvePromise(new MyPromise(() => {}), value, resolve, reject);
  });
}
```

### 2. Promise.all的泛型支持
```typescript
static all<T extends readonly unknown[] | []>(
  values: T
): MyPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  // 实现逻辑
}
```

### 3. 错误处理和边界情况
- 空数组处理
- 类型转换
- 错误传播

## 💡 关键挑战

1. **类型推断**: 确保静态方法有正确的类型推断
2. **泛型约束**: 处理复杂的泛型场景
3. **边界情况**: 空数组、非Promise值等
4. **性能优化**: 避免不必要的Promise创建

## 🚀 使用示例

```typescript
// Promise.resolve
const resolved = MyPromise.resolve(42);
const fromPromise = MyPromise.resolve(existingPromise);

// Promise.all
const allResults = await MyPromise.all([
  MyPromise.resolve(1),
  MyPromise.resolve('hello'),
  MyPromise.resolve(true)
]); // 类型: [number, string, boolean]

// Promise.race
const firstResult = await MyPromise.race([
  delay(100).then(() => 'fast'),
  delay(200).then(() => 'slow')
]);
```

## 📚 学习要点

1. 理解静态方法的设计模式
2. 掌握复杂泛型的使用
3. 学习错误处理的最佳实践
4. 理解Promise组合操作的原理

## 🔗 下一阶段

完成静态方法后，我们将在下一阶段实现Promise/A+测试兼容性，确保我们的实现符合标准。
