/** Corpo padronizado de erro, produzido pelo HttpExceptionFilter. */
export class ApiErrorDto {
  /** Codigo HTTP da resposta. */
  statusCode: number;

  /**
   * Mensagem pronta para exibicao. Sempre string: o filtro achata o array
   * que o ValidationPipe devolve quando ha mais de uma falha.
   */
  message: string;

  /** Nome curto do status HTTP, como "Conflict". */
  error: string;
}
