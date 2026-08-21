const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiError = {
  statusCode: number;
  message: string | string[];
  error: string;
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;

    try {
      const body = (await response.json()) as ApiError;
      message = Array.isArray(body.message)
        ? body.message[0]
        : (body.message ?? message);
    } catch {
      // resposta sem corpo JSON, mantém a mensagem padrão
    }

    throw new Error(message);
  }

  return response.json();
}
