// 柯里化来自数学和函数式编程，其核心思想是将多参数函数转化为‘链式调用的单参数函数，使函数更灵活可复用’
// 给定一个函数，给出其柯里化包装, 自动柯里化
// 在函数申明体内可以获得运行时的参数长度arguments.length。
// 要在函数申明体外获得该函数的参数长度，可以通过Function.prototype.length，也就是fn.length
// function curry(fn: Function): Function {
//   const resFunc = function curried(...args) {
//     if (args.length === 0) {
//       return fn(args);
//     }
//     return curried.apply(this, ...args.splice(args.length - 1, 1));
//   };
//   return resFunc;
// }
function curry(fn: Function): Function {
  return function curriedFn(...args: any[]) {
    if (args.length >= fn.length) {
      // 满足原函数的要求
      return fn.apply(this, args);
    } else {
      return function (...newArgs) {
        // 不满足原函数的要求
        return curriedFn.apply(this, args.concat(newArgs));
      };
    }
  };
}

// origin
function add(x, y, z) {
  return x + y + z;
}
// 容易理解的版本
function curriedAdd() {
  return function (x) {
    return function (y) {
      return function (z) {
        return x + y + z;
      };
    };
  };
}

// 简化版本 (利用箭头函数的特性)
const curriedAdd2 = (x) => (y) => (z) => x + y + z;

// 自动柯里化函数更实用的适用场景包括：

// 1. 表单输入统一处理（React等框架）
// 通过柯里化函数动态生成特定字段的修改处理函数，避免为每个输入框写重复代码。

// js
// const createHandler = setFormData => fieldName => e => {
//   setFormData(prev => ({ ...prev, [fieldName]: e.target.value }));
// };
// // 使用时传入不同字段名，生成不同处理器
// 优点是代码简洁，易扩展，复用性强.

// 2. 权限校验
// 根据角色动态生成权限检查函数，方便管理不同权限用户。

// js
// const checkPermission = requiredRole => user => user.roles.includes(requiredRole);
// const isAdmin = checkPermission("admin");
// const isEditor = checkPermission("editor");

// isAdmin(currentUser); // true
// 新增角色只需调用柯里化函数生成新的检查器，方便维护.

// 3. 日志打印功能
// 柯里化日志函数，预设时间、日志级别，只传入日志内容调用，写日志更简便.

// 4. 配置固定参数的通用函数
// 如HTTP请求封装，预设请求方法、基础URL，返回新的请求函数便于调用.

// 5. 延迟执行和参数复用
// 复杂业务中分阶段传参，直到参数齐全才执行，提高代码灵活度.
