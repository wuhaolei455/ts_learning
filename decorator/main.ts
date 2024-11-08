import { NameLogger, onNetworkException } from "./decorator";

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


new Test().test();
const res = await new Test().fetchData("https://jsonplaceholder.typicode.com/posts/1")