// 使用柯里化预处理表单校验逻辑的示例（TypeScript）
// 目标：通过先绑定“标签/配置”等上下文，得到可复用、可组合的校验器

// 通用字段校验器：接收字段值与整份表单，返回错误消息或 null
type FieldValidator<TForm, TValue = any> = (
  value: TValue,
  form: TForm
) => string | null;

// 组合多个校验器：返回第一个不通过的错误信息
function composeValidators<TForm, TValue = any>(
  ...validators: Array<FieldValidator<TForm, TValue>>
): FieldValidator<TForm, TValue> {
  return (value: TValue, form: TForm) => {
    for (const validator of validators) {
      const result = validator(value, form);
      if (result) return result;
    }
    return null;
  };
}

// ------- 基础校验器（通过柯里化预先绑定标签/配置） -------

// 必填
const required =
  (label: string) =>
  (value: unknown, _form: any): string | null => {
    if (value === undefined || value === null) return `${label}不能为空`;
    if (typeof value === "string" && value.trim() === "")
      return `${label}不能为空`;
    return null;
  };

// 最小长度
const minLength =
  (label: string) =>
  (min: number) =>
  (value: string, _form: any): string | null => {
    if (typeof value !== "string") return `${label}格式不正确`;
    return value.length < min ? `${label}长度不能小于${min}` : null;
  };

// 正则匹配
const pattern =
  (label: string) =>
  (regex: RegExp) =>
  (message: string) =>
  (value: string, _form: any): string | null => {
    if (typeof value !== "string") return `${label}格式不正确`;
    return regex.test(value) ? null : message;
  };

// 两字段相等（如“确认密码”=“密码”）
const equalTo =
  <TForm>(label: string) =>
  (otherLabel: string) =>
  (getOther: (form: TForm) => any) =>
  (value: any, form: TForm): string | null => {
    return value === getOther(form) ? null : `${label}必须与${otherLabel}一致`;
  };

// 预处理：为某个标签快速生成一组常用校验器工厂
const withLabel = (label: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    required: required(label),
    minLen: (min: number) => minLength(label)(min),
    pattern: (regex: RegExp, msg?: string) =>
      pattern(label)(regex)(msg ?? `${label}格式不正确`),
    email: () => pattern(label)(emailRegex)(`${label}格式不正确`),
  } as const;
};

// ------- 示例：注册表单 -------

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 为不同字段预绑定中文标签（一次绑定，多处复用）
const U = withLabel("用户名");
const E = withLabel("邮箱");
const P = withLabel("密码");
const C = withLabel("确认密码");

// 针对每个字段，组合校验器（从左到右依次校验，返回第一个错误）
const registerRules: {
  [K in keyof RegisterForm]: FieldValidator<RegisterForm, RegisterForm[K]>;
} = {
  username: composeValidators<RegisterForm, string>(U.required, U.minLen(3)),
  email: composeValidators<RegisterForm, string>(E.required, E.email()),
  password: composeValidators<RegisterForm, string>(P.required, P.minLen(6)),
  confirmPassword: composeValidators<RegisterForm, string>(
    C.required,
    equalTo<RegisterForm>("确认密码")("密码")((f) => f.password)
  ),
};

function validateForm(form: RegisterForm) {
  const errors: Partial<Record<keyof RegisterForm, string>> = {};
  (Object.keys(registerRules) as Array<keyof RegisterForm>).forEach((field) => {
    const validator = registerRules[field] as FieldValidator<RegisterForm, any>;
    const value = form[field];
    const msg = validator(value, form);
    if (msg) errors[field] = msg;
  });
  return { valid: Object.keys(errors).length === 0, errors };
}

// ------- 运行示例 -------

const badForm: RegisterForm = {
  username: "ab",
  email: "foo@bar",
  password: "123",
  confirmPassword: "1234",
};

const goodForm: RegisterForm = {
  username: "alice",
  email: "alice@example.com",
  password: "secret123",
  confirmPassword: "secret123",
};

console.log("bad =>", validateForm(badForm));
console.log("good =>", validateForm(goodForm));
