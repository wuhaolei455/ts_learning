import { es6 } from "./index.js";
import { observable, observe } from "./proxy.js";

console.log("es6", es6.f()); // undefined, 因为var提升了tmp的声明, 但是没有赋值s

const person = observable({
  name: "张三",
  age: 20,
});

function print() {
  console.log(`${person.name}, ${person.age}`);
}

observe(print);
person.name = "李四";
