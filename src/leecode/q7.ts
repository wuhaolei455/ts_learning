type Fn = (...params: number[]) => number;

function memoize(fn: Fn): Fn {
  const mp = new Map<string, number>();
  return function (...args: number[]) {
    const key = args.toString();
    if (!mp.has(key)) {
      const res = fn(...args);
      mp.set(key, res);
      return res;
    }
    return mp.get(key);
  };
}

let callCount = 0;
const memoizedFn = memoize(function (a, b) {
  callCount += 1;
  return a + b;
});
memoizedFn(2, 3); // 5
memoizedFn(2, 3); // 5
console.log(callCount);
