type Box<T> = { value: T };
type UnBox<T> = T extends Box<infer U> ? U : never;

type BoxString = Box<string>;
type UnBoxString = UnBox<BoxString>;

type f = () => string