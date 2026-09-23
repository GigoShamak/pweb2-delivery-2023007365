import { AppError } from '../utils/AppError.js';

const STATUS_FINAIS = ['ENTREGUE', 'CANCELADA'];
const PROXIMO_STATUS = { CRIADA: 'EM_TRANSITO', EM_TRANSITO: 'ENTREGUE' };

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
    if (origem.trim().toLowerCase() === destino.trim().toLowerCase()) {
      throw new AppError(400, 'Origem e destino devem ser diferentes');
    }
    const dados = { descricao: descricao.trim(), origem: origem.trim(), destino: destino.trim() };
    const duplicadaAtiva = this.repository
      .buscarPor(dados)
      .some((e) => !STATUS_FINAIS.includes(e.status));
    if (duplicadaAtiva) {
      throw new AppError(409, 'Já existe uma entrega ativa com mesma descrição, origem e destino');
    }
    return this.repository.criar({
      ...dados,
      status: 'CRIADA',
      motoristaId: null,
      historico: [this.#evento('Entrega criada')],
    });
  }

  #evento(descricao) {
    return { data: new Date().toISOString(), descricao };
  }

  listar({ status } = {}) {
    if (status) return this.repository.buscarPor({ status });
    return this.repository.listar();
  }

  buscarPorId(id) {
    const entrega = this.repository.buscarPorId(Number(id));
    if (!entrega) throw new AppError(404, 'Entrega não encontrada');
    return entrega;
  }

  avancar(id) {
    const entrega = this.buscarPorId(id);
    const proximo = PROXIMO_STATUS[entrega.status];
    if (!proximo) {
      throw new AppError(422, `Não é possível avançar uma entrega com status ${entrega.status}`);
    }
    return this.#mudarStatus(entrega, proximo);
  }

  #mudarStatus(entrega, status) {
    return this.repository.atualizar(entrega.id, {
      status,
      historico: [
        ...entrega.historico,
        this.#evento(`Status alterado de ${entrega.status} para ${status}`),
      ],
    });
  }
}
