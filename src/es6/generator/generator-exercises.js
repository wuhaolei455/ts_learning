/**
 * Generator 练习题及答案
 */

console.log("=== Generator 练习题 ===\n");

// ============================================
// 练习 1：实现 repeat 函数
// ============================================

console.log("练习 1: repeat 函数");

function* repeat(value, times) {
  for (let i = 0; i < times; i++) {
    yield value;
  }
}

console.log('repeat("*", 5):', [...repeat("*", 5)]);
console.log('repeat("Hello", 3):', [...repeat("Hello", 3)]);

// ============================================
// 练习 2：实现 zip 函数
// ============================================

console.log("\n练习 2: zip 函数");

function* zip(...iterables) {
  const iterators = iterables.map((iterable) => iterable[Symbol.iterator]());

  while (true) {
    const results = iterators.map((iterator) => iterator.next());

    // 如果任何一个迭代器完成，则停止
    if (results.some((result) => result.done)) {
      break;
    }

    yield results.map((result) => result.value);
  }
}

console.log('zip([1,2,3], ["a","b","c"]):', [
  ...zip([1, 2, 3], ["a", "b", "c"]),
]);
console.log('zip([1,2], ["a","b","c"], [true, false]):', [
  ...zip([1, 2], ["a", "b", "c"], [true, false]),
]);

// ============================================
// 练习 3：实现质数生成器
// ============================================

console.log("\n练习 3: 质数生成器");

function* primes() {
  yield 2; // 第一个质数

  const primeList = [2];
  let candidate = 3;

  while (true) {
    let isPrime = true;

    // 只需要检查到 sqrt(candidate)
    const sqrt = Math.sqrt(candidate);
    for (const prime of primeList) {
      if (prime > sqrt) break;
      if (candidate % prime === 0) {
        isPrime = false;
        break;
      }
    }

    if (isPrime) {
      primeList.push(candidate);
      yield candidate;
    }

    candidate += 2; // 跳过偶数
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

console.log("前 20 个质数:", take(20, primes()));

// ============================================
// 练习 4：实现二叉树中序遍历
// ============================================

console.log("\n练习 4: 二叉树中序遍历");

function* inorderTraversal(node) {
  if (!node) return;

  // 左子树
  if (node.left) {
    yield* inorderTraversal(node.left);
  }

  // 根节点
  yield node.value;

  // 右子树
  if (node.right) {
    yield* inorderTraversal(node.right);
  }
}

const tree = {
  value: 1,
  left: {
    value: 2,
    left: { value: 4 },
    right: { value: 5 },
  },
  right: { value: 3 },
};

console.log("中序遍历:", [...inorderTraversal(tree)]);

// ============================================
// 练习 5：实现 reduce（使用 Generator）
// ============================================

console.log("\n练习 5: reduce 函数");

function* scan(iterable, reducer, initial) {
  let accumulator = initial;
  yield accumulator;

  for (const item of iterable) {
    accumulator = reducer(accumulator, item);
    yield accumulator;
  }
}

const numbers = [1, 2, 3, 4, 5];
console.log("累加过程:", [...scan(numbers, (acc, x) => acc + x, 0)]);

// ============================================
// 练习 6：实现 chunk（分块）
// ============================================

console.log("\n练习 6: chunk 函数");

function* chunk(iterable, size) {
  let batch = [];

  for (const item of iterable) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }

  // 处理剩余的元素
  if (batch.length > 0) {
    yield batch;
  }
}

console.log("chunk([1,2,3,4,5,6,7], 3):", [...chunk([1, 2, 3, 4, 5, 6, 7], 3)]);

// ============================================
// 练习 7：实现 window（滑动窗口）
// ============================================

console.log("\n练习 7: window 函数（滑动窗口）");

function* window(iterable, size) {
  const buffer = [];

  for (const item of iterable) {
    buffer.push(item);

    if (buffer.length === size) {
      yield [...buffer];
      buffer.shift(); // 移除第一个元素
    }
  }
}

console.log("window([1,2,3,4,5], 3):", [...window([1, 2, 3, 4, 5], 3)]);

// ============================================
// 练习 8：实现 unique（去重）
// ============================================

console.log("\n练习 8: unique 函数");

function* unique(iterable) {
  const seen = new Set();

  for (const item of iterable) {
    if (!seen.has(item)) {
      seen.add(item);
      yield item;
    }
  }
}

console.log("unique([1,2,2,3,3,3,4]):", [...unique([1, 2, 2, 3, 3, 3, 4])]);

// ============================================
// 练习 9：实现 enumerate（带索引）
// ============================================

console.log("\n练习 9: enumerate 函数");

function* enumerate(iterable, start = 0) {
  let index = start;
  for (const item of iterable) {
    yield [index++, item];
  }
}

console.log('enumerate(["a","b","c"]):', [...enumerate(["a", "b", "c"])]);
console.log('enumerate(["x","y","z"], 10):', [
  ...enumerate(["x", "y", "z"], 10),
]);

// ============================================
// 练习 10：实现 permutations（排列）
// ============================================

console.log("\n练习 10: permutations 函数");

function* permutations(arr, length = arr.length) {
  if (length === 1) {
    for (const item of arr) {
      yield [item];
    }
    return;
  }

  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest, length - 1)) {
      yield [arr[i], ...perm];
    }
  }
}

console.log("permutations([1,2,3]):", [...permutations([1, 2, 3])]);
console.log("permutations([1,2,3], 2):", [...permutations([1, 2, 3], 2)]);

// ============================================
// 练习 11：实现 combinations（组合）
// ============================================

console.log("\n练习 11: combinations 函数");

function* combinations(arr, length) {
  if (length === 1) {
    for (const item of arr) {
      yield [item];
    }
    return;
  }

  for (let i = 0; i <= arr.length - length; i++) {
    const first = arr[i];
    const rest = arr.slice(i + 1);

    for (const combo of combinations(rest, length - 1)) {
      yield [first, ...combo];
    }
  }
}

console.log("combinations([1,2,3,4], 2):", [...combinations([1, 2, 3, 4], 2)]);
console.log("combinations([1,2,3,4], 3):", [...combinations([1, 2, 3, 4], 3)]);

// ============================================
// 练习 12：实现 graph 的 DFS 遍历
// ============================================

console.log("\n练习 12: 图的深度优先遍历");

function* dfs(graph, start) {
  const visited = new Set();
  const stack = [start];

  while (stack.length > 0) {
    const node = stack.pop();

    if (!visited.has(node)) {
      visited.add(node);
      yield node;

      // 将邻居节点加入栈（逆序，确保按顺序访问）
      const neighbors = graph[node] || [];
      for (let i = neighbors.length - 1; i >= 0; i--) {
        if (!visited.has(neighbors[i])) {
          stack.push(neighbors[i]);
        }
      }
    }
  }
}

const graph = {
  A: ["B", "C"],
  B: ["D", "E"],
  C: ["F"],
  D: [],
  E: ["F"],
  F: [],
};

console.log("DFS from A:", [...dfs(graph, "A")]);

// ============================================
// 练习 13：实现 graph 的 BFS 遍历
// ============================================

console.log("\n练习 13: 图的广度优先遍历");

function* bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];

  while (queue.length > 0) {
    const node = queue.shift();
    yield node;

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}

console.log("BFS from A:", [...bfs(graph, "A")]);

// ============================================
// 练习 14：实现随机数生成器（带种子）
// ============================================

console.log("\n练习 14: 随机数生成器（线性同余生成器）");

function* randomGenerator(seed = Date.now()) {
  let state = seed;
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  while (true) {
    state = (a * state + c) % m;
    yield state / m; // 归一化到 [0, 1)
  }
}

const random = randomGenerator(12345);
console.log(
  "随机数序列:",
  take(10, random).map((x) => x.toFixed(6))
);

// ============================================
// 练习 15：实现可中断的定时器
// ============================================

console.log("\n练习 15: 可中断的定时器");

function* countdown(seconds) {
  for (let i = seconds; i > 0; i--) {
    const continueCountdown = yield i;
    if (continueCountdown === false) {
      console.log("倒计时被中断");
      return;
    }
  }
  console.log("倒计时完成！");
}

const timer = countdown(5);
console.log("倒计时开始:");
console.log(timer.next().value); // 5
console.log(timer.next(true).value); // 4
console.log(timer.next(true).value); // 3
console.log(timer.next(false).value); // 中断

// ============================================
// 练习 16：实现 debounce（使用 Generator）
// ============================================

console.log("\n练习 16: 防抖函数（概念演示）");

function* debounceGenerator(delay) {
  let lastTime = 0;

  while (true) {
    const currentTime = yield;

    if (currentTime - lastTime >= delay) {
      lastTime = currentTime;
      yield "execute";
    } else {
      yield "skip";
    }
  }
}

const debounce = debounceGenerator(1000);
debounce.next(); // 启动

console.log("时间 0ms:", debounce.next(0).value); // execute
console.log("时间 500ms:", debounce.next(500).value); // skip
console.log("时间 1100ms:", debounce.next(1100).value); // execute

// ============================================
// 练习 17：实现 merge（合并多个有序序列）
// ============================================

console.log("\n练习 17: 合并多个有序序列");

function* merge(...iterables) {
  const iterators = iterables.map((it) => {
    const iter = it[Symbol.iterator]();
    return { iter, current: iter.next() };
  });

  // 移除已完成的迭代器
  let active = iterators.filter((it) => !it.current.done);

  while (active.length > 0) {
    // 找到最小值
    let minIndex = 0;
    for (let i = 1; i < active.length; i++) {
      if (active[i].current.value < active[minIndex].current.value) {
        minIndex = i;
      }
    }

    yield active[minIndex].current.value;
    active[minIndex].current = active[minIndex].iter.next();

    // 移除已完成的迭代器
    active = active.filter((it) => !it.current.done);
  }
}

const sorted1 = [1, 3, 5, 7];
const sorted2 = [2, 4, 6, 8];
const sorted3 = [0, 9, 10];

console.log("合并有序数组:", [...merge(sorted1, sorted2, sorted3)]);

// ============================================
// 练习 18：实现 throttle（节流）
// ============================================

console.log("\n练习 18: 节流函数（概念演示）");

function* throttleGenerator(interval) {
  let lastExecutionTime = 0;

  while (true) {
    const currentTime = yield;

    if (currentTime - lastExecutionTime >= interval) {
      lastExecutionTime = currentTime;
      yield true; // 执行
    } else {
      yield false; // 跳过
    }
  }
}

const throttle = throttleGenerator(1000);
throttle.next(); // 启动

console.log("0ms:", throttle.next(0).value); // true
console.log("500ms:", throttle.next(500).value); // false
console.log("1001ms:", throttle.next(1001).value); // true

// ============================================
// 练习 19：实现缓存斐波那契数列
// ============================================

console.log("\n练习 19: 带缓存的斐波那契数列");

function* cachedFibonacci() {
  const cache = new Map([
    [0, 0],
    [1, 1],
  ]);
  let n = 0;

  while (true) {
    if (!cache.has(n)) {
      cache.set(n, cache.get(n - 1) + cache.get(n - 2));
    }
    yield cache.get(n);
    n++;
  }
}

const fib = cachedFibonacci();
console.log("斐波那契数列:", take(15, fib));

// ============================================
// 练习 20：实现链式流处理
// ============================================

console.log("\n练习 20: 链式流处理管道");

class Stream {
  constructor(source) {
    this.source = source;
  }

  *[Symbol.iterator]() {
    yield* this.source;
  }

  map(fn) {
    const self = this;
    return new Stream(
      (function* () {
        for (const item of self) {
          yield fn(item);
        }
      })()
    );
  }

  filter(fn) {
    const self = this;
    return new Stream(
      (function* () {
        for (const item of self) {
          if (fn(item)) {
            yield item;
          }
        }
      })()
    );
  }

  take(n) {
    const self = this;
    return new Stream(
      (function* () {
        let count = 0;
        for (const item of self) {
          if (count++ >= n) break;
          yield item;
        }
      })()
    );
  }

  toArray() {
    return [...this];
  }
}

const stream = new Stream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .filter((x) => x % 2 === 0)
  .map((x) => x * x)
  .take(3);

console.log("流处理结果:", stream.toArray());

console.log("\n=== 所有练习完成！ ===");
