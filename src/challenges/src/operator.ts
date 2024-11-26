// extends, 进行类型检查, 进行类型限制
// keyof, 抽取属性组成联合类型
// typeof, 变量类型检查

interface T {
  a: number;
  b: string;
}
// <-----------------------------------------------------> 类型介绍 </----------------------------------------------------->
// 对象取值
function pickValue1<T>(obj: T, key: string) {
  return obj[key];
}

// 对象的类型取值
function pickValue2<T>(obj: T, key: keyof T): T[keyof T] {
  return obj[key]
}

const foo: T = { a: 111, b: '222' }
console.log(pickValue1(foo, 'a'));
console.log(typeof pickValue2(foo, 'a') === 'number');

function pickValue3<T extends object, R extends keyof T>(obj: T, keys: R[]): T[R][] {
  return keys.map(key => obj[key]);
}

// <-----------------------------------------------------> extends、keyof配合使用 </----------------------------------------------------->
// 遍历版本
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}

// 递归版本, 可以通过X2类型, X1无法通过, Function是object的子类型
// type DeepReadonly<T> = {
//   readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
// }

// 递归版本, 可以通过X1类型, X2无法通过, 不可能情况readonly + readonly
// type DeepReadonly<T> = keyof T extends never ? T : { readonly [K in keyof T]: DeepReadonly<T[K]> }

// 最终类型
type DeepReadonly<T> = {
  readonly [K in keyof T]: (keyof T[K] extends never ? T[K] : DeepReadonly<T[K]>)
}


type KuoHao = keyof {} extends never ? 'yes' : 'no'; // yes
type Str = keyof string extends never ? 'yes' : 'no'; // no
type Null = keyof null extends never ? 'yes' : 'no'; // yes
type Undefined = keyof undefined extends never ? 'yes' : 'no'; // yes
type Union = keyof {} | {} extends never ? 'yes' : 'no'; // no