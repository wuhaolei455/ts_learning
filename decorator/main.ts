import { NameLogger } from "./decorator";

class Test {
  @NameLogger
  test() {
    console.log("test");
  }
}

new Test().test();
