"use client";

import type { LoanFilters as Filters } from "@/types/loan";
import type { User } from "@/types/user";

type LoanFiltersProps = {
  users: User[];
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const hasAnyFilter = (filters: Filters): boolean =>
  Object.values(filters).some((value) => value !== undefined && value !== "");

export function LoanFilters({ users, filters, onChange }: LoanFiltersProps) {
  // Campo vazio significa "sem esse filtro", nunca string vazia: o backend
  // valida o formato de from/to e recusaria "".
  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };

    for (const key of Object.keys(next) as (keyof Filters)[]) {
      if (next[key] === undefined || next[key] === "") delete next[key];
    }

    onChange(next);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label htmlFor="filter-reader" className="block text-sm font-medium">
          Leitor
        </label>
        <select
          id="filter-reader"
          value={filters.userId ?? ""}
          onChange={(event) =>
            update({
              userId: event.target.value
                ? Number(event.target.value)
                : undefined,
            })
          }
          className="rounded border p-2"
        >
          <option value="">Todos</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-from" className="block text-sm font-medium">
          De
        </label>
        <input
          id="filter-from"
          type="date"
          value={filters.from ?? ""}
          onChange={(event) => update({ from: event.target.value })}
          className="rounded border p-2"
        />
      </div>

      <div>
        <label htmlFor="filter-to" className="block text-sm font-medium">
          Até
        </label>
        <input
          id="filter-to"
          type="date"
          value={filters.to ?? ""}
          onChange={(event) => update({ to: event.target.value })}
          className="rounded border p-2"
        />
      </div>

      <div>
        <label htmlFor="filter-status" className="block text-sm font-medium">
          Situação
        </label>
        <select
          id="filter-status"
          value={filters.status ?? ""}
          onChange={(event) =>
            update({
              status: event.target.value
                ? (event.target.value as Filters["status"])
                : undefined,
            })
          }
          className="rounded border p-2"
        >
          <option value="">Todas</option>
          <option value="ativo">Ativo</option>
          <option value="devolvido">Devolvido</option>
        </select>
      </div>

      {hasAnyFilter(filters) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="rounded border px-3 py-2 text-sm"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
