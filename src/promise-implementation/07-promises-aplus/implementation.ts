/**
 * Promise/A+规范完全兼容实现
 * 
 * 严格按照Promise/A+规范实现，通过promises-aplus-tests测试套件
 * 规范地址: https://promisesaplus.com/
 */

// Promise的三种状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

/**
 * Promise/A+兼容的Promise实现
 */
export class MyPromise {
  private state = PENDING;
  private value: any = undefined;
  private reason: any = undefined;
  private onFulfilledCallbacks: Array<() => void> = [];
  private onRejectedCallbacks: Array<() => void> = [];

  constructor(executor: (resolve: (value?: any) => void, reject: (reason?: any) => void) => void) {
    // resolve函数
    const resolve = (value?: any): void => {
      // 2.1.2.1 只有在pending状态才能转换到fulfilled
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        
        // 2.2.6.1 异步执行所有onFulfilled回调
        this.onFulfilledCallbacks.forEach(callback => callback());
      }
    };

    // reject函数
    const reject = (reason?: any): void => {
      // 2.1.3.1 只有在pending状态才能转换到rejected
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        
        // 2.2.6.2 异步执行所有onRejected回调
        this.onRejectedCallbacks.forEach(callback => callback());
      }
    };

    try {
      // 立即执行executor
      executor(resolve, reject);
    } catch (error) {
      // 如果executor抛出异常，reject这个promise
      reject(error);
    }
  }

  /**
   * then方法 - Promise/A+规范的核心
   * 2.2 then方法
   */
  then(onFulfilled?: any, onRejected?: any): MyPromise {
    // 2.2.1 onFulfilled和onRejected都是可选参数
    // 2.2.1.1 如果onFulfilled不是函数，忽略它
    const realOnFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value: any) => value;
    
    // 2.2.1.2 如果onRejected不是函数，忽略它
    const realOnRejected = typeof onRejected === 'function' ? onRejected : (reason: any) => { throw reason; };

    // 2.2.7 then必须返回一个promise
    const promise2 = new MyPromise((resolve, reject) => {
      
      if (this.state === FULFILLED) {
        // 2.2.2.1 如果promise是fulfilled状态，执行onFulfilled
        // 2.2.4 onFulfilled和onRejected必须异步执行
        runAsync(() => {
          try {
            // 2.2.2.1 调用onFulfilled，传入value作为第一个参数
            const x = realOnFulfilled(this.value);
            // 2.2.7.1 运行Promise Resolution Procedure
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            // 2.2.7.2 如果onFulfilled抛出异常e，promise2必须用e作为reason被reject
            reject(error);
          }
        });
      } else if (this.state === REJECTED) {
        // 2.2.3.1 如果promise是rejected状态，执行onRejected
        runAsync(() => {
          try {
            // 2.2.3.1 调用onRejected，传入reason作为第一个参数
            const x = realOnRejected(this.reason);
            // 2.2.7.1 运行Promise Resolution Procedure
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            // 2.2.7.2 如果onRejected抛出异常e，promise2必须用e作为reason被reject
            reject(error);
          }
        });
      } else {
        // 2.2.6 如果promise是pending状态，onFulfilled和onRejected必须被存储
        this.onFulfilledCallbacks.push(() => {
          runAsync(() => {
            try {
              const x = realOnFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          runAsync(() => {
            try {
              const x = realOnRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }

  // 便利方法（不是Promise/A+规范的一部分）
  catch(onRejected: any): MyPromise {
    return this.then(undefined, onRejected);
  }

  // 静态方法（不是Promise/A+规范的一部分，但为了兼容性）
  static resolve(value?: any): MyPromise {
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }

  static reject(reason?: any): MyPromise {
    return new MyPromise((_resolve, reject) => {
      reject(reason);
    });
  }

  // 调试方法
  getState() {
    return this.state;
  }

  getValue() {
    return this.value;
  }

  getReason() {
    return this.reason;
  }
}

/**
 * Promise Resolution Procedure
 * 2.3 Promise解析过程
 */
function resolvePromise(promise2: MyPromise, x: any, resolve: Function, reject: Function): void {
  // 2.3.1 如果promise和x指向同一对象，用TypeError作为reason reject promise
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  // 2.3.2 如果x是一个promise，采用其状态
  if (x instanceof MyPromise) {
    // 2.3.2.1 如果x是pending状态，promise必须保持pending直到x被fulfilled或rejected
    if (x.getState() === PENDING) {
      x.then((value: any) => {
        resolvePromise(promise2, value, resolve, reject);
      }, reject);
    } else {
      // 2.3.2.2 如果x是fulfilled状态，用相同的value fulfill promise
      // 2.3.2.3 如果x是rejected状态，用相同的reason reject promise
      x.then(resolve, reject);
    }
    return;
  }

  // 2.3.3 如果x是对象或函数
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    let called = false; // 避免重复调用

    try {
      // 2.3.3.1 让then等于x.then
      const then = x.then;
      
      // 2.3.3.3 如果then是函数，用x作为this调用它
      if (typeof then === 'function') {
        then.call(
          x,
          // 2.3.3.3.1 如果resolvePromise被调用
          (y: any) => {
            // 2.3.3.3.3 如果resolvePromise和rejectPromise都被调用，
            // 或者多次调用同一个函数，第一次调用生效，后续调用忽略
            if (called) return;
            called = true;
            // 2.3.3.3.1 递归调用[[Resolve]](promise, y)
            resolvePromise(promise2, y, resolve, reject);
          },
          // 2.3.3.3.2 如果rejectPromise被调用
          (r: any) => {
            // 2.3.3.3.3 避免重复调用
            if (called) return;
            called = true;
            // 2.3.3.3.2 用r作为reason reject promise
            reject(r);
          }
        );
      } else {
        // 2.3.3.4 如果then不是函数，用x作为value fulfill promise
        resolve(x);
      }
    } catch (error) {
      // 2.3.3.2 如果取x.then的值时抛出异常e，用e作为reason reject promise
      // 2.3.3.3.4 如果调用then方法抛出异常e
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 2.3.4 如果x不是对象或函数，用x作为value fulfill promise
    resolve(x);
  }
}

/**
 * 异步执行函数
 * 2.2.4 onFulfilled和onRejected必须异步执行
 */
function runAsync(callback: () => void): void {
  // 优先使用queueMicrotask（如果可用）
  if (typeof queueMicrotask !== 'undefined') {
    queueMicrotask(callback);
  } 
  // 降级使用process.nextTick（Node.js环境）
  else if (typeof process !== 'undefined' && process.nextTick) {
    process.nextTick(callback);
  } 
  // 最后降级使用setTimeout
  else {
    setTimeout(callback, 0);
  }
}

// 为了兼容性，也导出默认的Promise类
export default MyPromise;
