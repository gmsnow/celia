import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
});

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}
