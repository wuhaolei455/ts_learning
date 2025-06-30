
console.log('2 ** 3', 2 ** 3)
// 1 === '1' false
// const r1 = {} === {} // false
console.log(undefined === null, undefined === undefined, null === null) // false
console.log(typeof undefined, typeof null) // undefined object

// == 会进行类型转换, 将两端的值转换为相同的类型再进行比较; !=, 先==，再取相反值
console.log(1 == '1', 1 == true, 0 == false, '1' == true) // true true true true

// 0x10 & 0x01 == 0 error
// (0x10 & 0x01) == 0


var days = 1 // 每日+1
const KEY = 'wuhaolei'
var map = { [KEY]: 1 }

function canShow() {
  return (getFlag() & map[KEY]) === 0
}

export const show = () => {
  if (canShow()) {
    console.log('show')
    map[KEY] = getFlag() | map[KEY] // 更新map, |自己 + &自己不能再为0
  } else {
    console.log('not show')
  }
}


function getFlag() {
  if (days < 7 && days > 0) {
    return 0x10
  } else if (days < 60 && days >= 7) {
    return 0x100
  } else if (days < 365 && days >= 60) {
    return 0x1000
  } else {
    return 0x1111
  }
}

show()
setTimeout(() => {
  days++ // 每日+1
  show()
}, 1000)

setTimeout(() => {
  days = 7 // 每日+1
  show()
}, 2000)

setTimeout(() => {
  days++ // 每日+1
  show()
}, 3000)