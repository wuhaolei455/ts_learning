interface Array<T> {
  last(): T | -1;
}
// interface A {}
// interface A {} todo

Array.prototype.last = function () {
  return this.length > 0 ? this[this.length - 1] : -1;
};

/**
 * const arr = [1, 2, 3];
 * arr.last(); // 3
 */

const arr = [];
console.log(
  arr.last(),
  Array.prototype.hasOwnProperty("push"),
  Array.prototype.hasOwnProperty("last")
);

// 原型对象增加方法
interface Object {
  say(): void;
}

Object.prototype.say = function () {
  console.log("say");
};

const onj = {};
onj.say();
