# ES6 Generator 完整学习指南

## 目录

1. [什么是 Generator](#什么是-generator)
2. [基础语法](#基础语法)
3. [核心概念](#核心概念)
4. [实用案例](#实用案例)
5. [进阶技巧](#进阶技巧)
6. [最佳实践](#最佳实践)

---

## 什么是 Generator

Generator（生成器）是 ES6 引入的一种特殊函数，它可以：

- **暂停和恢复执行**：使用 `yield` 关键字暂停执行
- **返回迭代器**：返回一个符合迭代器协议的对象
- **双向通信**：通过 `next()` 方法传递值
- **惰性求值**：只在需要时才计算下一个值

### 为什么需要 Generator？

1. **简化迭代器实现**：不需要手动实现 `Symbol.iterator`
2. **异步流程控制**：在 async/await 出现前的解决方案
3. **惰性求值**：处理大量或无限数据
4. **状态管理**：实现状态机等复杂逻辑

---

## 基础语法

### 1. 声明 Generator 函数

```javascript
// 使用 function* 语法
function* myGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

// 也可以作为方法
const obj = {
  *generatorMethod() {
    yield "hello";
  },
};

// 类方法
class MyClass {
  *generatorMethod() {
    yield "world";
  }
}
```

### 2. 调用 Generator 函数

```javascript
const gen = myGenerator();

console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

### 3. yield 表达式

```javascript
function* generatorWithInput() {
  const a = yield "First"; // yield 返回值由 next() 传入
  const b = yield "Second";
  return a + b;
}

const gen = generatorWithInput();
gen.next(); // { value: 'First', done: false }
gen.next(10); // { value: 'Second', done: false }, a = 10
gen.next(20); // { value: 30, done: true }, b = 20
```

---

## 核心概念

### 1. 迭代器协议

Generator 返回的对象实现了迭代器协议：

```javascript
interface Iterator<T> {
  next(value?: any): IteratorResult<T>;
  return?(value?: any): IteratorResult<T>;
  throw?(e?: any): IteratorResult<T>;
}

interface IteratorResult<T> {
  value: T;
  done: boolean;
}
```

### 2. 遍历 Generator

```javascript
function* numbers() {
  yield 1;
  yield 2;
  yield 3;
}

// for...of 循环
for (let num of numbers()) {
  console.log(num); // 1, 2, 3
}

// 扩展运算符
const arr = [...numbers()]; // [1, 2, 3]

// Array.from
const arr2 = Array.from(numbers()); // [1, 2, 3]

// 解构赋值
const [first, second] = numbers(); // first = 1, second = 2
```

### 3. yield\*（委托生成器）

```javascript
function* inner() {
  yield "a";
  yield "b";
}

function* outer() {
  yield 1;
  yield* inner(); // 委托给另一个 Generator
  yield 2;
}

console.log([...outer()]); // [1, 'a', 'b', 2]

// yield* 也可以用于任何可迭代对象
function* gen() {
  yield* [1, 2, 3]; // 数组
  yield* "hello"; // 字符串
  yield* new Set([4, 5]); // Set
}
```

### 4. 错误处理

```javascript
function* generatorWithError() {
  try {
    yield 1;
    yield 2;
  } catch (e) {
    console.log("捕获错误:", e);
  }
  yield 3;
}

const gen = generatorWithError();
gen.next(); // { value: 1, done: false }
gen.throw("错误"); // { value: 3, done: false }
```

### 5. 提前终止

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const g = gen();
g.next(); // { value: 1, done: false }
g.return("结束"); // { value: '结束', done: true }
g.next(); // { value: undefined, done: true }
```

---

## 实用案例

### 1. ID 生成器

```javascript
function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const ids = idGenerator();
console.log(ids.next().value); // 1
console.log(ids.next().value); // 2
console.log(ids.next().value); // 3
```

### 2. 斐波那契数列

```javascript
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

// 获取前 10 个
function take(n, iterable) {
  const result = [];
  for (let item of iterable) {
    if (result.length >= n) break;
    result.push(item);
  }
  return result;
}

console.log(take(10, fibonacci()));
// [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

### 3. 树的遍历

```javascript
function* traverseTree(node) {
  yield node.value;
  if (node.children) {
    for (let child of node.children) {
      yield* traverseTree(child);
    }
  }
}

const tree = {
  value: 1,
  children: [
    { value: 2, children: [{ value: 4 }, { value: 5 }] },
    { value: 3, children: [{ value: 6 }] },
  ],
};

console.log([...traverseTree(tree)]); // [1, 2, 4, 5, 3, 6]
```

### 4. 异步流程控制

```javascript
// Generator 实现
function* fetchData() {
  const user = yield fetchUser(1);
  const posts = yield fetchPosts(user.id);
  return { user, posts };
}

// 自动执行器
function runGenerator(gen) {
  return new Promise((resolve, reject) => {
    const g = gen();

    function step(nextValue) {
      const result = g.next(nextValue);

      if (result.done) {
        return resolve(result.value);
      }

      Promise.resolve(result.value)
        .then((value) => step(value))
        .catch(reject);
    }

    step();
  });
}

// 使用
runGenerator(fetchData).then((result) => {
  console.log(result);
});

// 这就是 async/await 的原理！
async function fetchDataAsync() {
  const user = await fetchUser(1);
  const posts = await fetchPosts(user.id);
  return { user, posts };
}
```

### 5. 数据流处理

```javascript
// 过滤器
function* filter(iterable, predicate) {
  for (let item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

// 映射器
function* map(iterable, mapper) {
  for (let item of iterable) {
    yield mapper(item);
  }
}

// 使用
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = [
  ...map(
    filter(numbers, (x) => x % 2 === 0),
    (x) => x * 2
  ),
];
console.log(result); // [4, 8, 12, 16, 20]
```

### 6. 分页加载

```javascript
function* paginatedData(totalItems, pageSize) {
  let page = 1;
  let offset = 0;

  while (offset < totalItems) {
    const data = Array.from(
      { length: Math.min(pageSize, totalItems - offset) },
      (_, i) => offset + i + 1
    );

    yield { page, data, hasMore: offset + pageSize < totalItems };

    page++;
    offset += pageSize;
  }
}

for (let page of paginatedData(25, 10)) {
  console.log(`第 ${page.page} 页:`, page.data);
}
```

### 7. 状态机

```javascript
function* trafficLight() {
  while (true) {
    console.log("🔴 红灯");
    yield "red";
    console.log("🟡 黄灯");
    yield "yellow";
    console.log("🟢 绿灯");
    yield "green";
  }
}

const light = trafficLight();
light.next(); // 红灯
light.next(); // 黄灯
light.next(); // 绿灯
light.next(); // 红灯（循环）
```

### 8. 范围生成器

```javascript
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

console.log([...range(0, 10, 2)]); // [0, 2, 4, 6, 8]

// 配合 for...of
for (let i of range(1, 6)) {
  console.log(i); // 1, 2, 3, 4, 5
}
```

---

## 进阶技巧

### 1. 惰性求值

Generator 只在需要时才计算值，非常适合处理大量数据：

```javascript
// 惰性过滤和映射
function* lazyMap(iterable, mapper) {
  for (let item of iterable) {
    console.log("处理:", item);
    yield mapper(item);
  }
}

const huge = range(1, 1000000);
const mapped = lazyMap(huge, (x) => x * 2);

// 只计算前 3 个
console.log(take(3, mapped)); // 只会打印 3 次 "处理:"
```

### 2. 组合 Generator

```javascript
function* pipe(iterable, ...operations) {
  let result = iterable;
  for (let operation of operations) {
    result = operation(result);
  }
  yield* result;
}

const result = pipe(
  range(1, 20),
  (it) => filter(it, (x) => x % 2 === 0),
  (it) => map(it, (x) => x * x),
  (it) => take(5, it)
);

console.log([...result]); // [4, 16, 36, 64, 100]
```

### 3. 递归 Generator

```javascript
// 扁平化嵌套数组
function* flatten(arr) {
  for (let item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item); // 递归
    } else {
      yield item;
    }
  }
}

const nested = [1, [2, [3, [4, 5]], 6], 7];
console.log([...flatten(nested)]); // [1, 2, 3, 4, 5, 6, 7]
```

### 4. 协程（Coroutines）

```javascript
function* task1() {
  console.log("任务1: 步骤1");
  yield;
  console.log("任务1: 步骤2");
  yield;
  console.log("任务1: 步骤3");
}

function* task2() {
  console.log("任务2: 步骤A");
  yield;
  console.log("任务2: 步骤B");
  yield;
  console.log("任务2: 步骤C");
}

// 交替执行
function runTasks(tasks) {
  const generators = tasks.map((t) => t());

  while (generators.some((g) => !g.next().done)) {
    // 继续执行
  }
}

runTasks([task1, task2]);
```

### 5. 观察者模式

```javascript
function* observable() {
  const observers = [];

  while (true) {
    const action = yield;

    if (action.type === "subscribe") {
      observers.push(action.callback);
    } else if (action.type === "notify") {
      observers.forEach((cb) => cb(action.data));
    }
  }
}

const obs = observable();
obs.next(); // 启动

obs.next({
  type: "subscribe",
  callback: (data) => console.log("观察者1:", data),
});
obs.next({
  type: "subscribe",
  callback: (data) => console.log("观察者2:", data),
});
obs.next({ type: "notify", data: "Hello!" });
```

---

## 最佳实践

### 1. 命名约定

```javascript
// ✅ 好的命名
function* generateIds() {}
function* rangeIterator() {}
function* fibonacci() {}

// ❌ 避免
function* gen() {}
function* g() {}
```

### 2. 使用场景

**适合使用 Generator：**

- 实现迭代器
- 处理无限序列
- 延迟计算
- 复杂的迭代逻辑
- 状态机

**不适合使用 Generator：**

- 简单的同步函数
- 只需要一次性计算的场景
- 性能敏感的热点代码

### 3. 性能考虑

```javascript
// Generator 有轻微的性能开销
// 对于简单场景，普通函数可能更快

// ❌ 不必要的 Generator
function* simpleMap(arr) {
  for (let item of arr) {
    yield item * 2;
  }
}

// ✅ 普通函数更好
function simpleMap(arr) {
  return arr.map((x) => x * 2);
}

// ✅ Generator 更适合惰性求值
function* lazyMap(iterable) {
  for (let item of iterable) {
    yield item * 2;
  }
}
```

### 4. 错误处理

```javascript
function* robustGenerator() {
  try {
    yield 1;
    yield 2;
  } catch (e) {
    console.error("Generator 内部错误:", e);
    // 可以选择继续或重新抛出
    throw e;
  } finally {
    console.log("清理资源");
  }
}
```

### 5. TypeScript 类型

```typescript
// 明确指定类型
function* typedGenerator(): Generator<number, string, boolean> {
  // Generator<YieldType, ReturnType, NextType>
  const input: boolean = yield 1;
  return "done";
}

// 使用泛型
function* genericGenerator<T>(items: T[]): Generator<T> {
  for (const item of items) {
    yield item;
  }
}
```

---

## Generator vs Async/Await

Generator 是 async/await 的基础：

```javascript
// Generator + Promise
function* fetchData() {
  const user = yield fetchUser(1);
  const posts = yield fetchPosts(user.id);
  return { user, posts };
}

// 等价的 async/await
async function fetchData() {
  const user = await fetchUser(1);
  const posts = await fetchPosts(user.id);
  return { user, posts };
}
```

**主要区别：**

- async/await 更简洁，是语法糖
- Generator 更灵活，可以实现更复杂的控制流
- async 函数自动执行，Generator 需要手动调用 next()
- 现代开发推荐使用 async/await

---

## 练习题

### 练习 1：实现 `repeat` 函数

```javascript
function* repeat(value, times) {
  // 你的代码
}

console.log([...repeat("*", 5)]); // ['*', '*', '*', '*', '*']
```

### 练习 2：实现 `zip` 函数

```javascript
function* zip(...iterables) {
  // 你的代码
}

console.log([...zip([1, 2, 3], ["a", "b", "c"])]);
// [[1, 'a'], [2, 'b'], [3, 'c']]
```

### 练习 3：实现质数生成器

```javascript
function* primes() {
  // 你的代码：生成无限质数序列
}

console.log(take(10, primes())); // 前 10 个质数
```

### 练习 4：实现二叉树中序遍历

```javascript
function* inorderTraversal(node) {
  // 你的代码
}

const tree = {
  value: 1,
  left: { value: 2, left: { value: 4 }, right: { value: 5 } },
  right: { value: 3 },
};

console.log([...inorderTraversal(tree)]); // [4, 2, 5, 1, 3]
```

---

## 参考资源

- [MDN Generator 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator)
- [ES6 入门教程 - Generator](https://es6.ruanyifeng.com/#docs/generator)
- [理解 JavaScript 的 async/await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)

---

## 运行示例代码

```bash
# JavaScript 版本
node src/es6/generator.js

# TypeScript 版本（需要先编译）
npx ts-node src/es6/generator.ts
```

---

## 总结

Generator 是一个强大的特性，它：

1. ✅ 简化了迭代器的实现
2. ✅ 支持惰性求值，节省内存
3. ✅ 可以实现复杂的控制流
4. ✅ 是 async/await 的基础
5. ✅ 适合处理无限序列和流式数据

掌握 Generator 将帮助你：

- 更好地理解 JavaScript 的迭代机制
- 编写更优雅的异步代码
- 实现高效的数据处理管道
- 理解 async/await 的工作原理
