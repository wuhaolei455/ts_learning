// 完全一致的json字符串，应该考察的是递归进行json序列化
type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };

function areDeeplyEqual(obj1: JSONValue, obj2: JSONValue): boolean {
  // 基础类型，或者相同引用
  if (obj1 === obj2) return true;

  // 判断是否均为对象（非数组）
  const isObj = (val: any): val is boolean =>
    typeof val === "object" && val !== null && !Array.isArray(val);

  // 数组和对象
  if (isObj(obj1) && isObj(obj2)) {
    // 对象
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);
    if (obj1Keys.length !== obj2Keys.length) return false;
    for (let key of obj1Keys) {
      if (!areDeeplyEqual(obj1[key], obj2[key])) return false;
    }
    return true;
  } else if (Array.isArray(obj1) && Array.isArray(obj2)) {
    // 数组
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!areDeeplyEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }
  return false;
}

const json1: JSONValue = { "0": 1 };
const json2: JSONValue = [1];
console.log(areDeeplyEqual(json1, json2));
