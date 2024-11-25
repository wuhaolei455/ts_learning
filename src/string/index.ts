import { testParseBigNumber } from "./src/bignum.js";
import { testExtractSubstring } from "./src/string.js";

export function testString() {
  testExtractSubstring();
  testParseBigNumber();
}
