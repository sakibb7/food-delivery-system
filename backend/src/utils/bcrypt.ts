import bcrypt from "bcryptjs";

export const hashValue = async (val: string, saltRounds?: number) =>
  bcrypt.hash(val, saltRounds || 10);

export const compareValue = async (val: string, hanshedValue: string) =>
  bcrypt.compare(val, hanshedValue).catch(() => false);
