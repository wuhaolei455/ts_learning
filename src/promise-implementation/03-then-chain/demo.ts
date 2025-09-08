/**
 * 第三阶段演示：完善的Then链式调用示例
 */

import { MyPromise, Thenable } from './implementation';

console.log('🚀 第三阶段：完善Then链式调用演示\n');

// 示例1：基础链式调用和值透传
console.log('📝 示例1：值透传机制');
const promise1 = new MyPromise<number>((resolve) => {
  resolve(42);
});

promise1
  .then() // 没有提供回调，值应该透传
  .then() // 再次透传
  .then(value => {
    console.log(`  透传后的值: ${value}`); // 应该是42
  });

// 错误透传
const promise1Error = new MyPromise<number>((resolve, reject) => {
  reject(new Error('原始错误'));
});

promise1Error
  .then() // 没有错误处理，错误应该透传
  .then() // 继续透传
  .catch(error => {
    console.log(`  透传后的错误: ${error.message}\n`);
  });

// 示例2：循环引用检测
setTimeout(() => {
  console.log('📝 示例2：循环引用检测');
  
  const promise2 = new MyPromise<any>((resolve) => {
    resolve(42);
  });

  const chainedPromise = promise2.then(() => {
    // 返回自身，应该抛出TypeError
    return chainedPromise;
  });

  chainedPromise.catch(error => {
    console.log(`  捕获循环引用错误: ${error.message}\n`);
  });
}, 100);

// 示例3：Thenable对象处理
setTimeout(() => {
  console.log('📝 示例3：Thenable对象处理');
  
  const promise3 = new MyPromise<number>((resolve) => {
    resolve(10);
  });

  promise3.then(value => {
    // 返回一个thenable对象
    return {
      then(onFulfilled: (value: string) => void, onRejected?: (reason: any) => void) {
        console.log('  Thenable对象的then方法被调用');
        setTimeout(() => {
          onFulfilled(`Thenable结果: ${value * 2}`);
        }, 100);
      }
    };
  }).then(result => {
    console.log(`  最终结果: ${result}\n`);
  });
}, 200);

// 示例4：复杂的thenable链
setTimeout(() => {
  console.log('📝 示例4：复杂的Thenable链');
  
  // 创建一个自定义的thenable类
  class CustomThenable implements Thenable<string> {
    constructor(private value: string) {}
    
    then(onFulfilled?: (value: string) => any, onRejected?: (reason: any) => any) {
      console.log(`  CustomThenable.then被调用，值: ${this.value}`);
      setTimeout(() => {
        if (onFulfilled) {
          onFulfilled(this.value);
        }
      }, 50);
    }
  }

  const promise4 = new MyPromise<number>((resolve) => {
    resolve(5);
  });

  promise4
    .then(value => new CustomThenable(`第一步: ${value}`))
    .then(result => new CustomThenable(`第二步: ${result}`))
    .then(final => {
      console.log(`  最终结果: ${final}\n`);
    });
}, 500);

// 示例5：Thenable中的错误处理
setTimeout(() => {
  console.log('📝 示例5：Thenable错误处理');
  
  const promise5 = new MyPromise<number>((resolve) => {
    resolve(100);
  });

  promise5.then(value => {
    return {
      then(onFulfilled: Function, onRejected: Function) {
        // thenable中抛出错误
        throw new Error('Thenable中的错误');
      }
    };
  }).catch(error => {
    console.log(`  捕获Thenable错误: ${error.message}\n`);
  });
}, 800);

// 示例6：嵌套Promise的处理
setTimeout(() => {
  console.log('📝 示例6：嵌套Promise处理');
  
  const promise6 = new MyPromise<number>((resolve) => {
    resolve(1);
  });

  promise6
    .then(value => {
      console.log(`  第一层: ${value}`);
      return new MyPromise<number>((resolve) => {
        setTimeout(() => resolve(value + 1), 100);
      });
    })
    .then(value => {
      console.log(`  第二层: ${value}`);
      return new MyPromise<string>((resolve) => {
        setTimeout(() => resolve(`结果: ${value + 1}`), 100);
      });
    })
    .then(result => {
      console.log(`  最终结果: ${result}\n`);
    });
}, 1000);

// 示例7：混合Promise和Thenable
setTimeout(() => {
  console.log('📝 示例7：混合Promise和Thenable');
  
  const promise7 = new MyPromise<string>((resolve) => {
    resolve('开始');
  });

  promise7
    .then(value => {
      // 返回原生Promise（如果支持）
      return new Promise(resolve => {
        setTimeout(() => resolve(`Promise步骤: ${value}`), 50);
      });
    })
    .then(value => {
      // 返回自定义thenable
      return {
        then(onFulfilled: Function) {
          setTimeout(() => onFulfilled(`Thenable步骤: ${value}`), 50);
        }
      };
    })
    .then(value => {
      // 返回MyPromise
      return new MyPromise<string>((resolve) => {
        setTimeout(() => resolve(`MyPromise步骤: ${value}`), 50);
      });
    })
    .then(result => {
      console.log(`  混合链结果: ${result}\n`);
    });
}, 1500);

// 示例8：复杂的错误恢复场景
setTimeout(() => {
  console.log('📝 示例8：复杂错误恢复');
  
  const promise8 = new MyPromise<number>((resolve) => {
    resolve(10);
  });

  promise8
    .then(value => {
      throw new Error('第一步错误');
    })
    .catch(error => {
      console.log(`  捕获: ${error.message}`);
      // 返回thenable来恢复
      return {
        then(onFulfilled: Function) {
          onFulfilled('已恢复');
        }
      };
    })
    .then(value => {
      console.log(`  恢复后: ${value}`);
      return new MyPromise<string>((resolve, reject) => {
        reject(new Error('第二次错误'));
      });
    })
    .catch(error => {
      console.log(`  再次捕获: ${error.message}`);
      return '最终恢复';
    })
    .then(result => {
      console.log(`  最终结果: ${result}\n`);
    });
}, 2000);

// 示例9：性能测试 - 长链式调用
setTimeout(() => {
  console.log('📝 示例9：长链式调用性能测试');
  
  let promise: MyPromise<number> = new MyPromise<number>((resolve) => {
    resolve(0);
  });

  const startTime = Date.now();
  
  // 创建100个链式调用
  for (let i = 0; i < 100; i++) {
    promise = promise.then(value => value + 1);
  }

  promise.then(result => {
    const endTime = Date.now();
    console.log(`  100层链式调用结果: ${result}`);
    console.log(`  耗时: ${endTime - startTime}ms\n`);
  });
}, 2500);

// 等待所有示例完成
setTimeout(() => {
  console.log('✅ 第三阶段演示完成！');
  console.log('💡 现在Promise完全支持Promise/A+规范的Resolution Procedure。');
  console.log('🔧 支持的特性：');
  console.log('   - 完整的值透传机制');
  console.log('   - 循环引用检测');
  console.log('   - Thenable对象处理');
  console.log('   - 复杂的链式调用');
}, 4000);
