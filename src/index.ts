import { testDecorator } from "./decorator/index.js";
import { methodLogger } from "./decorator/src/decorator.js";
import { testString } from "./string/index.js";


// console.log('Hello, world!');
methodLogger(testDecorator)();
methodLogger(testString)();