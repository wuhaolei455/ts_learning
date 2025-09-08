type Circle = {
  kind: 'circle';
  radius: number;
  test: string;
};

type Rectangle = {
  kind: 'rectangle';
  width: number;
  height: number;
  test: string;
};

type Shape = Circle | Rectangle; // keyof Shape = 'kind' | 'test, 是两种类型共有的key

type KeyOfShape = keyof Shape // keyof Shape = 'kind' | 'test',

type Test = { // 交叉类型, 取两个类型的交集: Test { kind: 'circle' | 'rectangle', test: string }
  [k in KeyOfShape]: Shape[k]
}

// 其实是never类型 ✅, 因为类型有冲突
type Shape2 = Circle & Rectangle // 联合类型, 取两个类型的并集: Shape2 { kind: 'circle' | 'rectangle', radius: number, width: number, height: string } ❌

type KeyOfShape2 = keyof Shape2 // keyof Shape2 = 'kind' | 'radius' | 'width' | 'height'