function checkIfInstanceOf0(obj: any, classFunction: any): boolean {
  return obj instanceof classFunction;
}

const n = 1;
const isObject = {} instanceof Object; // error: n instanceof Object
console.log(typeof n);

// instanceof
// instanceof 操作符用于检查一个对象是否为某个类的实例，返回布尔值
// 在右侧非构造函数时;左侧不是对象时，报type error

// 基础类型
// 基础类型无法使用instanceof, 包装类可以; 可以使用typeof or Object转化为引用类型

// 引用类型
const n2 = new Object(2);
const isObject2 = n2 instanceof Object;

function checkIfInstanceOf1(obj: any, classFunction: any): boolean {
  const newObj = new Object(obj);
  return newObj instanceof classFunction;
}

// func call
function checkIfInstanceOf2(obj: any, classFunction: any): boolean {
  const newObj = Object(obj);
  return newObj instanceof classFunction;
}

// 增强的instanceof
function checkIfInstanceOf3(obj: any, classFunction: any): boolean {
  if (obj === null || obj === undefined) return false;
  try {
    const newObj = Object(obj);
    return newObj instanceof classFunction;
  } catch (e) {
    return false;
  }
}

// 使用原型链: 遍历原型链, 一一对比classFunction
// 原型链的尽头是null; 初始js的设计只有null, null转为0不容易发现错误, 索引引入undefined
function checkIfInstanceOf4(obj: any, classFunction: any): boolean {
  if (obj === null || obj === undefined) return false;
  console.log(">>>>>");
  while (obj !== null) {
    if (obj.constructor === classFunction) return true;
    obj = Object.getPrototypeOf(obj);
    console.log(obj);
  }
  console.log(">>>>>");

  return false;
}

// if判断!(classFunction instanceof Function)错误case即可
function checkIfInstanceOf5(obj: any, classFunction: any): boolean {
  if (obj === null || obj === undefined || !(classFunction instanceof Function))
    return false;
  try {
    const newObj = Object(obj);
    return newObj instanceof classFunction;
  } catch (e) {
    return false;
  }
}

function checkIfInstanceOf(obj: any, classFunction: any): boolean {
  if (obj === null || obj === undefined || typeof classFunction !== "function")
    return false;
  try {
    const newObj = Object(obj);
    return newObj instanceof classFunction;
  } catch (e) {
    return false;
  }
}
// console.log(typeof checkIfInstanceOf)

console.log(checkIfInstanceOf([], null));

// 时间复杂度
// 递归时间复杂度: 归函数的时间复杂度通常由递归调用次数（R）和每次递归调用的时间复杂度（O(s)）的乘积决定; 平均调用次数O(logN)

// func call const newObj = Object(obj)
// new: const newObj = new Object(obj): 创建一个新的对象; 并将 obj 的属性复制到新对象中
// Object.create(obj): 会创建一个新对象，其原型链指向 obj
Object.create({});
