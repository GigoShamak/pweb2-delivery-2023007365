export class AppError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}
