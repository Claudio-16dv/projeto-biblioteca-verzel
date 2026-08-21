/**
 * No navegador a API é alcançada pela porta publicada no host. Em Server
 * Components o fetch sai de dentro do container, onde `localhost` é o próprio
 * frontend — por isso o endereço interno do serviço na rede do compose.
 */
const SERVER_BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const BROWSER_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function apiUrl(path: string): string {
  const base =
    typeof window === "undefined" ? SERVER_BASE_URL : BROWSER_BASE_URL;

  return `${base}${path}`;
}

type ApiError = {
  statusCode: number;
  message: string | string[];
  error: string;
};

/** Lê a mensagem de erro da API, que o filtro do backend padroniza em `message`. */
export async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `Erro ${response.status}`;

  try {
    const body = (await response.json()) as ApiError;
    return Array.isArray(body.message)
      ? body.message[0]
      : (body.message ?? fallback);
  } catch {
    // resposta sem corpo JSON, mantém a mensagem padrão
    return fallback;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}
