console.log('2 ** 3', 2 ** 3)
// 1 === '1' false
// const r1 = {} === {} // false
console.log(undefined === null, undefined === undefined, null === null) // false
console.log(typeof undefined, typeof null) // undefined object

// == 会进行类型转换, 将两端的值转换为相同的类型再进行比较; !=, 先==，再取相反值
console.log(1 == '1', 1 == true, 0 == false, '1' == true) // true true true true