/**
 * 第二阶段：异步Promise实现
 * 
 * 在第一阶段的基础上添加：
 * 1. 异步resolve/reject支持
 * 2. 回调队列管理
 * 3. 微任务模拟
 * 4. 完整的then方法异步处理
 */

// 继承第一阶段的基础类型
enum PromiseState {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected'
}

type Executor<T> = (
  resolve: (value: T) => void,
  reject: (reason: any) => void
) => void;

type OnFulfilled<T, U> = (value: T) => U | MyPromise<U>;
type OnRejected<U> = (reason: any) => U | MyPromise<U>;

// 回调项接口（暂未使用，为后续扩展准备）
// interface CallbackItem<T, U> {
//   onFulfilled?: OnFulfilled<T, U>;
//   onRejected?: OnRejected<U>;
//   resolve: (value: U) => void;
//   reject: (reason: any) => void;
// }

/**
 * 异步Promise实现
 * @template T resolve值的类型
 */
export class MyPromise<T> {
  private state: PromiseState = PromiseState.PENDING;
  private value: T | undefined = undefined;
  private reason: any = undefined;
  
  // 回调队列 - 存储pending状态时注册的回调
  private onFulfilledCallbacks: Array<() => void> = [];
  private onRejectedCallbacks: Array<() => void> = [];

  constructor(executor: Executor<T>) {
    // resolve函数
    const resolve = (value: T): void => {
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.FULFILLED;
        this.value = value;
        
        // 异步执行所有等待的成功回调
        runMicrotask(() => {
          this.onFulfilledCallbacks.forEach(callback => callback());
          // 清空回调队列
          this.onFulfilledCallbacks = [];
        });
      }
    };

    // reject函数
    const reject = (reason: any): void => {
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.REJECTED;
        this.reason = reason;
        
        // 异步执行所有等待的失败回调
        runMicrotask(() => {
          this.onRejectedCallbacks.forEach(callback => callback());
          // 清空回调队列
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
   * then方法 - 完整的异步实现
   */
  then<U>(
    onFulfilled?: OnFulfilled<T, U>,
    onRejected?: OnRejected<U>
  ): MyPromise<U> {
    return new MyPromise<U>((resolve, reject) => {
      
      // 处理fulfilled状态
      if (this.state === PromiseState.FULFILLED) {
        runMicrotask(() => {
          this.handleCallback(onFulfilled, this.value!, resolve, reject, true);
        });
      } 
      // 处理rejected状态
      else if (this.state === PromiseState.REJECTED) {
        runMicrotask(() => {
          this.handleCallback(onRejected, this.reason, resolve, reject, false);
        });
      } 
      // 处理pending状态 - 关键的异步支持
      else {
        // 将回调添加到队列中，等待状态改变时执行
        this.onFulfilledCallbacks.push(() => {
          this.handleCallback(onFulfilled, this.value!, resolve, reject, true);
        });
        
        this.onRejectedCallbacks.push(() => {
          this.handleCallback(onRejected, this.reason, resolve, reject, false);
        });
      }
    });
  }

  /**
   * 统一处理回调执行逻辑
   */
  private handleCallback<U>(
    callback: ((value: any) => U | MyPromise<U>) | undefined,
    value: any,
    resolve: (value: U) => void,
    reject: (reason: any) => void,
    isFulfilled: boolean
  ): void {
    if (callback) {
      try {
        const result = callback(value);
        
        // 如果回调返回Promise，需要等待其完成
        if (result instanceof MyPromise) {
          result.then(resolve, reject);
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    } else {
      // 如果没有提供回调，直接传递值或错误
      if (isFulfilled) {
        resolve(value as U);
      } else {
        reject(value);
      }
    }
  }

  /**
   * catch方法
   */
  catch<U>(onRejected: OnRejected<U>): MyPromise<U> {
    return this.then(undefined, onRejected);
  }

  /**
   * finally方法 - 无论成功还是失败都会执行
   */
  finally(onFinally: () => void): MyPromise<T> {
    return this.then(
      value => {
        onFinally();
        return value;
      },
      reason => {
        onFinally();
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

  /**
   * 获取当前等待的回调数量（用于调试）
   */
  getPendingCallbacksCount(): { fulfilled: number; rejected: number } {
    return {
      fulfilled: this.onFulfilledCallbacks.length,
      rejected: this.onRejectedCallbacks.length
    };
  }
}

/**
 * 微任务执行函数
 * 优先使用queueMicrotask，降级使用setTimeout
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
export { Executor, OnFulfilled, OnRejected, PromiseState, runMicrotask };

