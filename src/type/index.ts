

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
fff(); 

// TypeError: fff is not a function
// var fff = function () { 
//   console.log('fff', '1');
// }

function fff() {
  console.log('fff', '2');
}

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

function testArguments() {
  // arguments并不是一个真正的数组，无法使用forEach
  // console.log('arguments', arguments.forEach((arg, index) => {
  //   console.log(`arguments[${index}]`, arg);
  // }));
  console.log('forEach in arguments', 'forEach' in arguments);
  console.log('toString in arguments', 'toString' in arguments);
  console.log('arguments[0]', arguments[0]);
  console.log('arguments[1]', arguments[1]);
  for (let i = 0; i < arguments.length; i++) {
    console.log(`arguments[${i}]`, arguments[i]);
  }
  let args = Array.prototype.slice.call(arguments);
  args.forEach((arg, index) => {
    console.log(`args[${index}]`, arg);
  })
}

testArguments(1, 2)

// testClosure
// 1. 读取外层函数变量
// 2. 保存上下文环境，如下累加器
// 关于第二点的解释, 闭包对象建立在堆上引用着外层函数的变量count，导致createIncrementer无法从内存释放，一方面保存了上下文，另一方面也存在内存泄漏的风险
// 3. 封装对象的私有属性和私有方法
function createIncrementer() {
  let count = 0; // 闭包变量
  return function increment() {
    count += 1;
    return count;
  };
}

let incrementer = createIncrementer();
console.log(incrementer(), incrementer(), incrementer()); // 1 2 3

function Person(name) {
  var _age;
  function setAge(n) {
    _age = n;
  }
  function getAge() {
    return _age;
  }

  return {
    name: name,
    getAge: getAge,
    setAge: setAge
  };
}
let person = Person('Alice');
person.setAge(30);
console.log(person.name, person.getAge()); // Alice 30

// IIFE (Immediately Invoked Function Expression) 立即执行函数表达式，匿名函数
let testIIFE = function() { return 1 }() // function既能作为表达式，也能作为函数定义语句
console.log('testIIFE', testIIFE); // 1, 立即执行函数表达式
// function() { return 1 }() error, 行首的function被当作函数定义语句解析
console.log('testIIFE', (function() { return 1 })(), +function() { return 1 }()); // 1, 使用括号包裹函数表达式，立即执行函数表达式, 原理在于不让function出现在行首即可

// array
console.log(typeof [1, 2, 3]) // object
for (let key in [1, 2, 3]) {
  console.log('key', key); // key 0, key 1, key 2 // 数组的特殊性体现在，它的键名是按次序排列的一组整数（0，1，2...）。
}
console.log([1, , 3].length, [1,,3].values[1]) // 3 undefined, 代表对象中key为'1'的值是undefined

// string转数组
const strArray = Array.prototype.slice.call('hello');
strArray.forEach((element, index) => {
  console.log('element', index, element);
});