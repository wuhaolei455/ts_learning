function Animal(name: string) {
  this.name = name;

  this.say = function() {
    console.log(`${this.name} says hello!`);
  }
}

Animal.prototype.speak = function() {
  console.log(`${this.name} makes a noise.`);
};
Animal.prototype.color = "brown";

function Dog(name: string) {
  Animal.call(this, name); // 调用Animal构造函数，this指向Dog实例
}

// 创建Dog的原型对象，继承Animal的原型
Dog.prototype = Object.create(Animal.prototype);
// 修正Dog.prototype的constructor指向
Dog.prototype.constructor = Dog;

const newDog = new Dog('Buddy');
const dog3 = new Animal('Doggy');

console.log('newDog', newDog instanceof Dog, newDog instanceof Animal, newDog.speak()); // true, true
console.log('dog3', dog3 instanceof Animal, dog3.speak()); // true

function Cat(name: string) {
  Animal.call(this, name); // 调用Animal构造函数，this指向Dog实例
}
Cat.prototype = new Animal('Cat');

const kitty = new Cat('Kitty');
console.log('kitty', kitty instanceof Cat, kitty instanceof Animal, kitty.speak()); // true, true
console.log('kitty.say', kitty.say()); // Kitty says hello!, 这里cat实例不止拥有父类的原型方法属性(speak)，还拥有其实例方法(say)

// 重写父类某一原型的方法
Cat.prototype.speak = function() {
  Animal.prototype.speak.call(this);
  console.log(`${this.name} meows.`);
}
kitty.speak(); // Kitty makes a noise. Kitty meows.

// 多继承
function M1() {
  this.hello = "hello"
}

function M2() {
  this.world = "world"
}

function M() {
  M1.call(this);
  M2.call(this);
}

M.prototype = Object.create(M2.prototype) // 继承M2
Object.assign(M.prototype, M1.prototype) // 但是把M1的所有原型方法和属性也添加到M的原型上
M.prototype.constructor = M;

const m = new M();
console.log('m', m instanceof M, m instanceof M1, m instanceof M2, m.hello, m.world); // true, false, true, hello, world
