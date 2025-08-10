// 简单的测试框架
export class TestRunner {
  private tests: Array<{ name: string; fn: () => void | Promise<void> }> = [];
  private passedTests = 0;
  private failedTests = 0;

  test(name: string, fn: () => void | Promise<void>) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(`\n🧪 开始运行 ${this.tests.length} 个测试...\n`);
    
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.name}`);
        this.passedTests++;
      } catch (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   错误: ${error instanceof Error ? error.message : error}`);
        this.failedTests++;
      }
    }

    console.log(`\n📊 测试结果:`);
    console.log(`   ✅ 通过: ${this.passedTests}`);
    console.log(`   ❌ 失败: ${this.failedTests}`);
    console.log(`   📈 成功率: ${((this.passedTests / this.tests.length) * 100).toFixed(1)}%\n`);
  }
}

// 断言函数
export class Assert {
  static equal<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `期望 ${expected}, 但得到 ${actual}`);
    }
  }

  static deepEqual<T>(actual: T, expected: T, message?: string): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `期望 ${JSON.stringify(expected)}, 但得到 ${JSON.stringify(actual)}`);
    }
  }

  static true(value: boolean, message?: string): void {
    if (value !== true) {
      throw new Error(message || `期望 true, 但得到 ${value}`);
    }
  }

  static false(value: boolean, message?: string): void {
    if (value !== false) {
      throw new Error(message || `期望 false, 但得到 ${value}`);
    }
  }

  static throws(fn: () => void, message?: string): void {
    try {
      fn();
      throw new Error(message || '期望抛出错误，但没有抛出');
    } catch (error) {
      // 预期的错误
    }
  }

  static async resolves<T>(promise: Promise<T>, message?: string): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      throw new Error(message || `Promise 应该成功，但被拒绝: ${error}`);
    }
  }

  static arrayContains<T>(array: T[], item: T, message?: string): void {
    if (!array.includes(item)) {
      throw new Error(message || `数组应该包含 ${item}, 但没有找到`);
    }
  }

  static greaterThan(actual: number, expected: number, message?: string): void {
    if (actual <= expected) {
      throw new Error(message || `期望 ${actual} > ${expected}`);
    }
  }

  static lessThan(actual: number, expected: number, message?: string): void {
    if (actual >= expected) {
      throw new Error(message || `期望 ${actual} < ${expected}`);
    }
  }
}

// 模拟函数
export class MockFunction<T extends (...args: any[]) => any> {
  private calls: Array<{ args: Parameters<T>; timestamp: number }> = [];
  private returnValue: ReturnType<T> | undefined;
  private throwError: Error | undefined;

  constructor(private originalFn?: T) {}

  // 创建模拟函数
  getMock(): T {
    return ((...args: Parameters<T>) => {
      this.calls.push({ args, timestamp: Date.now() });
      
      if (this.throwError) {
        throw this.throwError;
      }
      
      if (this.returnValue !== undefined) {
        return this.returnValue;
      }
      
      if (this.originalFn) {
        return this.originalFn(...args);
      }
    }) as T;
  }

  // 设置返回值
  mockReturnValue(value: ReturnType<T>): this {
    this.returnValue = value;
    return this;
  }

  // 设置抛出错误
  mockThrowError(error: Error): this {
    this.throwError = error;
    return this;
  }

  // 检查是否被调用
  toHaveBeenCalled(): boolean {
    return this.calls.length > 0;
  }

  // 检查调用次数
  toHaveBeenCalledTimes(times: number): boolean {
    return this.calls.length === times;
  }

  // 检查是否用特定参数调用
  toHaveBeenCalledWith(...args: Parameters<T>): boolean {
    return this.calls.some(call => 
      JSON.stringify(call.args) === JSON.stringify(args)
    );
  }

  // 获取调用参数
  getCallArgs(callIndex: number): Parameters<T> | undefined {
    return this.calls[callIndex]?.args;
  }

  // 清除调用记录
  clearCalls(): void {
    this.calls = [];
  }

  // 获取所有调用
  getAllCalls(): Array<{ args: Parameters<T>; timestamp: number }> {
    return [...this.calls];
  }
}

// 便捷的创建模拟函数
export function createMock<T extends (...args: any[]) => any>(originalFn?: T): MockFunction<T> {
  return new MockFunction(originalFn);
}
