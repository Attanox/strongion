import type { User } from "@prisma/client";

export type RegisterForm = {
  name: User["name"];
  password: User["password"];
};

export type LoginForm = {
  name: User["name"];
  password: User["password"];
};

export type ErrorData = {
  error: {
    status: number;
    body: string;
  };
  fields?: {
    [key: string]: string;
  };
};
