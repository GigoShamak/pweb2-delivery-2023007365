import { AppError } from '../utils/AppError.js';

const STATUS_FINAIS = ['ENTREGUE', 'CANCELADA'];
const PROXIMO_STATUS = { CRIADA: 'EM_TRANSITO', EM_TRANSITO: 'ENTREGUE' };

export class EntregasService {
  /**
   * @param {import('../repositories/IEntregasRepository.js').IEntregasRepository} entregasRepository
   * @param {import('../repositories/IMotoristasRepository.js').IMotoristasRepository} motoristasRepository
   */
  constructor(entregasRepository, motoristasRepository) {
    this.entregasRepository = entregasRepository;
    this.motoristasRepository = motoristasRepository;
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
    const duplicadaAtiva = this.entregasRepository
      .listarTodos()
      .some(
        (e) =>
          e.descricao === dados.descricao &&
          e.origem === dados.origem &&
          e.destino === dados.destino &&
          !STATUS_FINAIS.includes(e.status),
      );
    if (duplicadaAtiva) {
      throw new AppError(409, 'Já existe uma entrega ativa com mesma descrição, origem e destino');
    }
    return this.entregasRepository.criar({
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
    return this.entregasRepository.listarTodos(status ? { status } : {});
  }

  buscarPorId(id) {
    const entrega = this.entregasRepository.buscarPorId(Number(id));
    if (!entrega) throw new AppError(404, 'Entrega não encontrada');
    return entrega;
  }

  historico(id) {
    return this.buscarPorId(id).historico;
  }

  avancar(id) {
    const entrega = this.buscarPorId(id);
    const proximo = PROXIMO_STATUS[entrega.status];
    if (!proximo) {
      throw new AppError(422, `Não é possível avançar uma entrega com status ${entrega.status}`);
    }
    return this.#mudarStatus(entrega, proximo);
  }

  cancelar(id) {
    const entrega = this.buscarPorId(id);
    if (STATUS_FINAIS.includes(entrega.status)) {
      throw new AppError(422, `Não é possível cancelar uma entrega com status ${entrega.status}`);
    }
    return this.#mudarStatus(entrega, 'CANCELADA');
  }

  atribuir(id, { motoristaId } = {}) {
    const entrega = this.buscarPorId(id);
    if (motoristaId == null || !Number.isInteger(Number(motoristaId))) {
      throw new AppError(400, 'Campo obrigatório ausente ou inválido: motoristaId');
    }
    const motorista = this.motoristasRepository.buscarPorId(Number(motoristaId));
    if (!motorista) throw new AppError(404, 'Motorista não encontrado');
    if (entrega.status !== 'CRIADA') {
      throw new AppError(
        422,
        `Só é possível atribuir motorista a entrega CRIADA (status atual: ${entrega.status})`,
      );
    }
    if (motorista.status !== 'ATIVO') {
      throw new AppError(422, 'Motorista inativo não pode ser atribuído a uma entrega');
    }
    return this.entregasRepository.atualizar(entrega.id, {
      motoristaId: motorista.id,
      historico: [...entrega.historico, this.#evento(`Motorista ${motorista.nome} atribuído`)],
    });
  }

  #mudarStatus(entrega, status) {
    return this.entregasRepository.atualizar(entrega.id, {
      status,
      historico: [
        ...entrega.historico,
        this.#evento(`Status alterado de ${entrega.status} para ${status}`),
      ],
    });
  }
}
