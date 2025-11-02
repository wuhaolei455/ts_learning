# 有限状态机（FSM）实现文档

## 目录
1. [概述](#概述)
2. [核心概念](#核心概念)
3. [逐步实现](#逐步实现)
4. [知识点详解](#知识点详解)
5. [使用示例](#使用示例)

---

## 概述

这是一个基于 TypeScript 实现的有限状态机（Finite State Machine, FSM），具有以下特性：

- ✅ 支持同步和异步状态转换
- ✅ 事件驱动的状态监听机制
- ✅ 类型安全的 API 设计
- ✅ 动态生成状态操作方法
- ✅ 支持状态转换时的元数据传递

---

## 核心概念

### 状态机的基本要素

1. **状态（State）**：系统在某个时刻所处的状态
2. **动作（Action）**：触发状态转换的操作
3. **转换（Transition）**：从一个状态到另一个状态的过程
4. **初始状态（Initial State）**：状态机启动时的状态

### 架构设计

```
┌─────────────────┐
│   index.ts      │  使用层：定义状态机配置和调用
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   machine.ts    │  核心层：状态机逻辑实现
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   emitter.ts    │  基础层：事件发射器
└─────────────────┘
```

---

## 逐步实现

### 第一步：实现事件发射器（emitter.ts）

事件发射器是整个状态机的基础，用于实现观察者模式。

#### 1.1 定义类型系统

```typescript
// 事件处理器类型
export type EventHandler<T> = (data: T) => unknown;

// 事件映射类型约束
export interface EventEmitter<T extends Record<string, unknown>> {
  emit<K extends keyof T>(type: K, data: T[K]): Promise<unknown[]>;
  on<K extends keyof T>(type: K, handler: EventHandler<T[K]>): void;
  off<K extends keyof T>(type: K, handler: EventHandler<T[K]>): void;
  once<K extends keyof T>(type: K, handler: EventHandler<T[K]>): void;
  // ...
}
```

**关键点：**
- `Record<string, unknown>` 确保类型安全
- 使用泛型约束保证事件类型和数据类型的对应关系

#### 1.2 实现监听器存储

```typescript
interface EventListener<T, K extends keyof T> {
  handler: EventHandler<T[K]>;
  type: K;
}

const listeners: EventListener<T, any>[] = [];
```

#### 1.3 实现核心方法

**on - 订阅事件**
```typescript
function on<K extends keyof T>(type: K, handler: EventHandler<T[K]>): void {
  const listener = <EventListener<T, K>>{ handler, type };
  listeners.push(listener);
}
```

**emit - 发射事件**
```typescript
function emit<K extends keyof T>(type: K, data: T[K]): Promise<unknown[]> {
  const promises: Promise<unknown>[] = [];
  
  for (listener of listeners) {
    if (listener.type !== type && listener.type !== "all") {
      continue;
    }
    
    const result = listener.handler(data);
    if ((<Promise<unknown>>result)?.then) {
      promises.push(<Promise<unknown>>result);
    }
  }
  
  return Promise.all(promises);
}
```

**关键点：**
- 支持异步处理器（返回 Promise）
- 使用 `Promise.all` 等待所有异步处理器完成

**off - 取消订阅**
```typescript
function off<K extends keyof T>(type: K, handler: EventHandler<T[K]>): void {
  const ndx = listeners.findIndex(
    (l: EventListener<T, K>) => type === l.type && handler === l.handler
  );
  
  if (ndx !== -1) {
    listeners.splice(ndx, 1);
  }
}
```

**once - 一次性订阅**
```typescript
function once<K extends keyof T>(type: K, handler: EventHandler<T[K]>): void {
  const listener: EventListener<T, K> = {
    handler: (...args) => {
      off(type, handler);
      handler(...args);
    },
    type,
  };
  listeners.push(listener);
}
```

**实现思路：**
1. 包装原始处理器，在执行后自动取消订阅
2. 确保处理器只执行一次

---

### 第二步：实现状态机核心（machine.ts）

#### 2.1 定义配置类型

```typescript
type Config = {
  [key: string]: Record<string, (...params: any[]) => Promise<string> | string>;
};
```

**解释：**
- 外层 key：状态名（如 "off", "on"）
- 内层 key：动作名（如 "switchOn", "switchOff"）
- 值：转换函数，返回目标状态名

#### 2.2 定义事件类型

```typescript
export type Events<T> = {
  onEnter: {
    action: Actions<T>;
    current: keyof T;
    last: keyof T;
    meta?: unknown;
  };
  onExit: {
    action: Actions<T>;
    current: keyof T;
    meta?: unknown;
  };
};

type StateEvents<T> = {
  [K in keyof T]: {
    action: Actions<T>;
    current: K;
    last: Exclude<keyof T, K>;
    meta?: unknown;
  };
};
```

**解释：**
- `Events`：全局事件（所有状态转换都会触发）
- `StateEvents`：状态特定事件（使用映射类型为每个状态生成事件类型）

#### 2.3 实现 machine 函数框架

```typescript
export function machine<T extends Config>(config: T, options: Options<T>) {
  const { emitter = createEventEmitter<Events<T>>(), initialState } = options;
  const secEmitter = createEventEmitter<StateEvents<T>>();
  
  let current = initialState;
  
  // 构建动态方法和处理器
  const actions = buildActions(config, transition);
  const handlers = buildHandlers(config, secEmitter);
  
  return {
    ...actions,      // 动态生成的动作方法
    getState,        // 获取当前状态
    ...handlers,      // 动态生成的状态监听器
    onEnter,         // 全局进入事件
    onExit,          // 全局退出事件
    transition,      // 手动转换方法
  };
}
```

#### 2.4 实现状态转换核心逻辑

```typescript
async function transition(
  action: Actions<T>,
  ...meta: unknown[]
): Promise<(keyof T & string) | undefined> {
  // 1. 触发退出事件
  await emitter.emit(EventTypes.OnExit, { action, current, meta });
  
  // 2. 保存当前状态
  const last = current;
  
  // 3. 检查动作是否在当前状态下可用
  if (!config[current][action]) {
    return;  // 无效转换，返回 undefined
  }
  
  // 4. 执行转换函数（可能是异步）
  current = await config[current][action](meta);
  
  // 5. 触发进入事件
  await emitter.emit(EventTypes.OnEnter, { 
    action, 
    current, 
    last, 
    meta 
  });
  
  // 6. 触发状态特定事件
  await secEmitter.emit(current, {
    action,
    current,
    last,
    meta,
  });
  
  return current;
}
```

**转换流程：**
```
当前状态 --[动作]--> 检查有效性 --> 执行转换函数 --> 更新状态 --> 触发事件
```

#### 2.5 动态生成动作方法（buildActions）

```typescript
function buildActions<T extends Config>(
  config: T, 
  transition: Transition<T>
) {
  // 1. 收集所有可能的动作
  const actionSet = Object.values(config).reduce(
    (acc, stateConfig) => {
      Object.keys(stateConfig).forEach((key) => acc.add(key));
      return acc;
    },
    new Set<string>()
  );
  
  // 2. 为每个动作创建方法
  return Array.from(actionSet).reduce(
    (acc, action) => {
      acc[action] = function doTransition(...meta: unknown[]) {
        return transition(action, ...meta);
      };
      return acc;
    },
    {} as Record<string, (...meta: unknown[]) => Promise<string | undefined>>
  );
}
```

**作用：**
- 自动为配置中的所有动作生成便捷方法
- 例如：配置中有 `switchOn`，会自动生成 `lightMachine.switchOn()` 方法

#### 2.6 动态生成状态监听器（buildHandlers）

```typescript
function buildHandlers<T extends Config>(
  config: T,
  emitter: EventEmitter<StateEvents<T>>
) {
  const keys = Object.keys(config) as (keyof T)[];
  
  return keys.reduce((acc, cur: any) => {
    // 转换状态名：off -> onOff, on -> onOn
    const first = cur.slice(0, 1);      // 第一个字符
    const rest = cur.slice(1);          // 剩余字符
    
    const handlerName = `on${first.toUpperCase()}${rest}`;
    
    acc[handlerName] = (handler: EventHandler<StateEvents<T>[keyof T]>) => {
      emitter.on(cur, handler);
      return () => emitter.off(cur, handler);
    };
    
    return acc;
  }, {} as Record<`on${Capitalize<keyof T & string>}`, ...>);
}
```

**作用：**
- 为每个状态生成专门的监听器方法
- 例如：状态 `off` → 生成 `onOff()` 方法
- 例如：状态 `on` → 生成 `onOn()` 方法

---

## 知识点详解

### 1. TypeScript 高级类型

#### 1.1 映射类型（Mapped Types）

```typescript
type StateEvents<T> = {
  [K in keyof T]: {
    current: K;
    last: Exclude<keyof T, K>;
  };
};
```

**作用：** 为类型 `T` 的每个键生成对应的类型

**示例：**
```typescript
// 如果 T = { off: ..., on: ... }
// 则 StateEvents<T> = {
//   off: { current: 'off', last: 'on' },
//   on: { current: 'on', last: 'off' }
// }
```

#### 1.2 条件类型（Conditional Types）

```typescript
type Actions<T> = Exclude<NestedKeys<T>, keyof T>;
```

**作用：** 提取嵌套的键，排除顶层键

#### 1.3 模板字面量类型（Template Literal Types）

```typescript
type HandlerName<T> = `on${Capitalize<keyof T & string>}`;
```

**作用：** 生成类似 `onOff`、`onOn` 这样的类型

#### 1.4 泛型约束

```typescript
function machine<T extends Config>(config: T, options: Options<T>)
```

**作用：** 约束泛型类型必须符合 `Config` 结构

### 2. 设计模式

#### 2.1 观察者模式（Observer Pattern）

**实现：** 事件发射器

**优势：**
- 解耦：状态机和监听器之间松耦合
- 可扩展：可以添加多个监听器
- 灵活性：支持动态添加/移除监听器

#### 2.2 状态模式（State Pattern）

**实现：** 状态机的核心逻辑

**优势：**
- 状态转换逻辑集中在配置中
- 避免大量的 if-else 判断
- 状态转换规则清晰可见

### 3. 函数式编程概念

#### 3.1 高阶函数（Higher-Order Functions）

```typescript
function buildActions(config, transition) {
  return actions.reduce((acc, action) => {
    acc[action] = function doTransition(...meta) {
      return transition(action, ...meta);
    };
    return acc;
  }, {});
}
```

#### 3.2 闭包（Closures）

```typescript
export function machine(config, options) {
  let current = initialState;  // 私有状态，通过闭包访问
  
  return {
    getState: () => current,   // 闭包捕获 current
    transition: async (action) => {
      current = await config[current][action]();
    }
  };
}
```

**作用：** 封装内部状态，防止外部直接修改

### 4. 异步编程

#### 4.1 Promise 和 async/await

```typescript
async function transition(action, ...meta) {
  await emitter.emit(EventTypes.OnExit, {...});
  current = await config[current][action](meta);
  await emitter.emit(EventTypes.OnEnter, {...});
}
```

**优势：**
- 支持异步转换函数
- 保证事件触发顺序
- 错误处理更清晰

#### 4.2 Promise.all 用于并发处理

```typescript
function emit(type, data) {
  const promises = [];
  for (listener of listeners) {
    const result = listener.handler(data);
    if (result instanceof Promise) {
      promises.push(result);
    }
  }
  return Promise.all(promises);
}
```

### 5. 数据结构

#### 5.1 Set 去重

```typescript
const actionSet = Object.values(config).reduce((acc, stateConfig) => {
  Object.keys(stateConfig).forEach((key) => acc.add(key));
  return acc;
}, new Set<string>());
```

**作用：** 自动去重，收集所有唯一的动作名

#### 5.2 数组操作

- `reduce`：累积构建对象
- `findIndex`：查找并移除监听器
- `splice`：删除数组元素

### 6. 字符串操作

```typescript
const first = cur.slice(0, 1);           // 获取首字符
const rest = cur.slice(1);                // 获取剩余字符
const capitalized = first.toUpperCase();  // 首字母大写
const handlerName = `on${capitalized}${rest}`;
```

**示例：**
- `off` → `onOff`
- `loading` → `onLoading`

---

## 使用示例

### 基础用法

```typescript
// 1. 定义状态机配置
const lightSwitch = {
  off: {
    switchOn: () => "on",
  },
  on: {
    switchOff: () => "off",
  },
};

// 2. 创建状态机
const machine = machine(lightSwitch, {
  initialState: "off",
});

// 3. 获取当前状态
console.log(machine.getState()); // "off"

// 4. 状态转换
await machine.switchOn();  // 使用动态生成的方法
// 或
await machine.transition("switchOn");  // 使用通用方法
```

### 监听状态变化

```typescript
// 全局进入事件
machine.onEnter((event) => {
  console.log(`进入状态: ${event.current}`);
});

// 全局退出事件
machine.onExit((event) => {
  console.log(`退出状态: ${event.current}`);
});

// 特定状态的监听器
machine.onOff((event) => {
  console.log("进入 off 状态");
});

machine.onOn((event) => {
  console.log("进入 on 状态");
});
```

### 异步转换

```typescript
const asyncSwitch = {
  off: {
    switchOn: async () => {
      await fetch('/api/turn-on');
      return "on";
    },
  },
  on: {
    switchOff: async () => {
      await fetch('/api/turn-off');
      return "off";
    },
  },
};
```

### 传递元数据

```typescript
await machine.transition("switchOn", { reason: "定时任务" });

// 在转换函数中访问
const switchOn = (meta: unknown[]) => {
  console.log(meta); // [{ reason: "定时任务" }]
  return "on";
};
```

---

## 学习路径建议

### 初学者
1. 理解状态机的基本概念
2. 学习 TypeScript 基础类型
3. 理解 Promise 和 async/await
4. 学习闭包和高阶函数

### 进阶
1. 深入理解 TypeScript 高级类型
2. 学习设计模式（观察者模式、状态模式）
3. 理解函数式编程思想
4. 学习如何设计类型安全的 API

### 高级
1. 研究类型系统的高级特性
2. 优化性能和内存使用
3. 扩展功能（状态历史、条件转换等）
4. 实现状态机的可视化工具

---

## 扩展思考

### 可能的改进方向

1. **条件转换**
   ```typescript
   switchOn: (meta) => {
     if (meta.someCondition) return "on";
     return "off"; // 保持当前状态
   }
   ```

2. **状态历史记录**
   ```typescript
   machine.getHistory(); // 返回状态转换历史
   ```

3. **状态验证**
   ```typescript
   switchOn: {
     target: "on",
     guard: (meta) => meta.isValid,
     action: () => "on"
   }
   ```

4. **可视化调试工具**
   - 实时显示当前状态
   - 显示状态转换图
   - 记录转换历史

---

## 总结

这个状态机实现展示了：

1. **类型安全**：通过 TypeScript 的高级类型确保类型安全
2. **灵活性**：动态生成方法，API 使用便捷
3. **可扩展性**：基于事件系统，易于扩展
4. **异步支持**：完整的异步/await 支持

通过学习和理解这个实现，可以掌握：
- TypeScript 高级类型系统
- 设计模式的实际应用
- 函数式编程思想
- 状态机设计原则

