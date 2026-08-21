"use client";

import { FormEvent, useState } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
  defaultValue?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
};

function SearchBar({
  className,
  defaultValue = "",
  onSearch,
  placeholder = "Pesquisar...",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch?.(query.trim());
  }

  function handleClear() {
    setQuery("");
    onSearch?.("");
  }

  return (
    <form
      aria-label="Pesquisa"
      className={cn("flex w-full items-center gap-2", className)}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-secondary"
        />
        <Input
          aria-label={placeholder}
          className="pr-10 pl-9"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          type="search"
          value={query}
        />
        {query && (
          <button
            aria-label="Limpar pesquisa"
            className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={handleClear}
            title="Limpar pesquisa"
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
      <Button aria-label="Pesquisar" size="icon" title="Pesquisar" type="submit">
        <Search aria-hidden="true" />
      </Button>
    </form>
  );
}

export { SearchBar };
