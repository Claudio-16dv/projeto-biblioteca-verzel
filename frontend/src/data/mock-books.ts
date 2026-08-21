import type { Book } from "@/types/book";

export const MOCK_BOOKS: Book[] = [
  {
    id: 1,
    title: "Dom Casmurro",
    author: "Machado de Assis",
    publicationYear: 1899,
    totalCopies: 3,
    availableCopies: 2,
  },
  {
    id: 2,
    title: "Grande Sertão: Veredas",
    author: "João Guimarães Rosa",
    publicationYear: 1956,
    totalCopies: 2,
    availableCopies: 0,
  },
  {
    id: 3,
    title: "A Hora da Estrela",
    author: "Clarice Lispector",
    publicationYear: 1977,
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    id: 4,
    title: "Vidas Secas",
    author: "Graciliano Ramos",
    publicationYear: 1938,
    totalCopies: 1,
    availableCopies: 1,
  },
];
