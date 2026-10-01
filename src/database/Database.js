// Persistência SIMULADA em memória (sem banco real, sem ORM).
export class Database {
  constructor() {
    this.entregas = [];
    this.motoristas = [];
    this._sequencias = { entregas: 0, motoristas: 0 };
  }

  proximoId(tabela) {
    this._sequencias[tabela] += 1;
    return this._sequencias[tabela];
  }
}
