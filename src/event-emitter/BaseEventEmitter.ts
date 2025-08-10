type Callback = (...args: any[]) => any;
type Subscription = {
  unsubscribe: () => void;
};

class BasicEventEmitter {
  private eventMap: Map<string, Callback[]> = new Map();

  subscribe(eventName: string, callback: Callback): Subscription {
    const listeners = this.eventMap.get(eventName);
    if (listeners) {
      listeners.push(callback);
    } else {
      const newListeners = [callback];
      this.eventMap.set(eventName, newListeners);
    }
    return {
      unsubscribe: () => {
        const listeners = this.eventMap.get(eventName);
        if (listeners) {
          const index = listeners.indexOf(callback);
          if (index !== -1) {
            listeners.splice(index, 1);
          }
        }
      },
    };
  }

  emit(eventName: string, args: any[] = []): any[] { // ...args: any[], 拆包默认string[]
    const listeners = this.eventMap.get(eventName);
    if (listeners) {
      const result: any[] = [];
      listeners.forEach((fn) => {
        result.push(fn(...args));
      });

      return result;
    }
    return [];
  }
}