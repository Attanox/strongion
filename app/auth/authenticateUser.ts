import { redirect } from "@remix-run/node";
import { getUser } from "server/user.server";

export const authenticateUser = async (req: Request) => {
  const user = await getUser(req);

  if (!user) throw redirect("auth/login");

  return user;
};
