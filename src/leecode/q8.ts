// https://leetcode.cn/problems/memoize-ii/description/
// type Fn = (...param) => any;

// function memoize(fn: Fn): Fn {
//   const mp = new Map<string, any>();
//   return function (...args) {
//     const key = args.toString();
//     if (!mp.has(key)) {
//       const res = fn(...args);
//       mp.set(key, res);
//       return res;
//     }
//     return mp.get(key);
//   };
// }

// let callCount = 0;
// const memoizedFn = memoize(function (a, b) {
//   callCount++;
//   return { ...a, ...b };
// });
// memoizedFn({}, {}); // 5
// memoizedFn({}, {});
// memoizedFn({}, {});

// console.log(callCount);
