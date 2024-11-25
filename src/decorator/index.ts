import fetch from "node-fetch";
import { NameLogger, onNetworkException } from "./src/decorator.js";

class Test {
  @NameLogger
  test() {
    console.log("test");
  }

  @onNetworkException
  async fetchData(url: string): Promise<any> {
    return fetch(url)
  }
}

export async function testDecorator() {
  new Test().test();
  new Test().fetchData("https://jsonplaceholder.typicode.com/posts/1").then((res) => {
    console.log(`访问结果: ${res.status}`);
  })
}