console.log(typeof window === "undefined"); // true, 因为当前环境非浏览器环境, 没有window对象

function isBrowser() {
  return typeof window !== "undefined";
}

if (isBrowser()) {
  window.a = 111;
  a = 555;
  console.log(a); // 顶层对象的属性赋值 == 全局变量的赋值
} else {
  console.log("Not in a browser environment, window is undefined.");
}

console.log(globalThis);
// 方法一
typeof window !== "undefined"
  ? window
  : typeof process === "object" &&
    typeof require === "function" &&
    typeof global === "object"
  ? global
  : this;
// 方法二
var getGlobal = function () {
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("unable to locate global object");
};
