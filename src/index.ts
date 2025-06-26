

// console.log('Hello, world!');
// methodLogger(testClosure)();
// methodLogger(testDecorator)();
// methodLogger(testPrimise)();
// methodLogger(testString)();
// methodLogger(testObjectConstancy)();

console.log(typeof null)
console.log({} instanceof Array) // Object 广义对象，所有类型的父类型
console.log([] instanceof Array)
console.log(undefined == null) // true, 自动转化为false
console.log(undefined === null) // false, 严格比较
console.log('Number.isFinite(Number.MAX_VALUE + 100)', Number.isFinite(Number.MAX_VALUE + 100))  // true
console.log('Number.isFinite(Number.MAX_VALUE * 2)', Number.isFinite(Number.MAX_VALUE * 2))  // false, 超出最大值
console.log('+0 == -0', +0 == -0)  // false, +0 和 -0 是不同的, 但是内部等价
console.log('1 / +0 == 1 / -0', 1 / +0 == 1 / -0)  // false, +0 和 -0 是不同的, 但是内部等价
console.log('+Infinity == -Infinity', +Infinity == -Infinity)  // Infinity, 正无穷大
console.log('\"', '\n', '\'')
const array = [1, 2, 3]
console.log('array', array.length)
console.log('hello'.length)
console.log('\uFFFF', '\uFFFFFF', '𝌆'.length)  // [] []FF 四字节的字符
var base64String = btoa('hello, world')  // base64 编码
console.log(base64String, atob(base64String))  // base64 解码
const base64NotASCII = btoa(encodeURIComponent('你好，世界'))  // base64 编码非 ASCII 字符
console.log(base64NotASCII, decodeURIComponent(atob(base64NotASCII)))  // base64 解码

// object
var o1 = { a: 1, b: 2 }
var o2 = o1
o2.a = 3
console.log('o1', o1) // { a: 3, b: 2 }, o1 和 o2 指向同一个对象

// 如果行首是一个大括号，是对象还是代码块，统一按照代码块处理
foo: 123
console.log(eval('{foo: 123}')) // 123
console.log(eval('({foo: 123})'))  // {foo: 123}
console.log(delete o1.a) // true, 删除对象属性
console.log(delete o1.toString) // true, 删除对象属性
console.log('toString' in o1) // 继承的属性，依然可以访问
for (let key in o1) {
  console.log(key, o1[key]) // a 3, b 2
}

// function
// 将函数赋值给一个变量
var operator = add;

// function 函数提升
function add(x, y) {
  return x + y;
}

// 将函数作为参数和返回值
function testA(op, ...args) {
  return op;
}
console.log('testA(add)(1, 1)', testA(add)(1, 1))

// fucntion定义，函数提升，导致前者才是后来覆盖的函数
// var f = function () {
//   console.log('1');
// }

// function f() {
//   console.log('2');
// }


var aa = 1
function f() {
  var aa = 2;
  x();
}
// x的scope在f的外部，只会读到 a=1
function x() {
  console.log('aa', aa);
};
f() // 1

var aaa = 1
function ff() {
  // 闭包xx的scope在f的内部，只会读到 aaa = 2
  var aaa = 2; // 变量覆盖
  var xx = function() {
    console.log('aaa', aaa);
  };
  xx();
}
ff() // 2

console.log(0x10 & 0x01)
console.log(0x111 & 0x01)

// function testSameArgs(a, a) {
//   console.log('testSameArgs', a);
// }

// testSameArgs(1, 2) // 2, 后面的参数覆盖前面的参数