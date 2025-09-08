type Box<T> = { value: T };
type UnBox<T> = T extends Box<infer U> ? U : never;

type BoxString = Box<string>;
type UnBoxString = UnBox<BoxString>;

type BoxNumber = Box<number>;
type UnBoxNumber = UnBox<BoxNumber>;

type BoxBoolean = Box<boolean>;
type UnBoxBoolean = UnBox<BoxBoolean>;


type f = () => string

type PromiseType<T> = T extends Promise<infer U> ? U : never;

async function fetchData(): Promise<string> {
  return 'data';
}

type t = typeof fetchData
type inferT = string extends infer t ? t : never

type FetchDataType = PromiseType<typeof fetchData>; // string


type ElementType<T> = T extends (infer U)[] ? U : never;

const numbers: string[] = ['1', '2', '3'];
type NumberElementType = ElementType<typeof numbers>; // string
