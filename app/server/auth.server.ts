import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { createCookieSessionStorage, json, redirect } from "@remix-run/node";

import { createUser } from "./user.server";
import type { ErrorData, LoginForm, RegisterForm } from "types/index.server";
import { prisma } from "lib/prisma.server";
import * as bcrypt from "bcrypt";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) throw new Error("Secret not specified, it must be set");

const storage = createCookieSessionStorage({
  cookie: {
    name: "strongion-auth",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getUserSession(req: Request) {
  return storage.getSession(req.headers.get("Cookie"));
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/auth/login?${searchParams.toString()}`);
  }
  return userId;
}

export async function registerUser(form: RegisterForm) {
  try {
    const newUser = await createUser(form);
    if (!newUser) {
      return json<ErrorData>({
        error: {
          body: `Something went wrong trying to create a new user.`,
          status: 400,
        },
        fields: {
          name: form.name,
          password: form.password,
        },
      });
    }
    const res = createUserSession(newUser.id, "/");
    return res;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return json({
          error: { body: `User already exists with that name`, status: 400 },
        });
      }
    }
  }
}

export async function login(loginForm: LoginForm) {
  const user = await prisma.user.findFirst({
    where: {
      name: loginForm.name,
    },
  });

  if (!user) {
    return json({
      error: { body: `User with that name, does not exist`, status: 400 },
    });
  }

  if (await bcrypt.compare(loginForm.password, user.password)) {
    return createUserSession(user.id, "/");
  } else {
    return json<ErrorData>({
      error: { body: `User name and password do not match`, status: 400 },
    });
  }
}

export async function logout(req: Request) {
  const session = await getUserSession(req);
  return redirect("/auth/logout", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
