function Animal(name: string) {
  this.name = name;
}

// js规定，每一个函数都有一个prototype属性，指向一个对象
Animal.prototype.speak = function() {
  console.log(`${this.name} makes a noise.`);
};
Animal.prototype.color = "brown";
console.log(typeof Animal.prototype);

// 这个对象是Animal的原型，其所有属性和方法被所有实例共享; 所有实例的__proto__都指向Animal.prototype
const dog = new Animal('Dog');
const cat = new Animal('Cat');
console.log(dog.speak === cat.speak, dog.speak());

// 原型链，js规定每个对象都有自己的原型对象，so原型对象也有自己的原型对象, 形成一个原型链
// 大概是：普通对象原型<Animal.prototype> -> Object.prototype -> null, valueOf()方法和toString()方法都在Object.prototype上, 尽头是null
console.log(Object.getPrototypeOf(Object.prototype) === null); // true


// 原型对象prototype的constructor属性
console.log('Animal.prototype.constructor === Animal', Animal.prototype.constructor === Animal); // true
// 另一方面，有了constructor属性，就可以从一个实例对象新建另一个实例
const dog2 = new dog.constructor('Dog2');
console.log('dog2.speak === dog.speak', dog2.speak === dog.speak); // true

console.log('dog.constructor === Animal', dog.constructor.prototype === Animal.prototype); // true
console.log('Animal.prototype.isPrototypeOf(dog)', Animal.prototype.isPrototypeOf(dog)); // true
console.log('dog is in the proto chain of Animal', dog instanceof Animal); // true
console.log('null instanceof Object', null instanceof Object); // false
console.log('typeof null === object', typeof null === 'object'); // true, 所有对象除了null都在Object的原型链上, 都是Object的实例

console.log('Object.prototype.isPrototypeOf(Array.prototype)', Object.prototype.isPrototypeOf(Array.prototype));
console.log('Object.prototype.isPrototypeOf(Array.prototype)', Array.prototype instanceof Object);

var arr = [1, 2, 3];
var y = {};
console.log('arr', arr instanceof Array, arr instanceof Object); // true, true
console.log('y', y instanceof Array, y instanceof Object); // false, true


// RangeError: Maximum call stack size exceeded
// function Animal2(name: string) {
//   if (this instanceof Animal) {
//     // this, 实例对象;
//     console.log('this use new', this instanceof Animal, this.constructor === Animal);
//   } else {
//     // this, 构造函数对象本身
//     console.log('this', this instanceof Object, this);
//     return new Animal2(name);
//   }
// }

// const dog3 = Animal2('Dog3');
// dog3.speak = function() {
//   console.log(`${this.name} barks.`);
// }
// dog3.color = 'black';
// console.log('dog3.speak === dog.speak', dog3.speak === dog.speak)

// 对象拷贝
function A(name: string) {
  this.name = name;
}
var aa = new A("aa");
aa.color = "red";
var b = Object.create(aa);

// Object.create()方法创建一个新对象，使用指定的原型对象和可选的属性来初始化
// if (typeof Object.create !== 'function') {
//   Object.create = function (obj) {
//     function F() {}
//     F.prototype = obj;
//     return new F();
//   };
// }

console.log('Object.create', b.constructor === A, b instanceof A, b.name, b.prototype === aa.prototype, aa == b, aa === b); // true, true