interface T {
  a: number;
  b: string;
}
// <-----------------------------------------------------> 类型介绍 </----------------------------------------------------->
// 普通对象取值
function pickValue1<T>(obj: T, key: string) {
  return obj[key];
}

// 类型作为对象来操作
function pickValue2<T>(obj: T, key: keyof T): T[keyof T] {
  return obj[key]
}

// 健壮的pickvalue
function pickValue<T extends object, R extends keyof T>(obj: T, key: R): T[R] {
  return obj[key];
}

function pickValue4<T extends object, R extends keyof T>(obj: T, keys: R[]): T[R][] {
  return keys.map(key => obj[key]);
}

const foo: T = { a: 111, b: '222' }
const val1 = pickValue1(foo, 'a')
console.log(typeof pickValue2(foo, 'a') === 'number');
// console.log(pickValue3(foo, 'c')); // 这里对key有约束, 不存在的key会报错
const val = pickValue(foo, 'a'); // 另外一个优势, 可以确定函数返回值类型
