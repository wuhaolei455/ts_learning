# runGenerator 函数详解

## 🎯 核心作用

`runGenerator` 是一个 **Generator 自动执行器**，它实现了 `async/await` 的底层原理。

## 📝 完整代码

```javascript
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
```

## 🔍 逐行分析

### 1. 函数签名

```javascript
function runGenerator(gen) {
```

- `gen` 是一个 **Generator 函数**（不是 Generator 对象）
- 例如：`function* fetchData() { ... }`

### 2. 返回 Promise

```javascript
return new Promise((resolve, reject) => {
```

- 返回 Promise，这样调用者可以用 `.then()` 获取最终结果
- 使异步操作可以被外部等待

### 3. 创建 Generator 对象

```javascript
const g = gen();
```

- 调用 Generator 函数，得到 Generator 对象
- 此时函数体还没有执行

### 4. 核心递归函数 step

```javascript
function step(nextValue) {
  const result = g.next(nextValue);

  if (result.done) {
    return resolve(result.value);
  }

  Promise.resolve(result.value)
    .then((value) => step(value))
    .catch(reject);
}
```

#### 参数说明：

- `nextValue`：上一个 Promise 的结果，会传给 `yield` 表达式

#### 执行步骤：

1. **调用 `g.next(nextValue)`**
   - 恢复 Generator 执行
   - 将 `nextValue` 作为上一个 `yield` 的返回值
   - 执行到下一个 `yield`
2. **检查是否完成**
   - 如果 `result.done === true`，Generator 执行完毕
   - 用 `result.value`（返回值）resolve Promise
3. **处理 yield 的值**
   - 用 `Promise.resolve()` 包装（确保是 Promise）
   - 等待 Promise 完成
   - 递归调用 `step(value)`，将结果传回 Generator

### 5. 启动执行

```javascript
step();
```

- 第一次调用 `step()`，不传参数（`undefined`）
- 开始执行 Generator

## 🎬 执行流程图

```
┌─────────────────────────────────────────────────────────────┐
│  runGenerator(function* fetchData() {                       │
│    const user = yield fetchUser(1);      // ①               │
│    const posts = yield fetchPosts(user.id);  // ③           │
│    return { user, posts };               // ⑤               │
│  })                                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  const g = fetchData();  // 创建 Generator 对象              │
│  step();                 // 启动执行                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  ① step(undefined)                                          │
│     ↓                                                        │
│  g.next(undefined)                                          │
│     ↓                                                        │
│  执行到: const user = yield fetchUser(1);                    │
│     ↓                                                        │
│  返回: { value: Promise<User>, done: false }                │
│     ↓                                                        │
│  等待 fetchUser(1) 完成...                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  ② Promise 完成，得到 user = { id: 1, name: 'User1' }       │
│     ↓                                                        │
│  step(user)  // 递归调用，传入 user                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  ③ step({ id: 1, name: 'User1' })                          │
│     ↓                                                        │
│  g.next({ id: 1, name: 'User1' })                          │
│     ↓                                                        │
│  const user = { id: 1, name: 'User1' }  // yield 返回值     │
│     ↓                                                        │
│  执行到: const posts = yield fetchPosts(user.id);            │
│     ↓                                                        │
│  返回: { value: Promise<Post[]>, done: false }              │
│     ↓                                                        │
│  等待 fetchPosts(1) 完成...                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  ④ Promise 完成，得到 posts = [...]                          │
│     ↓                                                        │
│  step(posts)  // 递归调用，传入 posts                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  ⑤ step([...])                                              │
│     ↓                                                        │
│  g.next([...])                                              │
│     ↓                                                        │
│  const posts = [...]  // yield 返回值                        │
│     ↓                                                        │
│  return { user, posts };                                    │
│     ↓                                                        │
│  返回: { value: { user, posts }, done: true }               │
│     ↓                                                        │
│  resolve({ user, posts })  // 完成！                         │
└─────────────────────────────────────────────────────────────┘
```

## 💡 关键技术点

### 1. 双向通信

```javascript
const result = g.next(nextValue);
```

- **Generator → 外部**：通过 `yield` 向外传递值（`result.value`）
- **外部 → Generator**：通过 `next(value)` 向内传递值（变成 `yield` 的返回值）

### 2. Promise.resolve() 的作用

```javascript
Promise.resolve(result.value);
```

**统一处理三种情况：**

```javascript
// 情况 1: yield 的是 Promise
yield fetchUser(1);  // Promise<User>

// 情况 2: yield 的是普通值
yield 42;            // 42

// 情况 3: yield 的是 thenable
yield { then: (resolve) => resolve(100) };
```

`Promise.resolve()` 会：

- Promise → 直接返回
- 普通值 → 包装成 resolved Promise
- thenable → 转换为 Promise

### 3. 递归 + Promise 链

```javascript
Promise.resolve(result.value)
  .then((value) => step(value)) // 递归
  .catch(reject);
```

这实现了：

- **自动执行**：不需要手动调用 `next()`
- **串行执行**：一个 Promise 完成后才执行下一个
- **错误传播**：任何错误都会 reject 外层 Promise

## 🆚 对比：Generator vs async/await

### Generator 版本

```javascript
function* fetchData() {
  const user = yield fetchUser(1);
  const posts = yield fetchPosts(user.id);
  return { user, posts };
}

runGenerator(fetchData).then(console.log);
```

### async/await 版本

```javascript
async function fetchData() {
  const user = await fetchUser(1);
  const posts = await fetchPosts(user.id);
  return { user, posts };
}

fetchData().then(console.log);
```

### 本质等价

| Generator        | async/await             |
| ---------------- | ----------------------- |
| `function*`      | `async function`        |
| `yield`          | `await`                 |
| `runGenerator()` | JavaScript 引擎自动执行 |
| 手动实现         | 语法糖                  |

## 🎓 为什么需要理解这个？

### 1. 理解 async/await 原理

```javascript
// async/await 就是这样工作的！
async function foo() {
  const a = await promise1;
  const b = await promise2;
  return a + b;
}

// 等价于
function* foo() {
  const a = yield promise1;
  const b = yield promise2;
  return a + b;
}
runGenerator(foo);
```

### 2. 处理更复杂的场景

有时候 Generator 比 async/await 更灵活：

```javascript
function* complexFlow() {
  const choice = yield askUser();

  if (choice === "A") {
    const result = yield pathA();
    return result;
  } else {
    const result = yield pathB();
    return result;
  }
}
```

### 3. 实现自定义调度器

```javascript
function runGeneratorWithTimeout(gen, timeout) {
  return new Promise((resolve, reject) => {
    const g = gen();
    const timeoutId = setTimeout(() => {
      reject(new Error("Timeout"));
    }, timeout);

    function step(nextValue) {
      const result = g.next(nextValue);

      if (result.done) {
        clearTimeout(timeoutId);
        return resolve(result.value);
      }

      Promise.resolve(result.value)
        .then((value) => step(value))
        .catch(reject);
    }

    step();
  });
}
```

## 🧪 测试理解

运行演示代码：

```bash
node src/es6/generator/runGenerator-demo.js
```

你会看到详细的执行过程，包括：

- 每次 `step()` 调用
- 每次 `g.next()` 的返回值
- Promise 的等待和完成
- 最终结果

## 📚 总结

`runGenerator` 的核心逻辑：

1. **创建 Generator 对象**：`g = gen()`
2. **递归执行**：`step()` 函数
3. **处理 yield**：等待 Promise 完成
4. **传递结果**：`g.next(value)` 将结果传回
5. **重复步骤 2-4**：直到 `done: true`
6. **返回结果**：`resolve(result.value)`

这就是 **async/await 的魔法背后的原理**！ ✨

---

## 🔗 相关资源

- [MDN Generator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator)
- [MDN async function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [Understanding Generators](https://javascript.info/generators)
- [Async/Await 的历史](https://tc39.es/ecma262/#sec-async-function-definitions)
