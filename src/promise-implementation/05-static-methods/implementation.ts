/**
 * 第五阶段：静态方法实现
 * 
 * 在前面阶段的基础上添加：
 * 1. Promise.resolve() 和 Promise.reject()
 * 2. Promise.all() 和 Promise.race()
 * 3. Promise.allSettled() 和 Promise.any()
 * 4. 完善的错误处理机制
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

interface Thenable<T> {
  then(
    onFulfilled?: (value: T) => any,
    onRejected?: (reason: any) => any
  ): any;
}

// Promise.allSettled的结果类型
interface PromiseSettledResult<T> {
  status: 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
}

// 工具类型：获取Promise的resolve类型
type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

/**
 * 完整的Promise实现，包含所有静态方法
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

  then<U>(
    onFulfilled?: OnFulfilled<T, U>,
    onRejected?: OnRejected<U>
  ): MyPromise<U> {
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
        resolvePromise(promise, result, resolve, reject);
      } catch (error) {
        reject(error);
      }
    } else {
      resolve(value as any);
    }
  }

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
        resolvePromise(promise, result, resolve, reject);
      } catch (error) {
        reject(error);
      }
    } else {
      reject(reason);
    }
  }

  catch<U>(onRejected: OnRejected<U>): MyPromise<U> {
    return this.then(undefined, onRejected);
  }

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

  // ==================== 静态方法 ====================

  /**
   * Promise.resolve - 创建一个已解决的Promise
   */
  static resolve<T>(value: T): MyPromise<T extends MyPromise<infer U> ? U : T> {
    // 如果value已经是MyPromise实例，直接返回
    if (value instanceof MyPromise) {
      return value as any;
    }

    // 创建新的Promise并使用resolvePromise处理value
    return new MyPromise<any>((resolve, reject) => {
      resolvePromise(new MyPromise(() => {}), value, resolve, reject);
    });
  }

  /**
   * Promise.reject - 创建一个已拒绝的Promise
   */
  static reject<T = never>(reason: any): MyPromise<T> {
    return new MyPromise<T>((_resolve, reject) => {
      reject(reason);
    });
  }

  /**
   * Promise.all - 等待所有Promise完成
   * 所有Promise都成功时才成功，任意一个失败就立即失败
   */
  static all<T extends readonly unknown[] | []>(
    values: T
  ): MyPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
    return new MyPromise((resolve, reject) => {
      const promises = Array.from(values);
      
      // 空数组情况
      if (promises.length === 0) {
        resolve([] as any);
        return;
      }

      const results: any[] = new Array(promises.length);
      let completedCount = 0;

      promises.forEach((promise, index) => {
        // 将每个值转换为Promise
        MyPromise.resolve(promise).then(
          value => {
            results[index] = value;
            completedCount++;
            
            // 所有Promise都完成时resolve
            if (completedCount === promises.length) {
              resolve(results as any);
            }
          },
          reason => {
            // 任意一个失败就立即reject
            reject(reason);
          }
        );
      });
    });
  }

  /**
   * Promise.race - 等待第一个Promise完成
   * 第一个settled的Promise决定结果
   */
  static race<T extends readonly unknown[] | []>(
    values: T
  ): MyPromise<Awaited<T[number]>> {
    return new MyPromise((resolve, reject) => {
      const promises = Array.from(values);
      
      // 空数组情况 - 永远pending
      if (promises.length === 0) {
        return;
      }

      promises.forEach(promise => {
        MyPromise.resolve(promise).then(
          (value: any) => resolve(value),
          reject
        );
      });
    });
  }

  /**
   * Promise.allSettled - 等待所有Promise settled（完成或失败）
   * 返回每个Promise的结果状态
   */
  static allSettled<T extends readonly unknown[] | []>(
    values: T
  ): MyPromise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>> }> {
    return new MyPromise((resolve) => {
      const promises = Array.from(values);
      
      if (promises.length === 0) {
        resolve([] as any);
        return;
      }

      const results: PromiseSettledResult<any>[] = new Array(promises.length);
      let completedCount = 0;

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = { status: 'fulfilled', value };
            completedCount++;
            
            if (completedCount === promises.length) {
              resolve(results as any);
            }
          },
          reason => {
            results[index] = { status: 'rejected', reason };
            completedCount++;
            
            if (completedCount === promises.length) {
              resolve(results as any);
            }
          }
        );
      });
    });
  }

  /**
   * Promise.any - 等待第一个成功的Promise
   * 如果所有Promise都失败，则reject一个AggregateError
   */
  static any<T extends readonly unknown[] | []>(
    values: T
  ): MyPromise<Awaited<T[number]>> {
    return new MyPromise((resolve, reject) => {
      const promises = Array.from(values);
      
      if (promises.length === 0) {
        reject(new AggregateError([], 'All promises were rejected'));
        return;
      }

      const errors: any[] = new Array(promises.length);
      let rejectedCount = 0;

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          (value: any) => {
            // 第一个成功的Promise立即resolve
            resolve(value);
          },
          reason => {
            errors[index] = reason;
            rejectedCount++;
            
            // 所有Promise都失败时reject
            if (rejectedCount === promises.length) {
              reject(new AggregateError(errors, 'All promises were rejected'));
            }
          }
        );
      });
    });
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
 */
function resolvePromise<T>(
  promise: MyPromise<T>,
  x: any,
  resolve: (value: T) => void,
  reject: (reason: any) => void
): void {
  if (promise === x) {
    reject(new TypeError('Chaining cycle detected for promise'));
    return;
  }

  if (x instanceof MyPromise) {
    if (x.getState() === PromiseState.PENDING) {
      x.then(
        value => resolvePromise(promise, value, resolve, reject),
        reject
      );
    } else {
      x.then(resolve, reject);
    }
    return;
  }

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let then: any;
    
    try {
      then = x.then;
    } catch (error) {
      reject(error);
      return;
    }

    if (typeof then === 'function') {
      let called = false;

      try {
        then.call(
          x,
          (y: any) => {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          (r: any) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } catch (error) {
        if (!called) {
          reject(error);
        }
      }
    } else {
      resolve(x);
    }
  } else {
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

/**
 * AggregateError实现（如果环境不支持）
 */
class AggregateError extends Error {
  public errors: any[];
  
  constructor(errors: any[], message: string) {
    super(message);
    this.name = 'AggregateError';
    this.errors = errors;
  }
}

// 确保AggregateError在全局可用
if (typeof globalThis !== 'undefined' && !(globalThis as any).AggregateError) {
  (globalThis as any).AggregateError = AggregateError;
}

export {
  AggregateError, Executor,
  OnFulfilled,
  OnRejected, PromiseSettledResult, PromiseState, resolvePromise,
  runMicrotask, Thenable
};

