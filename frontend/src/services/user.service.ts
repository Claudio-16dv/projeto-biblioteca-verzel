import { api } from "@/lib/api";
import type { User } from "@/types/user";

export async function listUsers(): Promise<User[]> {
  return api<User[]>("/users");
}
