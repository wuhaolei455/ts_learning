type MyExclude<T, U> = T extends U ? T : never;

interface User {
  id: number;
  name: string;
  email: string;
}

type UserNameAndId = MyPick<User, "name" | "id">;
// // 相当于：
// // type UserNameAndId = {
// //   id: number;
// //   name: string;
// // }

//
type MyPick<T, K extends keyof T> = {
  [M in K]: T[M];
};

type MyOmit<T, K extends keyof T> = MyPick<T, Exclude<keyof T, K>>;
type MyOmitUser = MyOmit<User, "email">;
// // 相当于：
// // type UserNameAndId = {
// //   id: number;
// //   name: string;
// // }
