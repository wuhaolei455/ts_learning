import { testClosure } from "./closure/index.js";
import { testDecorator } from "./decorator/index.js";
import { methodLogger } from "./decorator/src/decorator.js";
import { testObjectConstancy } from "./other/object-constancy.js";
import { testPrimise } from "./promise/index.js";
import { testString } from "./string/index.js";


// console.log('Hello, world!');
methodLogger(testClosure)();
methodLogger(testDecorator)();
methodLogger(testPrimise)();
methodLogger(testString)();
methodLogger(testObjectConstancy)();