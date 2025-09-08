let s = Symbol("i am a symbol");
console.log(s);

const obj = {
  toString() {
    return "abc";
  },
};
s = Symbol(obj);
console.log(s);

// Symbol use
// mixin模式: 比如，你使用了一个他人提供的对象，但又想为这个对象添加新的方法

// define enum
const log = {};
log.level = {
  DEBUG: Symbol("debug"),
  INFO: Symbol("info"),
  ERROR: Symbol("error"),
};
console.log(log.level.DEBUG, "i am deubg imformation", log.level.DEBUG);
log.level.DEBUG = "haha";
console.log(log.level.DEBUG, "i am deubg imformation", log.level.DEBUG);

// used as object key
let s2 = Symbol();
const obj2 = {
  // obj2[s2] = "hello", 同样的写法
  [s2]: "hello",
};
console.log(log.level.INFO, obj2.s2, obj2[s2]);
obj2.s2 = "haha";
console.log(log.level.INFO, obj2.s2, obj2[s2], obj2["s2"]);

// define consts, 确保switch语句的成功运行, 类似seal class?
const COLOR_RED = Symbol();
const COLOR_GREEN = Symbol();

function getComplement(color) {
  switch (color) {
    case COLOR_RED:
      return COLOR_GREEN;
    case COLOR_GREEN:
      return COLOR_RED;
    default:
      throw new Error("Undefined color");
  }
}

// example
function getArea(shape, options) {
  let area = 0;

  switch (shape) {
    case "Triangle": // 魔术字符串
      area = 0.5 * options.width * options.height;
      break;
    /* ... more code ... */
  }

  return area;
}

console.log(getArea("Triangle", { width: 100, height: 100 })); // 魔术字符串

// const Triangle = Symbol("Triangle");
const shapeType = {
  triangle: Symbol("Triangle"),
};
function getAreaBetter(shape, options) {
  let area = 0;

  switch (shape) {
    case shapeType.triangle:
      area = 0.5 * options.width * options.height;
      break;
  }

  return area;
}
console.log(getAreaBetter(shapeType.triangle, { width: 100, height: 100 }));
