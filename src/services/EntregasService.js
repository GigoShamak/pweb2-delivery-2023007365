import { AppError } from '../utils/AppError.js';

export class EntregasService {
  constructor(repository) {
    this.repository = repository;
  }

  criar({ descricao, origem, destino } = {}) {
    for (const [campo, valor] of Object.entries({ descricao, origem, destino })) {
      if (typeof valor !== 'string' || valor.trim() === '') {
        throw new AppError(400, `Campo obrigatório ausente ou inválido: ${campo}`);
      }
    }
    return this.repository.criar({
      descricao: descricao.trim(),
      origem: origem.trim(),
      destino: destino.trim(),
      status: 'CRIADA',
    });
  }

  listar() {
    return this.repository.listar();
  }

  buscarPorId(id) {
    const entrega = this.repository.buscarPorId(Number(id));
    if (!entrega) throw new AppError(404, 'Entrega não encontrada');
    return entrega;
  }
}
