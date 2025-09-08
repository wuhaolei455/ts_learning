// ts常见类型的关系
// never 类型表示那些永远不会存在的值，keyof string等
// null 空值, 是所有类型的子类型，可空
// undefined 表示一个变量没有被赋值，未赋值类型
type IsEqual<T, U> = T extends U ? (U extends T ? true : false) : false;
type IsChild<T, U> = T extends U ? true : false;
// export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
//   ? true
//   : false

console.log(typeof null === 'object');
console.log(typeof undefined === 'object');

type T1 = IsEqual<null, undefined>; // false
type T2 = IsEqual<null, object>; // false
type T3 = IsEqual<string, string>; // true

// null, 是所有类型的子类型
type T4 = IsChild<null, undefined>; // true
type T5 = IsChild<null, object>; // true
type T6 = IsChild<null, string>; // true

// 基本类型的数组是 object 的子类型, 但是基本类型不是
type T7 = IsChild<string, object>; // false
type T8 = IsChild<string[], object>; // true
type T9 = IsChild<Function, object>; // true

type T10 = IsEqual<Str, never>; // false
type T11 = IsChild<KuoHao, object>; // false
type T12 = IsChild<(...args: any[]) => any, Function>; // true, Function ts所有可能的函数类型
type T13 = IsEqual<(...args: any[]) => any, Function>; // false



