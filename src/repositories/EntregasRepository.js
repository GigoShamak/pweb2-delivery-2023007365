// Somente acesso a dados. Sem regra de negócio.
export class EntregasRepository {
  constructor(database) {
    this.database = database;
  }

  criar(dados) {
    const entrega = { id: this.database.proximoId('entregas'), ...dados };
    this.database.entregas.push(entrega);
    return structuredClone(entrega);
  }

  listar() {
    return structuredClone(this.database.entregas);
  }

  buscarPorId(id) {
    const entrega = this.database.entregas.find((e) => e.id === id);
    return entrega ? structuredClone(entrega) : null;
  }
}
