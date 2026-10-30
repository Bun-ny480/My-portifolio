import argon2 from "argon2";

export const hashPassword = (p: string) =>
  argon2.hash(p, { type: argon2.argon2id, memoryCost: 2 ** 16, timeCost: 3, parallelism: 1 });

export const verifyPassword = (hash: string, p: string) => argon2.verify(hash, p);
