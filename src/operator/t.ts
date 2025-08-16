// ||可以合并空值, false、''、0、null、undefined
// ?? 不会合并空值, 只会合并 undefined 和 null
const a: string | undefined = undefined
const a1 = a ?? '123'
const a2 = a || '123'

const q: string | null = null
const q1 = q ?? '123'
const q2 = q || '123'

const k = ''
const k1 = k ?? '123'
const k2 = k || '123'


console.log(a1); 
console.log(a2); 
console.log(q1); 
console.log(q2); 
console.log(k1); // '
console.log(k2); 