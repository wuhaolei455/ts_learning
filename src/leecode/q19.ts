type Fn19 = (accum: number, curr: number) => number;

function reduce(nums: number[], fn: Fn19, init: number): number {
  let res = init;
  for (let num of nums) {
    res = fn(res, num);
  }
  return res;
}
