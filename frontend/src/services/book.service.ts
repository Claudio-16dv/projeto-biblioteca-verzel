import { api } from "@/lib/api";
import type { Book, CreateBookDto, RankedBook } from "@/types/book";

export async function listBooks(): Promise<Book[]> {
  return api<Book[]>("/books");
}

export async function createBook(dto: CreateBookDto): Promise<Book> {
  return api<Book>("/books", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function listBookRanking(
  signal?: AbortSignal,
): Promise<RankedBook[]> {
  return api<RankedBook[]>("/books/ranking", {
    cache: "no-store",
    signal,
  });
}
