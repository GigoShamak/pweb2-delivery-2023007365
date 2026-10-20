// Somente acesso a dados. Sem regra de negócio.
/** @implements {import('./IMotoristasRepository.js').IMotoristasRepository} */
export class MotoristasRepository {
  constructor(database) {
    this.database = database;
  }

  async criar(dados) {
    const motorista = { id: this.database.proximoId('motoristas'), ...dados };
    this.database.motoristas.push(motorista);
    return structuredClone(motorista);
  }

  async listarTodos() {
    return structuredClone(this.database.motoristas);
  }

  async buscarPorId(id) {
    const motorista = this.database.motoristas.find((m) => m.id === id);
    return motorista ? structuredClone(motorista) : null;
  }

  async buscarPorCpf(cpf) {
    const motorista = this.database.motoristas.find((m) => m.cpf === cpf);
    return motorista ? structuredClone(motorista) : null;
  }
}
