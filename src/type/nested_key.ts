export type Config = {
  [key: string]: Record<string, (...args: any[]) => Promise<string> | string>;
}

export enum VoiceChatStatus {
  NONE,
  CALLING,
  WELCOME,
  THINKING,
  SPEAKING,
  LISTENING,
  NETWORK_ERROR,
  RECONECTING,
}


const config: Config = {
  [VoiceChatStatus.CALLING]: {
    hangup: () => VoiceChatStatus.NONE.toString(),
  },
  [VoiceChatStatus.WELCOME]: {
  },
  [VoiceChatStatus.LISTENING]: {
  },
  [VoiceChatStatus.THINKING]: {
    interrupt: () => VoiceChatStatus.LISTENING.toString(),
  },
  [VoiceChatStatus.SPEAKING]: {
    interrupt: () => VoiceChatStatus.LISTENING.toString(),
    reSpeak: () => VoiceChatStatus.SPEAKING.toString(),
  },
  [VoiceChatStatus.NETWORK_ERROR]: {
    retry: () => VoiceChatStatus.CALLING.toString(),
  },
  [VoiceChatStatus.RECONECTING]: {
    reconnect: () => VoiceChatStatus.CALLING.toString(),
  },
};

// 花括号内部定义了一种“属性结构”，表示生成一个新类型，这个类型的属性与 T 的键相同，但属性值可以自己定义。
// ...[keyof T] 这个索引访问语法，取得这个映射类型所有属性值类型的联合
type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object ? K | NestedKeys<T[K]> : K
}[keyof T]

type Obj = {
  a: string;
  b: {
    b1: string;
    b2: {
      b21: number;
    };
  };
  c: number;
};
type Result = NestedKeys<Obj>;
const result: Result = 'b21';

// 花括号内部定义了一种“属性结构”，表示生成一个新类型，这个类型的属性与 T 的键相同，但属性值可以自己定义。
type HuaKuohao = {
  [K in keyof Obj]: number
}
// ...[keyof T] 这个索引访问语法，取得这个映射类型所有属性值类型的联合
type ObjToKey = HuaKuohao[keyof HuaKuohao];



