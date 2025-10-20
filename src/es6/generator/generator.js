/**
 * ES6 Generator 完整学习案例
 * Generator 是 ES6 引入的一种异步编程解决方案，它可以暂停执行和恢复执行
 */

console.log("=== 1. 基础 Generator ===\n");

// 最简单的 Generator 函数
function* simpleGenerator() {
  console.log("开始执行");
  yield 1;
  console.log("继续执行");
  yield 2;
  console.log("再次执行");
  yield 3;
  console.log("执行完毕");
  return 4;
}

const gen1 = simpleGenerator();
console.log("gen1.next():", gen1.next()); // { value: 1, done: false }
console.log("gen1.next():", gen1.next()); // { value: 2, done: false }
console.log("gen1.next():", gen1.next()); // { value: 3, done: false }
console.log("gen1.next():", gen1.next()); // { value: 4, done: true }
console.log("gen1.next():", gen1.next()); // { value: undefined, done: true }

console.log("\n=== 2. yield 表达式的返回值 ===\n");

// yield 表达式本身的返回值是 next() 方法传入的参数
function* generatorWithInput(max) {
  let count = 0;
  while (count < max) {
    const done = yield count;
    if (done) {
      // 如果 done 为 true，则停止生成器
      console.log("done");
    } else {
      count++;
    }
  }
}

const gen2 = generatorWithInput(4);
console.log("第一次 next():", gen2.next()); // { value: 'First', done: false }
console.log("第二次 next(10):", gen2.next(10)); // { value: 'Second', done: false }
console.log("第三次 next(20):", gen2.next(20)); // { value: 30, done: true }

console.log("\n=== 3. 遍历 Generator ===\n");

function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
}

// 使用 for...of 遍历
console.log("使用 for...of 遍历:");
for (let num of numberGenerator()) {
  console.log(num);
}

// 使用扩展运算符
console.log("\n使用扩展运算符:", [...numberGenerator()]);

// 使用 Array.from
console.log("使用 Array.from:", Array.from(numberGenerator()));

console.log("\n=== 4. Generator 实现斐波那契数列 ===\n");

function* fibonacci(n) {
  let count = 0;
  [prev, curr] = [0, 1];
  while (count < n) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
    count++;
  }
}

console.log("前 10 个斐波那契数:", [...fibonacci(10)]);

console.log("\n=== 5. Generator 实现 ID 生成器 ===\n");

function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const ids = idGenerator();
console.log("ID 1:", ids.next().value);
console.log("ID 2:", ids.next().value);
console.log("ID 3:", ids.next().value);
console.log("ID 4:", ids.next().value);

console.log("\n=== 6. Generator 实现迭代器 ===\n");

// 为对象实现迭代器接口
const myObject = {
  name: "TypeScript",
  version: "5.0",
  features: ["类型安全", "智能提示", "编译检查"],

  // 使用 Generator 实现 Symbol.iterator
  *[Symbol.iterator]() {
    yield "name:" + this.name;
    yield "version:" + this.version;
    for (let feature of this.features) {
      yield "feature:" + feature;
    }
  },
};

console.log("遍历自定义对象:");
for (let item of myObject) {
  console.log(item);
}

console.log("\n=== 7. Generator.prototype.throw() ===\n");

function* generatorWithErrorHandling() {
  try {
    yield "First";
    yield "Second";
    yield "Third";
  } catch (e) {
    console.log("捕获到错误:", e);
  }
  yield "Fourth";
  yield "Fifth";
}

const gen3 = generatorWithErrorHandling();
console.log(gen3.next()); // { value: 'First', done: false }
console.log(gen3.next()); // { value: 'Second', done: false }
console.log(gen3.throw("出错了!")); // { value: 'Fourth', done: false }
console.log(gen3.next()); // { value: 'Fifth', done: false }

console.log("\n=== 8. Generator.prototype.return() ===\n");

function* generatorWithReturn() {
  yield 1;
  yield 2;
  yield 3;
}

const gen4 = generatorWithReturn();
console.log(gen4.next()); // { value: 1, done: false }
console.log(gen4.return("提前结束")); // { value: '提前结束', done: true }
console.log(gen4.next()); // { value: undefined, done: true }

console.log("\n=== 9. yield* 表达式（委托生成器）===\n");

function* innernerGenerator() {
  yield "innerne'rner-1";
  yield "innerNER-2";
}

function* innerGenerator() {
  yield "HAHA";
  yield* innernerGenerator();
}

function* outerGenerator() {
  yield "outer-1";
  yield* innerGenerator();
  yield "outer-2";
}

console.log("使用 yield* 委托:");
for (let value of outerGenerator()) {
  console.log(value);
}

// yield* 也可以用于可迭代对象
function* generatorWithArray() {
  yield "start";
  yield* [1, 2, 3]; // 委托给数组
  yield* "abc"; // 委托给字符串
  yield "end";
}

console.log("\nyield* 用于数组和字符串:", [...generatorWithArray()]);

console.log("\n=== 10. 递归 Generator ===\n");

// 实现树的遍历
function* traverseTree(node) {
  yield node.value;
  if (node.children) {
    for (let child of node.children) {
      yield* traverseTree(child); // 递归调用
    }
  }
}

const tree = {
  value: 1,
  children: [
    {
      value: 2,
      children: [{ value: 4 }, { value: 5 }],
    },
    {
      value: 3,
      children: [{ value: 6 }, { value: 7 }],
    },
  ],
};

console.log("树的深度优先遍历:", [...traverseTree(tree)]);

console.log("\n=== 11. Generator 实现异步流程控制 ===\n");

// 模拟异步操作
function fetchUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: `User${id}` });
    }, 100);
  });
}

function fetchPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "Post 1", userId },
        { id: 2, title: "Post 2", userId },
      ]);
    }, 100);
  });
}

// Generator 函数
function* fetchData() {
  console.log("开始获取数据...");
  const user = yield fetchUser(1);
  console.log("用户信息:", user);
  const posts = yield fetchPosts(user.id);
  console.log("文章列表:", posts);
  return { user, posts };
}

// 自动执行 Generator 的函数
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

// 执行异步流程
runGenerator(fetchData).then((result) => {
  console.log("最终结果:", result);
});

console.log("\n=== 12. Generator 实现状态机 ===\n");

// 交通灯状态机
function* trafficLight() {
  while (true) {
    console.log("🔴 红灯 - 停止");
    yield "red";
    console.log("🟡 黄灯 - 准备");
    yield "yellow";
    console.log("🟢 绿灯 - 通行");
    yield "green";
  }
}

const light = trafficLight();
light.next();
light.next();
light.next();
light.next(); // 循环开始

console.log("\n=== 13. Generator 实现无限序列 ===\n");

// 无限自然数序列
function* naturalNumbers() {
  let n = 0;
  while (true) {
    yield n++;
  }
}

// 获取前 10 个自然数
function take(n, iterable) {
  const result = [];
  for (let item of iterable) {
    if (result.length >= n) break;
    result.push(item);
  }
  return result;
}

console.log("前 10 个自然数:", take(10, naturalNumbers()));

// 偶数序列
function* evenNumbers() {
  let n = 0;
  while (true) {
    yield n;
    n += 2;
  }
}

console.log("前 10 个偶数:", take(10, evenNumbers()));

console.log("\n=== 14. Generator 实现数据流处理 ===\n");

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

// 使用示例
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenFiltered = filter(numbers, (x) => x % 2 === 0);
const doubled = map(evenFiltered, (x) => x * 2);

console.log("偶数翻倍:", [...doubled]);

// 链式调用
function* pipeline(iterable, ...operations) {
  let result = iterable;
  for (let operation of operations) {
    result = operation(result);
  }
  yield* result;
}

const result = pipeline(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  (iterable) => filter(iterable, (x) => x % 2 === 0),
  (iterable) => map(iterable, (x) => x * 2),
  (iterable) => filter(iterable, (x) => x > 10)
);

console.log("管道处理结果:", [...result]);

console.log("\n=== 15. Generator 实现分页加载 ===\n");

// 模拟分页数据
function* paginatedData(pageSize) {
  let page = 1;
  while (true) {
    const data = Array.from({ length: pageSize }, (_, i) => ({
      id: (page - 1) * pageSize + i + 1,
      name: `Item ${(page - 1) * pageSize + i + 1}`,
    }));

    const shouldContinue = yield data;
    if (shouldContinue === false) break;
    page++;
  }
}

const paginator = paginatedData(5);
console.log("第 1 页:", paginator.next().value);
console.log("第 2 页:", paginator.next(true).value);
console.log("第 3 页:", paginator.next(true).value);

console.log("\n=== 16. Generator 实现协程（Coroutine）===\n");

// 两个协程交替执行
function* coroutine1() {
  console.log("协程1: 步骤1");
  yield;
  console.log("协程1: 步骤2");
  yield;
  console.log("协程1: 步骤3");
}

function* coroutine2() {
  console.log("协程2: 步骤A");
  yield;
  setTimeout(() => {
    console.log("协程2: 步骤B");
  }, 100);
  yield;
  console.log("协程2: 步骤C");
}

// 调度器
function* scheduler(...coroutines) {
  const generators = coroutines.map((c) => c());

  // 从后往前遍历，因为splice会改变数组长度
  while (generators.length > 0) {
    for (let i = generators.length - 1; i >= 0; i--) {
      const result = generators[i].next();
      if (result.done) {
        generators.splice(i, 1);
      }
    }
    yield;
  }
}

const sched = scheduler(coroutine1, coroutine2);
while (!sched.next().done) {
  console.log("调度中...");
}
console.log("调度结束");

console.log("\n=== 17. Generator 实现惰性求值 ===\n");

// 惰性计算平方
function* lazySquares() {
  let n = 1;
  while (true) {
    console.log(`计算 ${n} 的平方`);
    yield n * n;
    n++;
  }
}

const squares = lazySquares();
console.log("获取第一个平方:", squares.next().value);
console.log("获取第二个平方:", squares.next().value);
console.log("获取第三个平方:", squares.next().value);
// 只在需要时才计算，实现了惰性求值

console.log("\n=== 18. Generator 实现观察者模式 ===\n");

// 可观察对象
function* observable() {
  let observers = [];

  while (true) {
    const action = yield;

    if (action.type === "subscribe") {
      observers.push(action.callback);
      console.log("添加观察者，当前数量:", observers.length);
    } else if (action.type === "notify") {
      console.log(`通知所有观察者: ${action.data}`);
      observers.forEach((callback) => callback(action.data));
    }
  }
}

const obs = observable();
obs.next(); // 启动

obs.next({
  type: "subscribe",
  callback: (data) => console.log("观察者1 收到:", data),
});
obs.next({
  type: "subscribe",
  callback: (data) => console.log("观察者2 收到:", data),
});
obs.next({ type: "notify", data: "Hello!" });

console.log("\n=== 19. Generator 与 async/await 的关系 ===\n");

// Generator 实现（ES6）
function* fetchDataGenerator() {
  const user = yield fetchUser(1);
  const posts = yield fetchPosts(user.id);
  return { user, posts };
}

// async/await 实现（ES8）- 本质上是 Generator 的语法糖
async function fetchDataAsync() {
  const user = await fetchUser(1);
  const posts = await fetchPosts(user.id);
  return { user, posts };
}

console.log("async/await 本质上是 Generator + Promise 的语法糖");
console.log("Generator 需要手动执行，async 函数自动执行");

console.log("\n=== 20. 实用工具函数 ===\n");

// range 函数
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

console.log("range(0, 10, 2):", [...range(0, 10, 2)]);

// repeat 函数
function* repeat(value, times) {
  for (let i = 0; i < times; i++) {
    yield value;
  }
}

console.log('repeat("*", 5):', [...repeat("*", 5)].join(""));

// cycle 函数（循环）
function* cycle(iterable) {
  const items = [...iterable];
  while (true) {
    for (let item of items) {
      yield item;
    }
  }
}

console.log("cycle([1,2,3]) 前10个:", take(10, cycle([1, 2, 3])));

// zip 函数
function* zip(...iterables) {
  const iterators = iterables.map((i) => i[Symbol.iterator]());

  while (true) {
    const results = iterators.map((it) => it.next());
    if (results.some((r) => r.done)) break;
    yield results.map((r) => r.value);
  }
}

console.log('zip([1,2,3], ["a","b","c"]):', [
  ...zip([1, 2, 3], ["a", "b", "c"]),
]);

console.log("\n=== Generator 学习完成！ ===");
console.log("\n总结:");
console.log("1. Generator 函数使用 function* 声明");
console.log("2. yield 暂停执行并返回值");
console.log("3. next() 方法恢复执行");
console.log("4. Generator 是实现迭代器的最佳方式");
console.log("5. 可以实现惰性求值、异步流程控制、状态机等");
console.log("6. async/await 是 Generator 的语法糖");
