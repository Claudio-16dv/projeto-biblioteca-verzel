import { z } from "zod";

const CURRENT_YEAR = new Date().getFullYear();

export const createBookSchema = z.object({
  title: z.string().trim().min(1, "O título é obrigatório"),
  author: z.string().trim().min(1, "O autor é obrigatório"),
  publicationYear: z.coerce
    .number({ message: "O ano de publicação é obrigatório" })
    .int("O ano deve ser um número inteiro")
    .max(CURRENT_YEAR, "O ano de publicação não pode ser futuro"),
  copies: z.coerce
    .number({ message: "A quantidade de cópias é obrigatória" })
    .int("A quantidade deve ser um número inteiro")
    .min(0, "A quantidade de cópias não pode ser negativa"),
});

export type CreateBookInput = z.input<typeof createBookSchema>;
export type CreateBookOutput = z.output<typeof createBookSchema>;
