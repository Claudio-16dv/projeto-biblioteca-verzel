"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBook } from "@/services/book.service";
import {
  createBookSchema,
  type CreateBookInput,
  type CreateBookOutput,
} from "@/schemas/book.schema";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { Button } from "@/components/ui/button";

export function BookForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookInput, unknown, CreateBookOutput>({
    resolver: zodResolver(createBookSchema),
  });

  async function onSubmit(data: CreateBookOutput) {
    setServerError(null);

    try {
      await createBook(data);
      reset();
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Erro ao cadastrar o livro",
      );
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          {...register("title")}
          className="w-full rounded border p-2"
        />
        {errors.title && (
          <p role="alert" className="text-sm text-red-600">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium">
          Autor
        </label>
        <input
          id="author"
          {...register("author")}
          className="w-full rounded border p-2"
        />
        {errors.author && (
          <p role="alert" className="text-sm text-red-600">
            {errors.author.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="publicationYear" className="block text-sm font-medium">
          Ano de publicação
        </label>
        <input
          id="publicationYear"
          type="number"
          {...register("publicationYear")}
          className="w-full rounded border p-2"
        />
        {errors.publicationYear && (
          <p role="alert" className="text-sm text-red-600">
            {errors.publicationYear.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="copies" className="block text-sm font-medium">
          Quantidade de cópias
        </label>
        <input
          id="copies"
          type="number"
          {...register("copies")}
          className="w-full rounded border p-2"
        />
        {errors.copies && (
          <p role="alert" className="text-sm text-red-600">
            {errors.copies.message}
          </p>
        )}
      </div>

      {serverError && <FeedbackMessage variant="error" message={serverError} />}

      <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? "Cadastrando..." : "Cadastrar"}
      </Button>
    </div>
  );
}
