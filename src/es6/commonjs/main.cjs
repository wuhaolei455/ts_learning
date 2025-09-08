const commonjs = require("./lib.cjs");

commonjs.inc();
console.log("commonjs", commonjs.count); // 0, 因为commonjs输出的是值的拷贝, 而不是引用
