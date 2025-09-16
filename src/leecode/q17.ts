type F17<T = unknown> = () => Promise<T>;
// 不要用同步 while 等异步完成；用“事件驱动/回调递归”触发下一次调度，直到所有任务结束。

function promisePool<T>(tasks: F17<T>[], n: number): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = []; // 执行结果的收集返回（保持与任务索引一致的顺序）
    let inFlight = 0; // 同时在执行的任务, 最大并发量的控制
    let index = 0; // 下一个待启动任务的索引

    const startNext = () => {
      if (index === tasks.length && inFlight === 0) return resolve(results);
      while (inFlight < n && index < tasks.length) {
        const taskIndex = index;
        const current = tasks[index++];
        inFlight++;
        current()
          .then((value) => {
            results[taskIndex] = value;
          })
          .catch(reject)
          .finally(() => {
            inFlight--;
            startNext();
          });
      }
    };

    startNext();
  });
}

var promisePool2 = async function <T>(
  functions: Array<() => Promise<T>>,
  n: number
) {
  // 使用 Set 存储正在执行的任务队列
  const queue = new Set<Promise<T>>();
  const resolved: T[] = [];

  for (const task of functions) {
    // 将正在执行的任务加入到队列中
    const p = task().then((res) => {
      // 任务执行完成后将结果存到 resolved 数组中（按完成顺序）
      resolved.push(res);
      // 完成后移出正在执行队列
      queue.delete(p);
      return res;
    });
    queue.add(p);
    // 控制线程池执行最大数，“限流阀”
    if (queue.size >= n) {
      await Promise.race(queue);
    }
  }
  // 执行完所有任务后才返回执行结果（兼容无 allSettled 的环境）
  await Promise.all(Array.from(queue, (p) => p.catch(() => undefined)));
  return resolved;
};

// 通用 delay 工具（跨 Node/浏览器）
const delay = (ms: number) =>
  new Promise<void>((resolve) => globalThis.setTimeout(resolve, ms));

const functions: F17<void>[] = [
  () => delay(300),
  () => delay(400),
  () => delay(200),
];

const promiseRes = promisePool(functions, 2);
promiseRes.then(globalThis.console.log);
