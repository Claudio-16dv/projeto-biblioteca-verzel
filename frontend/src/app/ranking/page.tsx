import type { Metadata } from "next";

import { RankingContent } from "./ranking-content";

export const metadata: Metadata = {
  title: "Ranking de livros | Biblioteca Verzel",
  description: "Livros mais emprestados da Biblioteca Verzel.",
};

export default function RankingPage() {
  return <RankingContent />;
}
