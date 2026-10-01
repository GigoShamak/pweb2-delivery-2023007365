// Somente acesso a dados. Sem regra de negócio.
/** @implements {import('./IMotoristasRepository.js').IMotoristasRepository} */
export class MotoristasRepository {
  constructor(database) {
    this.database = database;
  }

  criar(dados) {
    const motorista = { id: this.database.proximoId('motoristas'), ...dados };
    this.database.motoristas.push(motorista);
    return structuredClone(motorista);
  }

  listarTodos() {
    return structuredClone(this.database.motoristas);
  }

  buscarPorId(id) {
    const motorista = this.database.motoristas.find((m) => m.id === id);
    return motorista ? structuredClone(motorista) : null;
  }

  buscarPorCpf(cpf) {
    const motorista = this.database.motoristas.find((m) => m.cpf === cpf);
    return motorista ? structuredClone(motorista) : null;
  }
}
