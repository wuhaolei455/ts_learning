/**
 * 第二阶段测试：异步Promise功能测试
 */

import { MyPromise, PromiseState } from './implementation';

// 增强的测试框架，支持异步测试
class AsyncTestFramework {
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
    console.log('🧪 第二阶段测试开始\n');

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
      console.log('🎉 所有测试通过！');
    } else {
      console.log('💥 有测试失败！');
    }
  }

  // 辅助方法：等待指定时间
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const test = new AsyncTestFramework();

// 测试1：异步resolve
test.test('异步resolve', async () => {
  let resolvedValue: number | undefined;
  
  const promise = new MyPromise<number>((resolve) => {
    setTimeout(() => resolve(42), 50);
  });

  test.assertEqual(promise.getState(), PromiseState.PENDING, '初始状态应该是pending');

  await new Promise<void>((resolve) => {
    promise.then(value => {
      resolvedValue = value;
      resolve();
    });
  });

  test.assertEqual(resolvedValue, 42, '应该接收到正确的异步值');
  test.assertEqual(promise.getState(), PromiseState.FULFILLED, '最终状态应该是fulfilled');
});

// 测试2：异步reject
test.test('异步reject', async () => {
  let rejectedReason: Error | undefined;
  
  const promise = new MyPromise<number>((resolve, reject) => {
    setTimeout(() => reject(new Error('异步错误')), 50);
  });

  await new Promise<void>((resolve) => {
    promise.catch(error => {
      rejectedReason = error;
      resolve();
    });
  });

  test.assert(rejectedReason instanceof Error, '应该捕获到错误');
  test.assertEqual(rejectedReason!.message, '异步错误', '错误消息应该正确');
});

// 测试3：多个then回调等待同一个Promise
test.test('多个then回调等待', async () => {
  const results: number[] = [];
  
  const promise = new MyPromise<number>((resolve) => {
    setTimeout(() => resolve(100), 50);
  });

  // 注册多个then回调
  const promises = [
    promise.then(value => { results.push(value * 1); }),
    promise.then(value => { results.push(value * 2); }),
    promise.then(value => { results.push(value * 3); })
  ];

  await Promise.all(promises);

  test.assertEqual(results.length, 3, '应该执行所有then回调');
  test.assertEqual(results[0], 100, '第一个回调结果正确');
  test.assertEqual(results[1], 200, '第二个回调结果正确');
  test.assertEqual(results[2], 300, '第三个回调结果正确');
});

// 测试4：异步链式调用
test.test('异步链式调用', async () => {
  let finalResult: number | undefined;

  const promise = new MyPromise<number>((resolve) => {
    setTimeout(() => resolve(5), 30);
  });

  await promise
    .then(value => {
      return new MyPromise<number>((resolve) => {
        setTimeout(() => resolve(value * 2), 30);
      });
    })
    .then(value => {
      return new MyPromise<number>((resolve) => {
        setTimeout(() => resolve(value + 10), 30);
      });
    })
    .then(value => {
      finalResult = value;
    });

  test.assertEqual(finalResult, 20, '异步链式调用结果应该正确 (5 * 2 + 10)');
});

// 测试5：pending状态下的回调队列
test.test('pending状态回调队列', async () => {
  let resolvePromise: (value: string) => void;
  
  const promise = new MyPromise<string>((resolve) => {
    resolvePromise = resolve;
  });

  // 检查初始状态
  test.assertEqual(promise.getState(), PromiseState.PENDING, '应该是pending状态');
  
  // 添加多个then回调
  const results: string[] = [];
  promise.then(value => results.push(`first: ${value}`));
  promise.then(value => results.push(`second: ${value}`));

  // 检查回调队列
  const callbackCount = promise.getPendingCallbacksCount();
  test.assertEqual(callbackCount.fulfilled, 2, '应该有2个等待的fulfilled回调');

  // 触发resolve
  resolvePromise!('test value');

  // 等待微任务执行
  await test.delay(10);

  test.assertEqual(results.length, 2, '应该执行所有等待的回调');
  test.assertEqual(results[0], 'first: test value', '第一个回调结果正确');
  test.assertEqual(results[1], 'second: test value', '第二个回调结果正确');
});

// 测试6：错误在异步链中的传播
test.test('异步错误传播', async () => {
  let caughtError: Error | undefined;
  let recoveredValue: string | undefined;

  await new MyPromise<number>((resolve) => {
    setTimeout(() => resolve(10), 30);
  })
  .then(value => {
    return new MyPromise<number>((resolve, reject) => {
      setTimeout(() => reject(new Error('中间错误')), 30);
    });
  })
  .then(value => {
    test.assert(false, '这个then不应该被执行');
  })
  .catch(error => {
    caughtError = error;
    return 'recovered';
  })
  .then(value => {
    recoveredValue = value;
  });

  test.assert(caughtError instanceof Error, '应该捕获到错误');
  test.assertEqual(caughtError!.message, '中间错误', '错误消息正确');
  test.assertEqual(recoveredValue, 'recovered', '应该从错误中恢复');
});

// 测试7：finally方法
test.test('finally方法', async () => {
  let finallyExecuted = false;
  let thenResult: number | undefined;

  await new MyPromise<number>((resolve) => {
    setTimeout(() => resolve(42), 30);
  })
  .finally(() => {
    finallyExecuted = true;
  })
  .then(value => {
    thenResult = value;
  });

  test.assert(finallyExecuted, 'finally应该被执行');
  test.assertEqual(thenResult, 42, 'finally不应该改变传递的值');

  // 测试rejected情况下的finally
  let finallyExecuted2 = false;
  let caughtError2: Error | undefined;

  await new MyPromise<number>((resolve, reject) => {
    setTimeout(() => reject(new Error('测试错误')), 30);
  })
  .finally(() => {
    finallyExecuted2 = true;
  })
  .catch(error => {
    caughtError2 = error;
  });

  test.assert(finallyExecuted2, 'rejected情况下finally也应该被执行');
  test.assert(caughtError2 instanceof Error, '错误应该被正确传播');
});

// 测试8：微任务执行顺序
test.test('微任务执行顺序', async () => {
  const executionOrder: string[] = [];

  // 立即resolved的Promise
  const promise = new MyPromise<string>((resolve) => {
    resolve('immediate');
  });

  promise.then(value => {
    executionOrder.push('promise-then');
  });

  // 手动添加微任务
  if (typeof queueMicrotask !== 'undefined') {
    queueMicrotask(() => {
      executionOrder.push('manual-microtask');
    });
  }

  executionOrder.push('sync-code');

  // 等待微任务执行
  await test.delay(10);

  test.assertEqual(executionOrder[0], 'sync-code', '同步代码应该先执行');
  test.assert(executionOrder.includes('promise-then'), 'Promise then应该在微任务中执行');
});

// 测试9：复杂的嵌套异步操作
test.test('复杂嵌套异步操作', async () => {
  let finalResult: string | undefined;

  const asyncStep = (step: number, value: string): MyPromise<string> => {
    return new MyPromise<string>((resolve) => {
      setTimeout(() => {
        resolve(`${value}-step${step}`);
      }, 20);
    });
  };

  await asyncStep(1, 'start')
    .then(result => asyncStep(2, result))
    .then(result => asyncStep(3, result))
    .then(result => {
      finalResult = result;
    });

  test.assertEqual(finalResult, 'start-step1-step2-step3', '复杂嵌套操作结果正确');
});

// 测试10：内存管理 - 回调清理
test.test('回调队列清理', async () => {
  let resolvePromise: (value: number) => void;
  
  const promise = new MyPromise<number>((resolve) => {
    resolvePromise = resolve;
  });

  // 添加回调
  promise.then(() => {});
  promise.then(() => {});

  let callbackCount = promise.getPendingCallbacksCount();
  test.assertEqual(callbackCount.fulfilled, 2, '应该有2个等待回调');

  // resolve后，回调队列应该被清理
  resolvePromise!(42);
  await test.delay(10);

  callbackCount = promise.getPendingCallbacksCount();
  test.assertEqual(callbackCount.fulfilled, 0, '回调队列应该被清理');
});

// 运行测试
if (require.main === module) {
  test.run().catch(console.error);
}
