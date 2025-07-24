/**
 * 1. 对象状态不受外界影响
 * 2. resovle状态, 结果定型之后随时可以取到; 事件则是错过就再也监听不到
 */
export class tPromise {
  // 三种状态
  static PENDING = "pending"; // 等待
  static FULFILLED = "fulfilled"; // pending -> fulfilled
  static REJECTED = "rejected"; // pending -> rejected

  constructor(func) {
    // func 回调函数实现异步操作
    this.status = tPromise.PENDING;
    this.result = null;
    // then、catch注册的resove、reject回调
    this.rejectedCallbacks = [];
    this.fulfilledCallbacks = [];
    try {
      func(this.resolve.bind(this), this.reject.bind(this));
      console.log(
        this.resolve instanceof Function,
        this.resolve instanceof Object
      );
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(result) {
    // pending -> fulfilled
    // if (this.status === tPromise.PENDING) {
    //   this.status = tPromise.FULFILLED;
    //   this.result = result;
    //   this.fulfilledCallbacks.forEach((callback) => callback(result));
    // }
    this.status = tPromise.FULFILLED;
    this.result = result;
    this.fulfilledCallbacks.forEach((callback) => callback(this.result));
  }

  reject(reason) {
    // pending -> rejected
    // if (this.status === tPromise.PENDING) {
    //     this.status = tPromise.REJECTED;
    //     this.result = reason;
    //     this.rejectedCallbacks.forEach(callback => callback(reason));
    // }
    this.status = tPromise.REJECTED;
    this.result = reason;
    this.rejectedCallbacks.forEach((callback) => callback(this.result));
  }

  then(onFulfilled, onRejected) {
    this.fulfilledCallbacks.push(onFulfilled);
    this.rejectedCallbacks.push(onRejected);
    return this;
  }

  catch(onRejected) {
    this.rejectedCallbacks.push(onRejected);
    return this;
  }
}
