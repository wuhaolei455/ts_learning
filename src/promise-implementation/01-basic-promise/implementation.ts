/**
 * 第一阶段：基础Promise实现
 * 
 * 这个阶段实现了最基础的Promise功能：
 * 1. 三种状态管理
 * 2. 同步的resolve/reject
 * 3. 基础的then方法
 * 4. TypeScript泛型支持
 */

// Promise的三种状态
enum PromiseState {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected'
}

// 执行器函数类型
type Executor<T> = (
  resolve: (value: T) => void,
  reject: (reason: any) => void
) => void;

// then方法的回调函数类型
type OnFulfilled<T, U> = (value: T) => U | MyPromise<U>;
type OnRejected<U> = (reason: any) => U | MyPromise<U>;

/**
 * 基础Promise实现
 * @template T resolve值的类型
 */
export class MyPromise<T> {
  // Promise的当前状态
  private state: PromiseState = PromiseState.PENDING;
  
  // resolve的值
  private value: T | undefined = undefined;
  
  // reject的原因
  private reason: any = undefined;

  /**
   * Promise构造函数
   * @param executor 执行器函数，立即执行
   */
  constructor(executor: Executor<T>) {
    // 定义resolve函数
    const resolve = (value: T): void => {
      // 只有在pending状态下才能改变状态
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.FULFILLED;
        this.value = value;
      }
    };

    // 定义reject函数
    const reject = (reason: any): void => {
      // 只有在pending状态下才能改变状态
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.REJECTED;
        this.reason = reason;
      }
    };

    try {
      // 立即执行executor
      executor(resolve, reject);
    } catch (error) {
      // 如果executor执行过程中出错，直接reject
      reject(error);
    }
  }

  /**
   * then方法 - Promise的核心方法
   * @param onFulfilled 成功时的回调
   * @param onRejected 失败时的回调
   * @returns 新的Promise实例
   */
  then<U>(
    onFulfilled?: OnFulfilled<T, U>,
    onRejected?: OnRejected<U>
  ): MyPromise<U> {
    // then方法总是返回一个新的Promise
    return new MyPromise<U>((resolve, reject) => {
      
      if (this.state === PromiseState.FULFILLED) {
        // 如果当前Promise已经fulfilled
        if (onFulfilled) {
          try {
            const result = onFulfilled(this.value!);
            // 如果回调返回的是Promise，需要等待它完成
            if (result instanceof MyPromise) {
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          // 如果没有提供onFulfilled，直接传递值
          // 这里需要类型断言，因为T可能不等于U
          resolve(this.value as any);
        }
      } else if (this.state === PromiseState.REJECTED) {
        // 如果当前Promise已经rejected
        if (onRejected) {
          try {
            const result = onRejected(this.reason);
            // 如果回调返回的是Promise，需要等待它完成
            if (result instanceof MyPromise) {
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          // 如果没有提供onRejected，直接传递错误
          reject(this.reason);
        }
      } else {
        // 如果当前Promise还是pending状态
        // 这个阶段我们暂时不处理异步情况
        // 在第二阶段会完善这部分
        console.warn('当前实现不支持异步操作，请在第二阶段学习异步支持');
      }
    });
  }

  /**
   * catch方法 - 捕获错误的便捷方法
   * @param onRejected 错误处理回调
   * @returns 新的Promise实例
   */
  catch<U>(onRejected: OnRejected<U>): MyPromise<U> {
    return this.then(undefined, onRejected);
  }

  /**
   * 获取当前Promise的状态（用于调试）
   */
  getState(): PromiseState {
    return this.state;
  }

  /**
   * 获取当前Promise的值（用于调试）
   */
  getValue(): T | undefined {
    return this.value;
  }

  /**
   * 获取当前Promise的错误原因（用于调试）
   */
  getReason(): any {
    return this.reason;
  }
}

// 导出类型定义
export { Executor, OnFulfilled, OnRejected, PromiseState };

