type Func = (x: number) => number;

function compose(functions: Func[]): Func {
  functions.reverse();
  return function (x) {
    let res = x;
    for (let func of functions) {
      res = func(res);
    }

    return res;
  };
}
