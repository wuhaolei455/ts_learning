// 手动柯里化
// 函数组合更加自由
// x10 和 +3 +5组合起来了
const addd = (x) => (y) => x + y;
const multiply = (x) => (y) => x * y;

const add5 = addd(5);
const multiply10 = multiply(10);

const result = multiply10(add5(3)); // (3 + 5) * 10 = 80
