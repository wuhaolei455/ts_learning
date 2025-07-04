import { EffectType } from "./type";

Object.keys(EffectType).forEach((key) => {
  const value = EffectType[key as keyof typeof EffectType];
  console.log(key, value);
});