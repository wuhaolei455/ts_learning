import { counter, inc } from "./lib.js";

// ES6 模块输出的是值的引用

console.log(counter); // 3
inc();
console.log(counter); // 4
