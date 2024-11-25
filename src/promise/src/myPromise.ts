// https://github.com/yuanyuanbyte/Blog/issues/125
export class MyPromise {
    private resolved: any;
    private rejected: any;

    constructor(func: any) {
        func(this.resolve, this.reject);
    }

    resolve() {

    }

    reject() {

    }

    then(resolve: any) {
        this.resolved = resolve;
        return this
    }

    catch(reject: any) {
        this.rejected = reject;
        return this
    }
}