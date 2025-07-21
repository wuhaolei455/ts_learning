for (let i = 0; i < 10; i++) {
  console.log(i);
}


// for循环: for()单独作用域, {}
for (let i = 0; i < 10; i++) {
  let i = 5;
  console.log(i);
}


// 函数内的var变量存在变量提升, scope从func提升到global
var tmp = new Date();
function f() {
  if (false) {
    var tmp = "hello world";
  }
  // if (true) {
  //   var tmp = "hello world2";
  // }

  console.log(tmp);
}
f(); // undefined, 因为var提升了tmp的声明, 但是没有赋值; true则为"hello world2"

function f2() {
  if (true) {
    let tmp = "hello world";
    console.log(tmp); // hello world
  }

  console.log(tmp); // 正常时间, 因为ES6引入block scope, let有块级作用域, 所以let声明的tmp只在块内生效不会覆盖全局tmp变量
}
f2()

function f3() { console.log('I am outside!'); }

(function () {
  if (false) {
    function f3() { console.log('I am inside!'); }
  }
  f3();
}());