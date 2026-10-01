import { AppError } from '../utils/AppError.js';

export class MotoristasService {
  /**
   * @param {import('../repositories/IMotoristasRepository.js').IMotoristasRepository} motoristasRepository
   * @param {import('../repositories/IEntregasRepository.js').IEntregasRepository} entregasRepository
   */
  constructor(motoristasRepository, entregasRepository) {
    this.motoristasRepository = motoristasRepository;
    this.entregasRepository = entregasRepository;
  }

  criar({ nome, cpf, placaVeiculo } = {}) {
    for (const [campo, valor] of Object.entries({ nome, cpf })) {
      if (typeof valor !== 'string' || valor.trim() === '') {
        throw new AppError(400, `Campo obrigatório ausente ou inválido: ${campo}`);
      }
    }
    if (placaVeiculo != null && typeof placaVeiculo !== 'string') {
      throw new AppError(400, 'Campo inválido: placaVeiculo');
    }
    if (this.motoristasRepository.buscarPorCpf(cpf.trim())) {
      throw new AppError(409, `Já existe um motorista cadastrado com o CPF ${cpf.trim()}`);
    }
    return this.motoristasRepository.criar({
      nome: nome.trim(),
      cpf: cpf.trim(),
      placaVeiculo: placaVeiculo?.trim() || null,
      status: 'ATIVO',
    });
  }

  listar() {
    return this.motoristasRepository.listarTodos();
  }

  buscarPorId(id) {
    const motorista = this.motoristasRepository.buscarPorId(Number(id));
    if (!motorista) throw new AppError(404, 'Motorista não encontrado');
    return motorista;
  }

  listarEntregas(id, { status } = {}) {
    const motorista = this.buscarPorId(id);
    const filtros = { motoristaId: motorista.id };
    if (status) filtros.status = status;
    return this.entregasRepository.listarTodos(filtros);
  }
}
