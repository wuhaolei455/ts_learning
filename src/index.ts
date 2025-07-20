const obj1 = { 'error': 'module not found' };
const obj2 = JSON.parse(JSON.stringify(obj1));
console.log(obj1 == obj2, obj1 == obj1); // Output: false true