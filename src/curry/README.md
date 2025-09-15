## 柯里化函数

柯里化（Currying）是一种技术，它将一个多参数函数转换为一系列单参数函数的过程。换句话说，柯里化函数接收一个参数，然后返回一个接收下一个参数的函数，依此类推，直到所有参数都被接收，最终返回计算结果。

## 解析

通过不断收集参数，每次收集参数返回一个新的函数，来达到链式调用单个函数的目的

```typescript
function curry(fn: Function): Function {
  return function curriedFn(...args: any[]) {
    if (args.length >= fn.length) {
      // 参数收集完成，调用函数
      return fn.apply(this, args);
    } else {
      return function (...newArgs) {
        // 继续收集参数
        return curriedFn.apply(this, args.concat(newArgs));
      };
    }
  };
}
```

## 作用

参数复用：

柯里化允许我们创建一个部分应用函数，其中一些参数是预先确定的，从而使得函数更灵活和可复用。

简化函数组合：

柯里化使得函数的组合变得更加容易，尤其是在函数式编程中。我们可以轻松地将多个简单函数组合成一个复杂函数。

延迟计算：

柯里化允许我们推迟函数的执行，直到所有参数都已被提供。这对于一些需要延迟计算的场景非常有用。

## 分别

1. 手动柯里化
2. 自动柯里化
