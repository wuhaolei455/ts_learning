const obj1 = { 'error': 'module not found' };
const obj2 = JSON.parse(JSON.stringify(obj1));
console.log(obj1 == obj2, obj1 == obj1); // Output: false true

function isAsyncFunction(func: Function): boolean {
  return func instanceof Function && func[Symbol.toStringTag] === 'AsyncFunction';
}

async function test() {
  return 'test'
}

function test2() {  
  return 'test2'
}

console.log(isAsyncFunction(test)); // Output: true
console.log(isAsyncFunction(test2)); // Output: false