/**
 * 第一阶段测试：基础Promise功能测试
 */

import { MyPromise, PromiseState } from './implementation';

// 简单的测试框架
class TestFramework {
  private tests: Array<{ name: string; fn: () => void | Promise<void> }> = [];
  private passed = 0;
  private failed = 0;

  test(name: string, fn: () => void | Promise<void>) {
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
    console.log('🧪 第一阶段测试开始\n');

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
}

const test = new TestFramework();

// 测试1：Promise构造和基本状态
test.test('Promise构造和基本状态', () => {
  const promise = new MyPromise<number>((resolve) => {
    resolve(42);
  });

  test.assertEqual(promise.getState(), PromiseState.FULFILLED, '状态应该是fulfilled');
  test.assertEqual(promise.getValue(), 42, '值应该是42');
});

// 测试2：Promise reject
test.test('Promise reject', () => {
  const error = new Error('测试错误');
  const promise = new MyPromise<number>((_resolve, reject) => {
    reject(error);
  });

  test.assertEqual(promise.getState(), PromiseState.REJECTED, '状态应该是rejected');
  test.assertEqual(promise.getReason(), error, '错误原因应该正确');
});

// 测试3：执行器中的错误处理
test.test('执行器中的错误处理', () => {
  const promise = new MyPromise<number>(() => {
    throw new Error('执行器错误');
  });

  test.assertEqual(promise.getState(), PromiseState.REJECTED, '状态应该是rejected');
  test.assert(promise.getReason() instanceof Error, '应该捕获错误');
  test.assertEqual(promise.getReason().message, '执行器错误', '错误消息应该正确');
});

// 测试4：状态不可逆性
test.test('状态不可逆性', () => {
  let resolveRef: (value: number) => void;
  let rejectRef: (reason: any) => void;

  const promise = new MyPromise<number>((resolve, reject) => {
    resolveRef = resolve;
    rejectRef = reject;
  });

  // 先resolve
  resolveRef!(42);
  test.assertEqual(promise.getState(), PromiseState.FULFILLED, '应该是fulfilled状态');
  test.assertEqual(promise.getValue(), 42, '值应该是42');

  // 尝试再次resolve（应该被忽略）
  resolveRef!(100);
  test.assertEqual(promise.getValue(), 42, '值不应该改变');

  // 尝试reject（应该被忽略）
  rejectRef!(new Error('不应该生效'));
  test.assertEqual(promise.getState(), PromiseState.FULFILLED, '状态不应该改变');
});

// 测试5：then方法基础功能
test.test('then方法基础功能', () => {
  const promise = new MyPromise<number>((resolve) => {
    resolve(10);
  });

  let receivedValue: number | undefined;
  promise.then(value => {
    receivedValue = value;
    return value * 2;
  });

  test.assertEqual(receivedValue, 10, '应该接收到正确的值');
});

// 测试6：then方法链式调用
test.test('then方法链式调用', () => {
  const promise = new MyPromise<number>((resolve) => {
    resolve(5);
  });

  let step1Result: number | undefined;
  let step2Result: number | undefined;

  promise
    .then(value => {
      step1Result = value;
      return value * 2;
    })
    .then(value => {
      step2Result = value;
      return value + 1;
    });

  test.assertEqual(step1Result, 5, '第一步应该接收到5');
  test.assertEqual(step2Result, 10, '第二步应该接收到10');
});

// 测试7：catch方法
test.test('catch方法', () => {
  const error = new Error('测试错误');
  const promise = new MyPromise<number>((_resolve, reject) => {
    reject(error);
  });

  let caughtError: Error | undefined;
  promise.catch(err => {
    caughtError = err;
    return 'recovered';
  });

  test.assertEqual(caughtError, error, '应该捕获到错误');
});

// 测试8：then中的错误处理
test.test('then中的错误处理', () => {
  const promise = new MyPromise<number>((resolve) => {
    resolve(42);
  });

  let caughtError: Error | undefined;
  promise
    .then(() => {
      throw new Error('then中的错误');
    })
    .catch(err => {
      caughtError = err;
    });

  test.assert(caughtError instanceof Error, '应该捕获到错误');
  test.assertEqual(caughtError!.message, 'then中的错误', '错误消息应该正确');
});

// 测试9：then返回Promise
test.test('then返回Promise', () => {
  const promise1 = new MyPromise<number>((resolve) => {
    resolve(10);
  });

  let finalResult: string | undefined;
  promise1
    .then(value => {
      return new MyPromise<string>((resolve) => {
        resolve(`result: ${value}`);
      });
    })
    .then(result => {
      finalResult = result;
    });

  test.assertEqual(finalResult, 'result: 10', '应该正确处理Promise返回值');
});

// 测试10：类型推断
test.test('TypeScript类型推断', () => {
  interface TestData {
    id: number;
    name: string;
  }

  const promise = new MyPromise<TestData>((resolve) => {
    resolve({ id: 1, name: 'test' });
  });

  let extractedName: string | undefined;
  promise.then(data => {
    // TypeScript应该正确推断data的类型为TestData
    extractedName = data.name;
    return data.id;
  }).then(id => {
    // TypeScript应该推断id的类型为number
    test.assertEqual(typeof id, 'number', 'id应该是number类型');
  });

  test.assertEqual(extractedName, 'test', '应该正确提取name');
});

// 运行测试
if (require.main === module) {
  test.run();
}
