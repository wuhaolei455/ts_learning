// ============= Test Cases =============
import type { Equal, Expect } from './test-utils.js'

type cases = [
  Expect<Equal<MyReadonly<Todo1>, Readonly<Todo1>>>,
]

interface Todo1 {
  title: string
  description: string
  completed: boolean
  meta: {
    author: string
  }
}

interface Todo {
  name: string,
  meta: {
    author: string
  }
}


// ============= Your Code Here =============
// 每个属性添加 readonly 修饰符
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}

const todo1: MyReadonly<Todo> = {
  name: 'name',
  meta: {
    author: 'author'
  }
}

todo1.meta.author = 'hehe'




