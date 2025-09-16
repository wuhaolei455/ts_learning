type Fn18 = (...params: any[]) => Promise<any>;

function timeLimit(fn: Fn18, t: number): Fn18 {
  return async function (...args) {
    const start = Date.now();
    const result = await fn(...args);
    const end = Date.now();
    if (end - start > t) {
      throw new Error("Time Limit Exceeded");
    }
    return result;
  };
}

function timeLimit2(fn: Fn18, t: number): Fn18 {
  return async function (...args) {
    const start = Date.now();
    return fn(...args).finally(() => {
      const end = Date.now();
      if (end - start > t) {
        throw new Error("Time Limit Exceeded");
      }
    });
  };
}

// 超时判断时机错误: 现在是等待 fn(...args) 完全执行后再用 Date.now()比对。如果超过 t，这时才抛错，导致不能在t时刻及时拒绝，示例中的“100ms 就报错”无法满足。
// 如何中断, 自己开一个计时器
function timeLimit3(fn: Fn18, t: number): Fn18 {
  let isFinished = false;
  return async function (...args) {
    try {
      globalThis.setTimeout(() => {
        if (!isFinished) {
          throw new Error("Time Limit Exceeded");
        }
      }, t);
    } catch (error) {
      throw new Error("Time Limit Exceeded");
    }
    const result = fn(...args).then(() => {
      isFinished = true;
    });

    return result;
  };
}

// throw 无法拒绝调用者的 Promise: 在 setTimeout 回调里 throw，不会让外层返回的 Promise 变为 rejected，只会变成未捕获异常。
// 主动reject、resolve
function timeLimit4(fn: Fn18, t: number): Fn18 {
  let isFinished = false;
  return async function (...args) {
    globalThis.setTimeout(() => {
      if (!isFinished) {
        Promise.reject("Time Limit Exceeded");
      }
    }, t);
    const result = fn(...args).then(() => {
      isFinished = true;
    });

    return result;
  };
}

// 在Promise中创建一个timerPromise
// Promise.race([fn(...args), timeoutPromise]) fn先成功返回运行结果；计时器先成功返回报错
function timeLimit5(fn: Fn18, t: number): Fn18 {
  return async function (...args) {
    let timer;
    const timeoutPromise = new Promise((res, rej) => {
      timer = globalThis.setTimeout(() => rej("Time Limit Exceeded"), t);
    });

    const result = Promise.race([fn(...args), timeoutPromise]).then((res) => {
      globalThis.clearTimeout(timer);
      return res;
    });

    // return () => result;
    return res;
  };
}

/**
 * const limited = timeLimit((t) => new Promise(res => setTimeout(res, t)), 100);
 * limited(150).catch(console.log) // "Time Limit Exceeded" at t=100ms
 */
