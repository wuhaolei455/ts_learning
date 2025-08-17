/**
 * 第三阶段：完善Then链式调用实现
 * 
 * 在前两阶段的基础上添加：
 * 1. Promise Resolution Procedure
 * 2. Thenable对象支持
 * 3. 循环引用检测
 * 4. 完善的值透传机制
 */

enum PromiseState {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected'
}

type Executor<T> = (
  resolve: (value: T) => void,
  reject: (reason: any) => void
) => void;

type OnFulfilled<T, U> = (value: T) => U | MyPromise<U> | Thenable<U>;
type OnRejected<U> = (reason: any) => U | MyPromise<U> | Thenable<U>;

// Thenable接口定义
interface Thenable<T> {
  then(
    onFulfilled?: (value: T) => any,
    onRejected?: (reason: any) => any
  ): any;
}

/**
 * 完善的Promise实现，支持Promise/A+规范的Resolution Procedure
 */
export class MyPromise<T> {
  private state: PromiseState = PromiseState.PENDING;
  private value: T | undefined = undefined;
  private reason: any = undefined;
  private onFulfilledCallbacks: Array<() => void> = [];
  private onRejectedCallbacks: Array<() => void> = [];

  constructor(executor: Executor<T>) {
    const resolve = (value: T): void => {
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.FULFILLED;
        this.value = value;
        
        runMicrotask(() => {
          this.onFulfilledCallbacks.forEach(callback => callback());
          this.onFulfilledCallbacks = [];
        });
      }
    };

    const reject = (reason: any): void => {
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.REJECTED;
        this.reason = reason;
        
        runMicrotask(() => {
          this.onRejectedCallbacks.forEach(callback => callback());
          this.onRejectedCallbacks = [];
        });
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * then方法 - 完整实现，支持Promise Resolution Procedure
   */
  then<U>(
    onFulfilled?: OnFulfilled<T, U>,
    onRejected?: OnRejected<U>
  ): MyPromise<U> {
    // 创建新的Promise
    const newPromise = new MyPromise<U>((resolve, reject) => {
      
      if (this.state === PromiseState.FULFILLED) {
        runMicrotask(() => {
          this.handleCallback(newPromise, onFulfilled, this.value!, resolve, reject);
        });
      } 
      else if (this.state === PromiseState.REJECTED) {
        runMicrotask(() => {
          this.handleRejection(newPromise, onRejected, this.reason, resolve, reject);
        });
      } 
      else {
        // pending状态，添加到回调队列
        this.onFulfilledCallbacks.push(() => {
          this.handleCallback(newPromise, onFulfilled, this.value!, resolve, reject);
        });
        
        this.onRejectedCallbacks.push(() => {
          this.handleRejection(newPromise, onRejected, this.reason, resolve, reject);
        });
      }
    });

    return newPromise;
  }

  /**
   * 处理fulfilled状态的回调
   */
  private handleCallback<U>(
    promise: MyPromise<U>,
    callback: OnFulfilled<T, U> | undefined,
    value: T,
    resolve: (value: U) => void,
    reject: (reason: any) => void
  ): void {
    if (typeof callback === 'function') {
      try {
        const result = callback(value);
        // 使用Promise Resolution Procedure处理返回值
        resolvePromise(promise, result, resolve, reject);
      } catch (error) {
        reject(error);
      }
    } else {
      // 值透传：如果没有onFulfilled，直接传递值
      resolve(value as any);
    }
  }

  /**
   * 处理rejected状态的回调
   */
  private handleRejection<U>(
    promise: MyPromise<U>,
    callback: OnRejected<U> | undefined,
    reason: any,
    resolve: (value: U) => void,
    reject: (reason: any) => void
  ): void {
    if (typeof callback === 'function') {
      try {
        const result = callback(reason);
        // 使用Promise Resolution Procedure处理返回值
        resolvePromise(promise, result, resolve, reject);
      } catch (error) {
        reject(error);
      }
    } else {
      // 错误透传：如果没有onRejected，直接传递错误
      reject(reason);
    }
  }

  /**
   * catch方法
   */
  catch<U>(onRejected: OnRejected<U>): MyPromise<U> {
    return this.then(undefined, onRejected);
  }

  /**
   * finally方法
   */
  finally(onFinally: () => void | MyPromise<any>): MyPromise<T> {
    return this.then(
      value => {
        const result = onFinally();
        if (result instanceof MyPromise) {
          return result.then(() => value);
        }
        return value;
      },
      reason => {
        const result = onFinally();
        if (result instanceof MyPromise) {
          return result.then(() => { throw reason; });
        }
        throw reason;
      }
    );
  }

  // 调试方法
  getState(): PromiseState {
    return this.state;
  }

  getValue(): T | undefined {
    return this.value;
  }

  getReason(): any {
    return this.reason;
  }

  getPendingCallbacksCount(): { fulfilled: number; rejected: number } {
    return {
      fulfilled: this.onFulfilledCallbacks.length,
      rejected: this.onRejectedCallbacks.length
    };
  }
}

/**
 * Promise Resolution Procedure
 * 这是Promise/A+规范的核心部分
 */
function resolvePromise<T>(
  promise: MyPromise<T>,
  x: any,
  resolve: (value: T) => void,
  reject: (reason: any) => void
): void {
  // 2.3.1 如果promise和x指向同一对象，抛出TypeError
  if (promise === x) {
    reject(new TypeError('Chaining cycle detected for promise'));
    return;
  }

  // 2.3.2 如果x是Promise实例
  if (x instanceof MyPromise) {
    // 2.3.2.1 如果x是pending状态，promise必须保持pending直到x被fulfilled或rejected
    if (x.getState() === PromiseState.PENDING) {
      x.then(
        value => resolvePromise(promise, value, resolve, reject),
        reject
      );
    } else {
      // 2.3.2.2/2.3.2.3 如果x已经settled，用相同的值fulfill或reject promise
      x.then(resolve, reject);
    }
    return;
  }

  // 2.3.3 如果x是对象或函数
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let then: any;
    
    try {
      // 2.3.3.1 获取x.then
      then = x.then;
    } catch (error) {
      // 2.3.3.2 如果获取x.then抛出异常，reject promise
      reject(error);
      return;
    }

    // 2.3.3.3 如果then是函数，认为x是thenable
    if (typeof then === 'function') {
      let called = false; // 防止重复调用

      try {
        // 2.3.3.3.1 调用x.then
        then.call(
          x,
          // resolvePromise
          (y: any) => {
            if (called) return;
            called = true;
            // 2.3.3.3.1 递归调用resolvePromise
            resolvePromise(promise, y, resolve, reject);
          },
          // rejectPromise  
          (r: any) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } catch (error) {
        // 2.3.3.3.4 如果调用then抛出异常
        if (!called) {
          reject(error);
        }
      }
    } else {
      // 2.3.3.4 如果then不是函数，直接resolve x
      resolve(x);
    }
  } else {
    // 2.3.4 如果x不是对象或函数，直接resolve x
    resolve(x);
  }
}

/**
 * 微任务执行函数
 */
function runMicrotask(callback: () => void): void {
  if (typeof queueMicrotask !== 'undefined') {
    queueMicrotask(callback);
  } else if (typeof process !== 'undefined' && process.nextTick) {
    process.nextTick(callback);
  } else {
    setTimeout(callback, 0);
  }
}

// 导出类型和工具函数
export { Executor, OnFulfilled, OnRejected, PromiseState, resolvePromise, runMicrotask, Thenable };

