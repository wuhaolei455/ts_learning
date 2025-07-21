import { es6 } from "./index.js";

console.log("es6", es6.f()); // undefined, 因为var提升了tmp的声明, 但是没有赋值s