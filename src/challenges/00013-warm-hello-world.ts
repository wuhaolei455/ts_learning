// ============= Test Cases =============
import type { Equal, Expect, NotAny } from './test-utils'

type cases = [
  Expect<NotAny<HelloWorld>>,
  Expect<Equal<HelloWorld, string>>,
]

export type Success = cases extends readonly true[] ? true : false


// ============= Your Code Here =============
type HelloWorld = string // expected to be a string
const res: Success = true
console.log(res as true)