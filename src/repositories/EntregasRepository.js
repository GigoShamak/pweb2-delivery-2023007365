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

  listarTodos(filtros = {}) {
    const campos = Object.entries(filtros).filter(([, valor]) => valor !== undefined);
    return structuredClone(
      this.database.entregas.filter((e) => campos.every(([campo, valor]) => e[campo] === valor)),
    );
  }

  buscarPorId(id) {
    const entrega = this.database.entregas.find((e) => e.id === id);
    return entrega ? structuredClone(entrega) : null;
  }

  atualizar(id, dados) {
    const indice = this.database.entregas.findIndex((e) => e.id === id);
    if (indice === -1) return null;
    this.database.entregas[indice] = { ...this.database.entregas[indice], ...dados, id };
    return structuredClone(this.database.entregas[indice]);
  }
}
