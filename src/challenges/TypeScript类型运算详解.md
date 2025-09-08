# TypeScript 类型运算详解

基于 type-challenges 的 HelloWorld 例子，深入理解 TypeScript 类型系统的运算机制。

## 📚 基础概念

### 1. 类型 vs 值

```typescript
// 类型层面
type HelloWorld = string;

// 值层面
const hello: HelloWorld = "Hello World";
```

TypeScript 有两个平行的世界：

- **类型世界**：编译时存在，用于类型检查
- **值世界**：运行时存在，实际的 JavaScript 代码

## 🔧 核心类型运算符

### 1. `extends` - 条件类型运算符

```typescript
// 基本语法：T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false
```

**在 HelloWorld 例子中的应用**：

```typescript
export type Success = cases extends readonly true[] ? true : false;
//                     ↑ 检查 cases 是否为只读的 true 数组
```

### 2. 泛型约束 `<T extends U>`

```typescript
// 约束泛型参数必须满足某个条件
export type Expect<T extends true> = T;
//                   ↑ T 必须是 true 类型
```

如果传入不是 `true` 的类型，会编译报错：

```typescript
type Good = Expect<true>; // ✅ 正确
type Bad = Expect<false>; // ❌ 编译错误
```

### 3. 元组类型运算

```typescript
type cases = [
  Expect<NotAny<HelloWorld>>, // 第一个元素
  Expect<Equal<HelloWorld, string>> // 第二个元素
];
```

这创建了一个**元组类型**，包含两个类型元素。

## 🧮 高级类型运算

### 1. `Equal<X, Y>` - 精确类型相等判断

```typescript
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;
```

**运算原理**：

1. 创建两个函数类型：`<T>() => T extends X ? 1 : 2` 和 `<T>() => T extends Y ? 1 : 2`
2. 如果 X 和 Y 完全相等，这两个函数类型也相等
3. 使用 `extends` 检查函数类型是否相等

**为什么不用简单的双向 extends？**

```typescript
// 简单方法的问题
type SimpleEqual<X, Y> = X extends Y ? (Y extends X ? true : false) : false;

// 对于 any 类型会失效
type Test1 = SimpleEqual<any, string>; // true (错误！)
type Test2 = Equal<any, string>; // false (正确！)
```

### 2. `IsAny<T>` - 检测 any 类型

```typescript
export type IsAny<T> = 0 extends 1 & T ? true : false;
```

**运算原理**：

- `any` 类型与任何类型的交集都是 `any`
- `1 & any = any`，所以 `0 extends any` 为 `true`
- 对于其他类型：`1 & string = never`，所以 `0 extends never` 为 `false`

### 3. `NotAny<T>` - 确保不是 any 类型

```typescript
export type NotAny<T> = true extends IsAny<T> ? false : true;
```

## 🔍 类型运算的执行过程

让我们追踪 HelloWorld 例子的类型运算：

### 步骤 1：定义基础类型

```typescript
type HelloWorld = string;
```

### 步骤 2：执行测试用例

```typescript
// 第一个测试用例
Expect<NotAny<HelloWorld>> =
  Expect<NotAny<string>> =
  Expect<true extends IsAny<string> ? false : true> =
  Expect<true extends false ? false : true> = // IsAny<string> = false
  Expect<true> =
    true; // 因为 true extends true
```

```typescript
// 第二个测试用例
Expect<Equal<HelloWorld, string>> =
  Expect<Equal<string, string>> =
  Expect<true> = // Equal<string, string> = true
    true;
```

### 步骤 3：验证整体结果

```typescript
export type Success = cases extends readonly true[] ? true : false
= [true, true] extends readonly true[] ? true : false
= true
```

## 🎯 实际应用场景

### 1. 类型守卫

```typescript
type IsArray<T> = T extends any[] ? true : false;
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;
```

### 2. 条件类型分发

```typescript
type ToArray<T> = T extends any ? T[] : never;

type Test = ToArray<string | number>; // string[] | number[]
```

### 3. 递归类型运算

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

## 🧪 测试验证方法

### 1. 编译时验证

```typescript
const _test1: true = {} as Expect<NotAny<HelloWorld>>; // 编译时检查
const _test2: true = {} as Expect<Equal<HelloWorld, string>>;
```

### 2. 类型断言验证

```typescript
const res: Success = true; // 如果 Success 不是 true，会编译错误
```

### 3. 条件类型验证

```typescript
type VerifyResult = Success extends true ? "✅ PASS" : "❌ FAIL";
```

## 💡 类型运算的特点

### 1. **编译时计算**

- 所有类型运算都在编译时完成
- 不会产生运行时开销

### 2. **惰性求值**

- 只有在需要时才会计算类型
- 支持递归和复杂运算

### 3. **结构化类型系统**

- TypeScript 使用结构化类型系统
- 类型兼容性基于结构而不是名称

## 🔗 进阶学习路径

1. **基础运算符**：`extends`, `keyof`, `typeof`
2. **映射类型**：`{ [K in keyof T]: ... }`
3. **条件类型**：`T extends U ? X : Y`
4. **模板字面量类型**：`` `${string}-${number}` ``
5. **递归类型**：类型的自我引用
6. **工具类型**：`Partial`, `Required`, `Pick`, `Omit` 等

通过 type-challenges 的练习，你可以逐步掌握这些高级的类型运算技巧！

## 🎉 总结

TypeScript 的类型系统本质上是一个**函数式编程语言**，具有：

- 变量（类型参数）
- 函数（泛型）
- 条件语句（条件类型）
- 循环（映射类型）
- 递归（递归类型）

掌握类型运算，就是掌握在编译时进行**类型级别的编程**！
