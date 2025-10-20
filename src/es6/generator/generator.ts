/**
 * ES6 Generator TypeScript 版本
 * 包含类型定义和更高级的用法
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

// ============================================
// 类型定义
// ============================================

interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  userId: number;
}

interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

// ============================================
// 1. 基础 Generator 类型
// ============================================

function* typedGenerator(): Generator<number, string, boolean> {
  // Generator<Yield类型, Return类型, Next参数类型>
  const input1 = yield 1; // input1 的类型是 boolean
  const input2 = yield 2;
  return "done";
}

// ============================================
// 2. 异步操作辅助函数
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchUser(id: number): Promise<User> {
  return delay(100).then(() => ({ id, name: `User${id}` }));
}

function fetchPosts(userId: number): Promise<Post[]> {
  return delay(100).then(() => [
    { id: 1, title: "Post 1", userId },
    { id: 2, title: "Post 2", userId },
  ]);
}

// ============================================
// 3. 自动执行 Generator 的工具函数
// ============================================

function runGenerator<T>(
  generatorFunc: () => Generator<Promise<any>, T, any>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const generator = generatorFunc();

    function step(nextValue?: any): void {
      let result;
      try {
        result = generator.next(nextValue);
      } catch (e) {
        return reject(e);
      }

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

// ============================================
// 4. 实用 Generator 工具类
// ============================================

class GeneratorUtils {
  /**
   * 生成范围内的数字
   */
  static *range(
    start: number,
    end: number,
    step: number = 1
  ): Generator<number> {
    for (let i = start; i < end; i += step) {
      yield i;
    }
  }

  /**
   * 重复生成值
   */
  static *repeat<T>(value: T, times: number): Generator<T> {
    for (let i = 0; i < times; i++) {
      yield value;
    }
  }

  /**
   * 无限循环生成值
   */
  static *cycle<T>(iterable: Iterable<T>): Generator<T> {
    const items = [...iterable];
    while (true) {
      for (const item of items) {
        yield item;
      }
    }
  }

  /**
   * 获取前 n 个元素
   */
  static take<T>(n: number, iterable: Iterable<T>): T[] {
    const result: T[] = [];
    for (const item of iterable) {
      if (result.length >= n) break;
      result.push(item);
    }
    return result;
  }

  /**
   * 过滤
   */
  static *filter<T>(
    iterable: Iterable<T>,
    predicate: (item: T) => boolean
  ): Generator<T> {
    for (const item of iterable) {
      if (predicate(item)) {
        yield item;
      }
    }
  }

  /**
   * 映射
   */
  static *map<T, U>(
    iterable: Iterable<T>,
    mapper: (item: T) => U
  ): Generator<U> {
    for (const item of iterable) {
      yield mapper(item);
    }
  }

  /**
   * 合并多个可迭代对象
   */
  static *zip<T>(...iterables: Iterable<T>[]): Generator<T[]> {
    const iterators = iterables.map((i) => i[Symbol.iterator]());

    while (true) {
      const results = iterators.map((it) => it.next());
      if (results.some((r) => r.done)) break;
      yield results.map((r) => r.value);
    }
  }

  /**
   * 展平嵌套的可迭代对象
   */
  static *flatten<T>(iterable: Iterable<any>): Generator<T> {
    for (const item of iterable) {
      if (item && typeof item[Symbol.iterator] === "function") {
        yield* GeneratorUtils.flatten(item);
      } else {
        yield item;
      }
    }
  }
}

// ============================================
// 5. 树的遍历
// ============================================

class TreeTraversal {
  /**
   * 深度优先遍历（前序）
   */
  static *depthFirstPreorder<T>(node: TreeNode<T>): Generator<T> {
    yield node.value;
    if (node.children) {
      for (const child of node.children) {
        yield* TreeTraversal.depthFirstPreorder(child);
      }
    }
  }

  /**
   * 深度优先遍历（后序）
   */
  static *depthFirstPostorder<T>(node: TreeNode<T>): Generator<T> {
    if (node.children) {
      for (const child of node.children) {
        yield* TreeTraversal.depthFirstPostorder(child);
      }
    }
    yield node.value;
  }

  /**
   * 广度优先遍历
   */
  static *breadthFirst<T>(node: TreeNode<T>): Generator<T> {
    const queue: TreeNode<T>[] = [node];

    while (queue.length > 0) {
      const current = queue.shift()!;
      yield current.value;

      if (current.children) {
        queue.push(...current.children);
      }
    }
  }
}

// ============================================
// 6. 斐波那契数列生成器
// ============================================

function* fibonacci(): Generator<number> {
  let [prev, curr] = [0, 1];

  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

// ============================================
// 7. ID 生成器
// ============================================

class IdGenerator {
  private currentId: number;

  constructor(start: number = 1) {
    this.currentId = start;
  }

  *generate(): Generator<number> {
    while (true) {
      yield this.currentId++;
    }
  }

  *generateWithPrefix(prefix: string): Generator<string> {
    while (true) {
      yield `${prefix}-${this.currentId++}`;
    }
  }
}

// ============================================
// 8. 分页数据生成器
// ============================================

interface PageData<T> {
  page: number;
  pageSize: number;
  data: T[];
  hasMore: boolean;
}

class PaginationGenerator<T> {
  constructor(private dataSource: T[], private pageSize: number) {}

  *pages(): Generator<PageData<T>> {
    let page = 1;
    let offset = 0;

    while (offset < this.dataSource.length) {
      const data = this.dataSource.slice(offset, offset + this.pageSize);
      const hasMore = offset + this.pageSize < this.dataSource.length;

      yield { page, pageSize: this.pageSize, data, hasMore };

      page++;
      offset += this.pageSize;
    }
  }
}

// ============================================
// 9. 状态机
// ============================================

type State = "idle" | "loading" | "success" | "error";
type Action = "start" | "resolve" | "reject" | "reset";

class StateMachine {
  private currentState: State = "idle";

  *transitions(): Generator<State, void, Action> {
    while (true) {
      const action = yield this.currentState;

      switch (this.currentState) {
        case "idle":
          if (action === "start") this.currentState = "loading";
          break;
        case "loading":
          if (action === "resolve") this.currentState = "success";
          else if (action === "reject") this.currentState = "error";
          break;
        case "success":
        case "error":
          if (action === "reset") this.currentState = "idle";
          break;
      }
    }
  }
}

// ============================================
// 10. 异步队列处理器
// ============================================

class AsyncQueue<T, R> {
  private queue: T[] = [];

  constructor(private processor: (item: T) => Promise<R>) {}

  enqueue(item: T): void {
    this.queue.push(item);
  }

  async *process(): AsyncGenerator<R> {
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      const result = await this.processor(item);
      yield result;
    }
  }
}

// ============================================
// 11. 流式数据处理管道
// ============================================

class Pipeline<T> {
  public source: Iterable<T>;

  constructor(source: Iterable<T>) {
    this.source = source;
  }

  *filter(predicate: (item: T) => boolean): Generator<T> {
    for (const item of this.source) {
      if (predicate(item)) {
        yield item;
      }
    }
  }

  *map<U>(mapper: (item: T) => U): Generator<U> {
    for (const item of this.source) {
      yield mapper(item);
    }
  }

  *take(n: number): Generator<T> {
    let count = 0;
    for (const item of this.source) {
      if (count++ >= n) break;
      yield item;
    }
  }

  *skip(n: number): Generator<T> {
    let count = 0;
    for (const item of this.source) {
      if (count++ >= n) {
        yield item;
      }
    }
  }

  toArray(): T[] {
    return [...this.source];
  }
}

// ============================================
// 12. 可观察对象（基于 Generator）
// ============================================

type Observer<T> = (value: T) => void;

class Observable<T> {
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>): () => void {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  *emit(): Generator<void, void, T> {
    while (true) {
      const value = yield;
      this.observers.forEach((observer) => observer(value));
    }
  }
}

// ============================================
// 13. 使用示例
// ============================================

async function examples() {
  console.log("=== TypeScript Generator 示例 ===\n");

  // 示例 1: 范围生成器
  console.log("1. 范围生成器:");
  console.log("range(0, 10, 2):", [...GeneratorUtils.range(0, 10, 2)]);

  // 示例 2: 斐波那契数列
  console.log("\n2. 斐波那契数列:");
  console.log("前 10 个:", GeneratorUtils.take(10, fibonacci()));

  // 示例 3: ID 生成器
  console.log("\n3. ID 生成器:");
  const idGen = new IdGenerator(100);
  const ids = idGen.generate();
  console.log("ID:", ids.next().value, ids.next().value, ids.next().value);

  // 示例 4: 树的遍历
  console.log("\n4. 树的遍历:");
  const tree: TreeNode<number> = {
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

  console.log("深度优先（前序）:", [...TreeTraversal.depthFirstPreorder(tree)]);
  console.log("深度优先（后序）:", [
    ...TreeTraversal.depthFirstPostorder(tree),
  ]);
  console.log("广度优先:", [...TreeTraversal.breadthFirst(tree)]);

  // 示例 5: 分页
  console.log("\n5. 分页数据:");
  const data = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }));
  const paginator = new PaginationGenerator(data, 10);

  for (const page of paginator.pages()) {
    console.log(
      `第 ${page.page} 页 (${page.data.length} 项), 还有更多: ${page.hasMore}`
    );
  }

  // 示例 6: 状态机
  console.log("\n6. 状态机:");
  const sm = new StateMachine();
  const machine = sm.transitions();
  machine.next(); // 启动
  console.log("初始状态:", machine.next("start").value);
  console.log("开始加载:", machine.next("resolve").value);
  console.log("加载成功:", machine.next("reset").value);
  console.log("重置:", machine.next().value);

  // 示例 7: 数据处理管道
  console.log("\n7. 数据处理管道:");
  const pipeline = new Pipeline([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const result = [
    ...GeneratorUtils.map(
      GeneratorUtils.filter(pipeline.source, (x) => x % 2 === 0),
      (x) => x * 2
    ),
  ];
  console.log("偶数翻倍:", result);

  // 示例 8: 异步 Generator
  console.log("\n8. 异步操作:");
  function* fetchDataGen() {
    const user: User = yield fetchUser(1);
    console.log("用户:", user);
    const posts: Post[] = yield fetchPosts(user.id);
    console.log("文章:", posts);
    return { user, posts };
  }

  const asyncResult = await runGenerator(fetchDataGen);
  console.log("最终结果:", asyncResult);

  // 示例 9: 工具函数组合
  console.log("\n9. 工具函数组合:");
  const combined = GeneratorUtils.take(
    10,
    GeneratorUtils.map(
      GeneratorUtils.filter(GeneratorUtils.range(1, 100), (x) => x % 3 === 0),
      (x) => x * x
    )
  );
  console.log("能被3整除的数的平方（前10个）:", combined);

  // 示例 10: zip 函数
  console.log("\n10. Zip 函数:");
  const zipped = [
    ...GeneratorUtils.zip<number | string | boolean>(
      [1, 2, 3],
      ["a", "b", "c"],
      [true, false, true]
    ),
  ];
  console.log("Zipped:", zipped);
}

// ============================================
// 14. 高级示例：实现 async/await 的原理
// ============================================

function spawn<T>(
  generatorFunc: () => Generator<Promise<any>, T, any>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const gen = generatorFunc();

    function step(nextValue?: any) {
      let result: IteratorResult<Promise<any>, T>;

      try {
        result = gen.next(nextValue);
      } catch (e) {
        return reject(e);
      }

      if (result.done) {
        return resolve(result.value);
      }

      Promise.resolve(result.value).then(
        (value) => step(value),
        (error) => {
          try {
            result = gen.throw!(error);
            step(result.value);
          } catch (e) {
            reject(e);
          }
        }
      );
    }

    step();
  });
}

// 使用 spawn 实现类似 async/await 的效果
function* generatorAsyncFunction() {
  try {
    const user: User = yield fetchUser(1);
    const posts: Post[] = yield fetchPosts(user.id);
    return { user, posts };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// ============================================
// 运行示例
// ============================================

// 如果是直接运行此文件，则执行示例
if (typeof require !== "undefined" && typeof module !== "undefined") {
  // Node.js 环境
  if (require.main === module) {
    examples().catch(console.error);
  }
}

// 导出所有工具
export {
  AsyncQueue,
  fibonacci,
  GeneratorUtils,
  IdGenerator,
  Observable,
  PaginationGenerator,
  Pipeline,
  runGenerator,
  spawn,
  StateMachine,
  TreeTraversal,
};

export type { Action, Observer, PageData, Post, State, TreeNode, User };
