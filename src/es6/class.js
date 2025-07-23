// class关键字作为function构造函数的语法糖出现; static定义的属性和方法属于构造函数本身; 总之, static + class提供了一种更为简洁的类层次定义方式
export class ApiService {
  static getXXXX() {
    return "https://www.example.com";
  }
}
