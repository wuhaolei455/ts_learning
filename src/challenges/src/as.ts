/** 
 * as
 * 1. 类型断言允许你明确告诉 TypeScript 编译器一个变量的特定类型，即使编译器无法自行推断出正确的类型。
 * 
 * 2. 在 TypeScript 4.1 及以上版本，引入了键重映射（Key Remapping）的特性。
 * 这个特性允许在映射类型中使用 as 关键字对键进行重新映射，可以根据特定条件选择性地包含或排除原始类型的某些键。
 */
export function testAs() {
  let someValue: any = "this is a string";
  let strLength: number = (someValue as string).length;
  // let strLength: number = (<string>someValue).length;
  console.log(strLength);

  // 键重映射
  type Person = {
    name: string;
    age: number;
    location: string;
  }

  type MyOmit<T, K> = {
    [U in keyof T as U extends K ? never : U] : T[U]
  }

  type OmitPerson = MyOmit<Person, 'location'>;

  let omitPerson: OmitPerson = {
    name: "omitPerson",
    age: 22
  }
  console.log(omitPerson);
}

// U in keyof T，属性名，不是类型
// U in keyof T as U，重新映射为类型
type Str = {
  [U in keyof string as U extends 'toString' ? U : never]: string[U]
};