/**
 * 第二阶段演示：异步Promise使用示例
 */

import { MyPromise, runMicrotask } from './implementation';

console.log('🚀 第二阶段：异步Promise演示\n');

// 示例1：基础异步resolve
console.log('📝 示例1：异步resolve');
const promise1 = new MyPromise<number>((resolve) => {
  console.log('  执行器立即执行');
  setTimeout(() => {
    console.log('  1秒后resolve');
    resolve(42);
  }, 1000);
});

console.log(`  初始状态: ${promise1.getState()}`);

promise1.then(value => {
  console.log(`  收到值: ${value}`);
  console.log(`  最终状态: ${promise1.getState()}\n`);
});

// 示例2：多个then回调等待同一个Promise
setTimeout(() => {
  console.log('📝 示例2：多个then回调');
  const promise2 = new MyPromise<string>((resolve) => {
    setTimeout(() => {
      resolve('共享的值');
    }, 500);
  });

  promise2.then(value => {
    console.log(`  第一个then: ${value}`);
  });

  promise2.then(value => {
    console.log(`  第二个then: ${value}`);
  });

  promise2.then(value => {
    console.log(`  第三个then: ${value}`);
  });

  console.log(`  等待中的回调数量: ${JSON.stringify(promise2.getPendingCallbacksCount())}\n`);
}, 1500);

// 示例3：异步链式调用
setTimeout(() => {
  console.log('📝 示例3：异步链式调用');
  const promise3 = new MyPromise<number>((resolve) => {
    setTimeout(() => resolve(10), 300);
  });

  promise3
    .then(value => {
      console.log(`  第一步: ${value}`);
      return new MyPromise<number>((resolve) => {
        setTimeout(() => resolve(value * 2), 200);
      });
    })
    .then(value => {
      console.log(`  第二步: ${value}`);
      return value + 5;
    })
    .then(value => {
      console.log(`  第三步: ${value}\n`);
    });
}, 2500);

// 示例4：异步错误处理
setTimeout(() => {
  console.log('📝 示例4：异步错误处理');
  const promise4 = new MyPromise<number>((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('异步错误'));
    }, 300);
  });

  promise4.catch(error => {
    console.log(`  捕获错误: ${error.message}`);
    return '错误已处理';
  }).then(value => {
    console.log(`  恢复后的值: ${value}\n`);
  });
}, 3500);

// 示例5：微任务执行顺序
setTimeout(() => {
  console.log('📝 示例5：微任务执行顺序');
  
  console.log('  1. 同步代码开始');
  
  const promise5 = new MyPromise<string>((resolve) => {
    resolve('立即resolve');
  });
  
  promise5.then(value => {
    console.log(`  4. Promise then: ${value}`);
  });
  
  runMicrotask(() => {
    console.log('  3. 手动微任务');
  });
  
  setTimeout(() => {
    console.log('  5. 宏任务 setTimeout');
  }, 0);
  
  console.log('  2. 同步代码结束\n');
}, 4500);

// 示例6：finally方法
setTimeout(() => {
  console.log('📝 示例6：finally方法');
  
  const promise6 = new MyPromise<number>((resolve) => {
    setTimeout(() => resolve(100), 200);
  });
  
  promise6
    .then(value => {
      console.log(`  成功: ${value}`);
      return value * 2;
    })
    .finally(() => {
      console.log('  finally: 无论成功失败都执行');
    })
    .then(value => {
      console.log(`  最终值: ${value}\n`);
    });
}, 5500);

// 示例7：复杂的异步场景
setTimeout(() => {
  console.log('📝 示例7：复杂异步场景');
  
  function asyncOperation(value: number, delay: number): MyPromise<number> {
    return new MyPromise<number>((resolve) => {
      setTimeout(() => {
        console.log(`    异步操作完成: ${value} (延迟${delay}ms)`);
        resolve(value);
      }, delay);
    });
  }
  
  asyncOperation(1, 100)
    .then(value => {
      return asyncOperation(value + 1, 150);
    })
    .then(value => {
      return asyncOperation(value + 1, 80);
    })
    .then(value => {
      console.log(`  最终结果: ${value}\n`);
    });
}, 6000);

// 示例8：错误在异步链中的传播
setTimeout(() => {
  console.log('📝 示例8：异步错误传播');
  
  new MyPromise<number>((resolve) => {
    setTimeout(() => resolve(50), 100);
  })
  .then(value => {
    console.log(`  第一步成功: ${value}`);
    return new MyPromise<number>((_resolve, reject) => {
      setTimeout(() => reject(new Error('第二步失败')), 100);
    });
  })
  .then(value => {
    console.log(`  第二步成功: ${value}`); // 不会执行
  })
  .catch(error => {
    console.log(`  捕获错误: ${error.message}`);
    return 999;
  })
  .then(value => {
    console.log(`  错误恢复后: ${value}\n`);
  });
}, 7000);

// 等待所有示例完成
setTimeout(() => {
  console.log('✅ 第二阶段演示完成！');
  console.log('💡 现在Promise支持真正的异步操作和回调队列管理。');
}, 9000);
