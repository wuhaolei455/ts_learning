# EventEmitter 示例代码

这个目录包含了 EventEmitter 的循序渐进学习示例。

## 运行示例

```bash
# 运行单个示例
npx ts-node examples/01-basic-event-emitter.ts

# 运行所有示例
npx ts-node examples/04-run-all-examples.ts
```

## 示例说明

### 01-basic-event-emitter.ts

- 最基础的 EventEmitter 实现
- 学习核心的 on/emit 概念
- 使用简单的对象和数组存储

### 02-improved-event-emitter.ts

- 添加订阅管理功能
- 使用 Map 和 Set 优化性能
- 增加错误处理和统计功能

### 03-typed-event-emitter.ts

- 类型安全的 EventEmitter
- 使用泛型约束事件类型
- 支持链式调用和一次性监听

### 04-run-all-examples.ts

- 运行所有示例的入口文件

## 学习建议

1. 按顺序学习每个示例
2. 理解每个版本的改进点
3. 尝试修改代码来加深理解
4. 参考主目录的学习指南文档
