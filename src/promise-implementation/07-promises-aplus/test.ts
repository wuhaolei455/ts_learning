/**
 * Promise/A+规范兼容性测试
 */

import { MyPromise } from './implementation';

// 测试框架
class AplusTestFramework {
  private tests: Array<{ name: string; fn: () => Promise<void> }> = [];
  private passed = 0;
  private failed = 0;

  test(name: string, fn: () => Promise<void>) {
    this.tests.push({ name, fn });
  }

  assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`    ✅ ${message}`);
      this.passed++;
    } else {
      console.log(`    ❌ ${message}`);
      this.failed++;
      throw new Error(`断言失败: ${message}`);
    }
  }

  assertEqual<T>(actual: T, expected: T, message: string) {
    this.assert(actual === expected, `${message} (期望: ${expected}, 实际: ${actual})`);
  }

  async run() {
    console.log('🧪 Promise/A+规范兼容性测试\n');

    for (const { name, fn } of this.tests) {
      console.log(`📋 ${name}`);
      try {
        await fn();
        console.log(`  ✅ 通过\n`);
      } catch (error) {
        console.log(`  ❌ 失败: ${error instanceof Error ? error.message : error}\n`);
      }
    }

    console.log(`📊 测试结果: ${this.passed} 通过, ${this.failed} 失败`);
    
    if (this.failed === 0) {
      console.log('🎉 所有测试通过！符合Promise/A+规范');
    } else {
      console.log('💥 有测试失败！需要修复');
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const test = new AplusTestFramework();

// 测试1：基本状态转换
test.test('基本状态转换', async () => {
  const promise = new MyPromise((resolve, reject) => {
    resolve(42);
  });

  test.assertEqual(promise.getState(), 'fulfilled', '状态应该是fulfilled');
  test.assertEqual(promise.getValue(), 42, '值应该是42');
});

// 测试2：状态不可逆性
test.test('状态不可逆性', async () => {
  let resolveRef: Function, rejectRef: Function;
  
  const promise = new MyPromise((resolve, reject) => {
    resolveRef = resolve;
    rejectRef = reject;
  });

  resolveRef(42);
  test.assertEqual(promise.getState(), 'fulfilled', '应该是fulfilled状态');
  
  // 尝试再次改变状态（应该被忽略）
  resolveRef(100);
  rejectRef(new Error('test'));
  
  test.assertEqual(promise.getState(), 'fulfilled', '状态不应该改变');
  test.assertEqual(promise.getValue(), 42, '值不应该改变');
});

// 测试3：then方法返回新Promise
test.test('then方法返回新Promise', async () => {
  const promise1 = new MyPromise(resolve => resolve(1));
  const promise2 = promise1.then();
  
  test.assert(promise2 instanceof MyPromise, 'then应该返回新的Promise');
  test.assert(promise1 !== promise2, 'then应该返回不同的Promise实例');
});

// 测试4：值透传
test.test('值透传', async () => {
  const promise = new MyPromise(resolve => resolve(42));
  
  let result: any;
  await new Promise<void>(resolve => {
    promise
      .then() // 没有onFulfilled，应该透传值
      .then() // 再次透传
      .then(value => {
        result = value;
        resolve();
      });
  });
  
  test.assertEqual(result, 42, '值应该正确透传');
});

// 测试5：错误透传
test.test('错误透传', async () => {
  const error = new Error('test error');
  const promise = new MyPromise((resolve, reject) => reject(error));
  
  let caughtError: any;
  await new Promise<void>(resolve => {
    promise
      .then() // 没有onRejected，应该透传错误
      .then() // 继续透传
      .catch(err => {
        caughtError = err;
        resolve();
      });
  });
  
  test.assertEqual(caughtError, error, '错误应该正确透传');
});

// 测试6：异步执行
test.test('异步执行', async () => {
  const executionOrder: string[] = [];
  
  const promise = new MyPromise(resolve => {
    executionOrder.push('executor');
    resolve(1);
  });
  
  promise.then(() => {
    executionOrder.push('then');
  });
  
  executionOrder.push('sync');
  
  await test.delay(10);
  
  test.assertEqual(executionOrder[0], 'executor', 'executor应该先执行');
  test.assertEqual(executionOrder[1], 'sync', '同步代码应该在then之前执行');
  test.assertEqual(executionOrder[2], 'then', 'then应该异步执行');
});

// 测试7：循环引用检测
test.test('循环引用检测', async () => {
  const promise1 = new MyPromise(resolve => resolve(1));
  
  let caughtError: any;
  const promise2 = promise1.then(() => promise2); // 返回自身
  
  await new Promise<void>(resolve => {
    promise2.catch(error => {
      caughtError = error;
      resolve();
    });
  });
  
  test.assert(caughtError instanceof TypeError, '应该抛出TypeError');
  test.assert(caughtError.message.includes('Chaining cycle'), '错误消息应该包含循环引用信息');
});

// 测试8：thenable对象处理
test.test('thenable对象处理', async () => {
  const thenable = {
    then(onFulfilled: Function) {
      setTimeout(() => onFulfilled('thenable value'), 10);
    }
  };
  
  const promise = new MyPromise(resolve => resolve(1));
  
  let result: any;
  await new Promise<void>(resolve => {
    promise
      .then(() => thenable)
      .then(value => {
        result = value;
        resolve();
      });
  });
  
  test.assertEqual(result, 'thenable value', '应该正确处理thenable对象');
});

// 测试9：thenable中的错误
test.test('thenable错误处理', async () => {
  const thenable = {
    then() {
      throw new Error('thenable error');
    }
  };
  
  const promise = new MyPromise(resolve => resolve(1));
  
  let caughtError: any;
  await new Promise<void>(resolve => {
    promise
      .then(() => thenable)
      .catch(error => {
        caughtError = error;
        resolve();
      });
  });
  
  test.assert(caughtError instanceof Error, '应该捕获错误');
  test.assertEqual(caughtError.message, 'thenable error', '错误消息应该正确');
});

// 测试10：Promise解析
test.test('Promise解析', async () => {
  const innerPromise = new MyPromise(resolve => {
    setTimeout(() => resolve('inner value'), 20);
  });
  
  const outerPromise = new MyPromise(resolve => resolve(1));
  
  let result: any;
  await new Promise<void>(resolve => {
    outerPromise
      .then(() => innerPromise)
      .then(value => {
        result = value;
        resolve();
      });
  });
  
  test.assertEqual(result, 'inner value', '应该正确解析内部Promise');
});

// 测试11：多次调用then
test.test('多次调用then', async () => {
  const promise = new MyPromise(resolve => {
    setTimeout(() => resolve(42), 20);
  });
  
  const results: number[] = [];
  
  const promises = [
    new Promise<void>(resolve => {
      promise.then(value => {
        results.push(value * 1);
        resolve();
      });
    }),
    new Promise<void>(resolve => {
      promise.then(value => {
        results.push(value * 2);
        resolve();
      });
    }),
    new Promise<void>(resolve => {
      promise.then(value => {
        results.push(value * 3);
        resolve();
      });
    })
  ];
  
  await Promise.all(promises);
  
  test.assertEqual(results.length, 3, '应该执行所有then回调');
  test.assert(results.includes(42), '应该包含第一个结果');
  test.assert(results.includes(84), '应该包含第二个结果');
  test.assert(results.includes(126), '应该包含第三个结果');
});

// 测试12：executor中的异常
test.test('executor异常处理', async () => {
  const promise = new MyPromise(() => {
    throw new Error('executor error');
  });
  
  let caughtError: any;
  await new Promise<void>(resolve => {
    promise.catch(error => {
      caughtError = error;
      resolve();
    });
  });
  
  test.assert(caughtError instanceof Error, '应该捕获executor中的错误');
  test.assertEqual(caughtError.message, 'executor error', '错误消息应该正确');
});

// 测试13：复杂的thenable链
test.test('复杂thenable链', async () => {
  const createThenable = (value: any) => ({
    then(onFulfilled: Function) {
      setTimeout(() => onFulfilled(value), 10);
    }
  });
  
  const promise = new MyPromise(resolve => resolve(1));
  
  let result: any;
  await new Promise<void>(resolve => {
    promise
      .then(value => createThenable(value + 1))
      .then(value => createThenable(value + 1))
      .then(value => createThenable(value + 1))
      .then(value => {
        result = value;
        resolve();
      });
  });
  
  test.assertEqual(result, 4, '复杂thenable链应该正确执行');
});

// 运行测试
if (require.main === module) {
  test.run().catch(console.error);
}
