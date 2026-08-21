"use client";

import type { User } from "@/types/user";

type ReaderSelectProps = {
  users: User[];
  selectedUserId: number | null;
  onChange: (userId: number | null) => void;
};

export function ReaderSelect({
  users,
  selectedUserId,
  onChange,
}: ReaderSelectProps) {
  return (
    <div>
      <label htmlFor="reader" className="block text-sm font-medium">
        Leitor
      </label>
      <select
        id="reader"
        value={selectedUserId ?? ""}
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : null)
        }
        className="rounded border p-2"
      >
        <option value="">Selecione um leitor</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
