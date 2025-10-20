# ES6 Generator 学习资源

这是一个全面的 ES6 Generator 学习项目，包含详细的示例代码、练习题和完整的学习指南。

## 📁 项目结构

```
generator/
├── README.md                          # 本文件
├── generator.js                       # JavaScript 完整示例（20个案例）
├── generator.ts                       # TypeScript 版本（包含类型定义）
├── ../generator-exercises.js          # 练习题及答案（20个练习）
└── ../generator-learning-guide.md     # 详细学习指南
```

## 🚀 快速开始

### 运行示例代码

```bash
# JavaScript 版本 - 20个完整案例
node src/es6/generator/generator.js

# TypeScript 版本 - 高级用法和工具类
npx ts-node src/es6/generator/generator.ts

# 练习题
node src/es6/generator-exercises.js
```

## 📚 学习内容

### 1. 基础 Generator (`generator.js`)

这个文件包含 20 个从基础到进阶的完整示例：

#### 基础部分

1. ✅ **基础 Generator** - 最简单的 Generator 函数
2. ✅ **yield 表达式的返回值** - 理解双向通信
3. ✅ **遍历 Generator** - for...of、扩展运算符、Array.from
4. ✅ **斐波那契数列** - 经典算法实现
5. ✅ **ID 生成器** - 无限序列生成

#### 核心概念

6. ✅ **实现迭代器** - 为对象添加迭代器接口
7. ✅ **错误处理** - Generator.prototype.throw()
8. ✅ **提前终止** - Generator.prototype.return()
9. ✅ **yield\* 委托** - 委托给其他 Generator
10. ✅ **递归 Generator** - 树的深度优先遍历

#### 实用案例

11. ✅ **异步流程控制** - 实现 async/await 的原理
12. ✅ **状态机** - 交通灯状态机
13. ✅ **无限序列** - 自然数、偶数序列
14. ✅ **数据流处理** - filter、map、pipeline
15. ✅ **分页加载** - 惰性分页数据生成

#### 进阶技巧

16. ✅ **协程** - 多个 Generator 交替执行
17. ✅ **惰性求值** - 延迟计算示例
18. ✅ **观察者模式** - 基于 Generator 的发布订阅
19. ✅ **Generator vs async/await** - 理解语法糖
20. ✅ **实用工具函数** - range、repeat、cycle、zip

### 2. TypeScript 版本 (`generator.ts`)

包含完整的类型定义和面向对象的工具类：

- **GeneratorUtils** - 实用工具方法集合

  - `range()` - 生成数字范围
  - `repeat()` - 重复生成值
  - `cycle()` - 无限循环
  - `take()` - 获取前 n 个元素
  - `filter()` - 过滤
  - `map()` - 映射
  - `zip()` - 合并多个序列
  - `flatten()` - 展平嵌套结构

- **TreeTraversal** - 树遍历算法

  - 深度优先（前序）
  - 深度优先（后序）
  - 广度优先

- **IdGenerator** - ID 生成器类
- **PaginationGenerator** - 分页生成器
- **StateMachine** - 状态机
- **AsyncQueue** - 异步队列处理器
- **Pipeline** - 流式数据处理管道
- **Observable** - 可观察对象

### 3. 练习题 (`generator-exercises.js`)

20 个精心设计的练习题，涵盖各种应用场景：

#### 基础练习

1. ✅ repeat - 重复生成值
2. ✅ zip - 合并多个序列
3. ✅ primes - 质数生成器
4. ✅ inorderTraversal - 二叉树中序遍历
5. ✅ scan - 累积计算（类似 reduce）

#### 实用工具

6. ✅ chunk - 数组分块
7. ✅ window - 滑动窗口
8. ✅ unique - 去重
9. ✅ enumerate - 带索引遍历
10. ✅ permutations - 排列
11. ✅ combinations - 组合

#### 图算法

12. ✅ DFS - 深度优先遍历
13. ✅ BFS - 广度优先遍历

#### 高级应用

14. ✅ randomGenerator - 伪随机数生成器
15. ✅ countdown - 可中断的定时器
16. ✅ debounce - 防抖函数
17. ✅ merge - 合并有序序列
18. ✅ throttle - 节流函数
19. ✅ cachedFibonacci - 带缓存的斐波那契
20. ✅ Stream - 链式流处理管道

## 🎯 学习路径

### 第一阶段：基础理解（1-2 小时）

1. 阅读 `generator-learning-guide.md` 的基础部分
2. 运行 `generator.js` 的前 10 个示例
3. 理解 Generator 的基本语法和执行流程

### 第二阶段：实践应用（2-3 小时）

1. 学习 `generator.js` 的后 10 个示例
2. 尝试修改代码，观察输出变化
3. 完成 `generator-exercises.js` 的前 10 个练习

### 第三阶段：进阶掌握（3-4 小时）

1. 学习 TypeScript 版本的类型系统
2. 完成剩余的练习题
3. 尝试用 Generator 重构现有项目代码

## 💡 核心概念

### Generator 是什么？

Generator 是一种特殊的函数，可以：

- ⏸️ **暂停和恢复** - 使用 `yield` 控制执行流
- 🔄 **返回迭代器** - 自动实现迭代器协议
- 💬 **双向通信** - 通过 `next()` 传递值
- 🦥 **惰性求值** - 只在需要时才计算

### 为什么学习 Generator？

1. **理解 async/await** - Generator 是 async/await 的基础
2. **处理无限序列** - 不占用过多内存
3. **实现复杂逻辑** - 状态机、协程、流处理
4. **提升编程思维** - 学习函数式编程思想

## 📖 主要特性

### 1. 基础语法

```javascript
function* myGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = myGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
```

### 2. 双向通信

```javascript
function* generatorWithInput() {
  const a = yield "First";
  const b = yield "Second";
  return a + b;
}

const gen = generatorWithInput();
gen.next(); // { value: 'First', done: false }
gen.next(10); // { value: 'Second', done: false }
gen.next(20); // { value: 30, done: true }
```

### 3. yield\* 委托

```javascript
function* inner() {
  yield "a";
  yield "b";
}

function* outer() {
  yield 1;
  yield* inner(); // 委托
  yield 2;
}

console.log([...outer()]); // [1, 'a', 'b', 2]
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
gen.throw("错误"); // 捕获错误: 错误
```

## 🔥 实用案例

### 无限序列

```javascript
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

function take(n, iterable) {
  const result = [];
  for (const item of iterable) {
    if (result.length >= n) break;
    result.push(item);
  }
  return result;
}

console.log(take(10, fibonacci()));
// [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

### 异步流程控制

```javascript
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
      if (result.done) return resolve(result.value);

      Promise.resolve(result.value)
        .then((value) => step(value))
        .catch(reject);
    }

    step();
  });
}
```

### 数据流处理

```javascript
function* filter(iterable, predicate) {
  for (let item of iterable) {
    if (predicate(item)) yield item;
  }
}

function* map(iterable, mapper) {
  for (let item of iterable) {
    yield mapper(item);
  }
}

const result = [
  ...map(
    filter([1, 2, 3, 4, 5, 6], (x) => x % 2 === 0),
    (x) => x * 2
  ),
];
console.log(result); // [4, 8, 12]
```

## 🎓 学习资源

### 文档

- [MDN Generator 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator)
- [ES6 入门教程 - Generator](https://es6.ruanyifeng.com/#docs/generator)
- [Understanding Generators](https://javascript.info/generators)

### 视频教程

- [JavaScript Generator Functions](https://www.youtube.com/results?search_query=javascript+generator)

### 相关主题

- Iterator（迭代器）
- async/await（异步函数）
- Promise（承诺）
- 函数式编程

## 🤔 常见问题

### Q: Generator 和普通函数有什么区别？

A: Generator 可以暂停和恢复执行，而普通函数会一次性执行完毕。

### Q: Generator 和 async/await 有什么关系？

A: async/await 本质上是 Generator + Promise 的语法糖，是对 Generator 的封装。

### Q: 什么时候应该使用 Generator？

A:

- 处理无限序列
- 实现自定义迭代器
- 惰性求值
- 复杂的状态管理
- 协程和并发控制

### Q: Generator 有性能开销吗？

A: 有轻微的性能开销，但在需要惰性求值或处理无限序列时，收益远大于开销。

## 🛠️ 开发技巧

### 1. 命名约定

```javascript
// ✅ 好的命名
function* generateIds() {}
function* fibonacci() {}

// ❌ 避免
function* gen() {}
function* g() {}
```

### 2. 类型定义（TypeScript）

```typescript
function* typedGenerator(): Generator<number, string, boolean> {
  // Generator<YieldType, ReturnType, NextType>
  const input: boolean = yield 1;
  return "done";
}
```

### 3. 错误处理

```javascript
function* robustGenerator() {
  try {
    yield 1;
    yield 2;
  } catch (e) {
    console.error("Generator 错误:", e);
    throw e;
  } finally {
    console.log("清理资源");
  }
}
```

## 📊 示例输出

运行主示例文件后，你会看到：

```
=== 1. 基础 Generator ===

开始执行
gen1.next(): { value: 1, done: false }
继续执行
gen1.next(): { value: 2, done: false }
...

=== 20. 实用工具函数 ===

range(0, 10, 2): [ 0, 2, 4, 6, 8 ]
repeat("*", 5): *****
...

=== Generator 学习完成！ ===
```

## 🎯 下一步

完成本项目的学习后，你可以：

1. ✅ 理解 JavaScript 的迭代器协议
2. ✅ 掌握 Generator 的各种用法
3. ✅ 深入理解 async/await 的原理
4. ✅ 在项目中应用 Generator 解决实际问题

继续学习：

- **Async Iterators** - 异步迭代器
- **Observables (RxJS)** - 响应式编程
- **CSP (Communicating Sequential Processes)** - 通信顺序进程

## 📝 总结

Generator 是 JavaScript 中一个强大但经常被忽视的特性。通过本项目的学习，你将：

- 🎓 掌握 Generator 的核心概念
- 💪 能够在实际项目中应用 Generator
- 🚀 理解现代 JavaScript 异步编程的演进
- 🧠 提升函数式编程思维

**开始你的 Generator 学习之旅吧！** 🎉

---

## 📄 许可

本项目仅供学习使用。

## 🤝 贡献

欢迎提出问题和改进建议！

---

**Happy Coding!** 💻✨
