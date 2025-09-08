// 第一阶段：基础EventEmitter的测试用例
import { Assert, createMock, TestRunner } from "./test-framework";

// TODO: 你需要在这里实现 BasicEventEmitter 类
class BasicEventEmitter {
  // TODO: 添加私有属性来存储事件监听器
  // 提示：可以使用 { [key: string]: Function[] } 类型
  private events: { [key: string]: Function[] };

  constructor() {
    // TODO: 初始化事件存储
    this.events = {};
  }

  // TODO: 实现 on 方法
  // 参数：eventName: string, callback: Function
  // 功能：添加事件监听器
  on(eventName: string, callback: Function): void {
    // TODO: 实现这个方法
    // 1. 如果事件不存在，创建一个空数组
    // 2. 将回调函数添加到对应事件的数组中
    // const callbacks = this.events[eventName];
    // if (callbacks) {
    //   callbacks.push(callback);
    // } else {
    //   this.events[eventName] = [callback];
    // }
    // 如果事件不存在，创建一个空数组
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    // 将回调函数添加到对应事件的数组中
    this.events[eventName].push(callback);
  }

  // TODO: 实现 emit 方法
  // 参数：eventName: string, ...args: any[]
  // 功能：触发事件，执行所有监听器
  emit(eventName: string, ...args: any[]): void {
    // TODO: 实现这个方法
    // 1. 检查事件是否存在
    // 2. 遍历所有监听器并调用它们
    const callbacks = this.events[eventName];
    // if (callbacks) {
    //   for (const callback of callbacks) {
    //     callback(...args);
    //   }
    // }
    callbacks?.forEach((callback) => callback(...args));
  }

  // TODO: 实现 listenerCount 方法
  // 参数：eventName: string
  // 功能：返回指定事件的监听器数量
  listenerCount(eventName: string): number {
    const callbacks = this.events[eventName];
    return callbacks ? callbacks.length : 0;
  }
}

// 测试用例
export function runBasicEventEmitterTests() {
  const runner = new TestRunner();

  runner.test("应该能够创建EventEmitter实例", () => {
    const emitter = new BasicEventEmitter();
    Assert.true(
      emitter instanceof BasicEventEmitter,
      "emitter应该是BasicEventEmitter的实例"
    );
  });

  runner.test("应该能够添加事件监听器", () => {
    const emitter = new BasicEventEmitter();
    const mockCallback = createMock<() => void>();

    // 添加监听器不应该抛出错误
    emitter.on("test", mockCallback.getMock());

    // 监听器数量应该为1
    Assert.equal(emitter.listenerCount("test"), 1, "监听器数量应该为1");
  });

  runner.test("应该能够触发事件", () => {
    const emitter = new BasicEventEmitter();
    const mockCallback = createMock<(data: string) => void>();

    emitter.on("test", mockCallback.getMock());
    emitter.emit("test", "hello");

    Assert.true(mockCallback.toHaveBeenCalled(), "回调函数应该被调用");
    Assert.true(
      mockCallback.toHaveBeenCalledWith("hello"),
      "回调函数应该用正确参数被调用"
    );
  });

  runner.test("应该能够为同一事件添加多个监听器", () => {
    const emitter = new BasicEventEmitter();
    const mock1 = createMock<() => void>();
    const mock2 = createMock<() => void>();

    emitter.on("test", mock1.getMock());
    emitter.on("test", mock2.getMock());

    Assert.equal(emitter.listenerCount("test"), 2, "应该有2个监听器");

    emitter.emit("test");

    Assert.true(mock1.toHaveBeenCalled(), "第一个监听器应该被调用");
    Assert.true(mock2.toHaveBeenCalled(), "第二个监听器应该被调用");
  });

  runner.test("应该能够处理不存在的事件", () => {
    const emitter = new BasicEventEmitter();

    // 触发不存在的事件不应该抛出错误
    emitter.emit("nonexistent");

    Assert.equal(
      emitter.listenerCount("nonexistent"),
      0,
      "不存在的事件监听器数量应该为0"
    );
  });

  runner.test("应该能够传递多个参数给监听器", () => {
    const emitter = new BasicEventEmitter();
    const mockCallback =
      createMock<(a: number, b: string, c: boolean) => void>();

    emitter.on("multiArgs", mockCallback.getMock());
    emitter.emit("multiArgs", 42, "hello", true);

    Assert.true(
      mockCallback.toHaveBeenCalledWith(42, "hello", true),
      "应该用多个参数调用监听器"
    );
  });

  runner.test("监听器执行顺序应该与添加顺序一致", () => {
    const emitter = new BasicEventEmitter();
    const results: number[] = [];

    emitter.on("order", () => results.push(1));
    emitter.on("order", () => results.push(2));
    emitter.on("order", () => results.push(3));

    emitter.emit("order");

    Assert.deepEqual(results, [1, 2, 3], "监听器应该按添加顺序执行");
  });

  return runner;
}

// 如果直接运行此文件
if (require.main === module) {
  console.log("🎯 第一阶段：基础EventEmitter测试");
  console.log("📝 请实现 BasicEventEmitter 类中的 TODO 部分，然后运行测试");
  console.log("💡 提示：先让测试通过，再考虑优化\n");

  runBasicEventEmitterTests().run();
}
