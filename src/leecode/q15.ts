type Fn15 = (n: number, i: number) => any;

function filter(arr: number[], fn: Fn15): number[] {
  const nums = [];
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i)) nums.push(arr[i]);
  }
  return nums;
}
