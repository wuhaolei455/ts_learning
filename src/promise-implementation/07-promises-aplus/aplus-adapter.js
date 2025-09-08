/**
 * Promise/A+测试适配器
 * 用于promises-aplus-tests测试套件
 */

// 编译TypeScript为JavaScript（在实际使用中，你需要先编译）
// 这里假设已经编译好了implementation.js文件
const MyPromise = require('./implementation.js').default || require('./implementation.js').MyPromise;

module.exports = {
  // 创建一个已解决的promise
  resolved: function(value) {
    return MyPromise.resolve(value);
  },
  
  // 创建一个已拒绝的promise
  rejected: function(reason) {
    return MyPromise.reject(reason);
  },
  
  // 创建一个pending状态的promise，并返回控制函数
  deferred: function() {
    let resolve, reject;
    
    const promise = new MyPromise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return {
      promise: promise,
      resolve: resolve,
      reject: reject
    };
  }
};
