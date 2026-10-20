// Somente acesso a dados (Prisma + SQLite). Sem regra de negócio.
import { prisma } from '../config/database.js';

// Ids fora do intervalo de um Int do banco não existem (e quebrariam a query).
const idValido = (id) => Number.isInteger(id) && id > 0 && id <= 2147483647;

/** @implements {import('./IMotoristasRepository.js').IMotoristasRepository} */
export class MotoristasPrismaRepository {
  async criar(dados) {
    return prisma.motorista.create({ data: dados });
  }

  async listarTodos() {
    return prisma.motorista.findMany({ orderBy: { id: 'asc' } });
  }

  async buscarPorId(id) {
    if (!idValido(id)) return null;
    return prisma.motorista.findUnique({ where: { id } });
  }

  async buscarPorCpf(cpf) {
    return prisma.motorista.findUnique({ where: { cpf } });
  }
}
