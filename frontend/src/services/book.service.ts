import { api } from "@/lib/api";
import type { Book, CreateBookDto } from "@/types/book";

export async function listBooks(): Promise<Book[]> {
  return api<Book[]>("/books");
}

export async function createBook(dto: CreateBookDto): Promise<Book> {
  return api<Book>("/books", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
