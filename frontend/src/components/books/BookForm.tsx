"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBook } from "@/services/book.service";
import {
  createBookSchema,
  type CreateBookInput,
  type CreateBookOutput,
} from "@/schemas/book.schema";

type BookFormProps = {
  onCreated: () => void;
};

export function BookForm({ onCreated }: BookFormProps) {
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
      onCreated();
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

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Cadastrando..." : "Cadastrar"}
      </button>
    </div>
  );
}
