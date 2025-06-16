// extends, 进行类型检查, 进行类型限制
// keyof, 抽取属性组成联合类型
// typeof, 变量类型检查

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