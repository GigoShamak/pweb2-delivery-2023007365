// Somente acesso a dados (Prisma + SQLite). Sem regra de negócio.
import { Prisma, StatusEntrega } from '@prisma/client';
import { prisma } from '../config/database.js';

// Ids fora do intervalo de um Int do banco não existem (e quebrariam a query).
const idValido = (id) => Number.isInteger(id) && id > 0 && id <= 2147483647;

const COM_HISTORICO = { historico: { orderBy: { id: 'asc' } } };

// Linha do banco (com eventos) -> Entrega no formato do contrato.
function paraEntrega({ historico, ...entrega }) {
  return {
    ...entrega,
    historico: historico.map(({ data, descricao }) => ({ data: data.toISOString(), descricao })),
  };
}

const paraEventos = (historico) => historico.map(({ data, descricao }) => ({ data, descricao }));

/** @implements {import('./IEntregasRepository.js').IEntregasRepository} */
export class EntregasPrismaRepository {
  async criar({ historico = [], ...dados }) {
    const entrega = await prisma.entrega.create({
      data: { ...dados, historico: { create: paraEventos(historico) } },
      include: COM_HISTORICO,
    });
    return paraEntrega(entrega);
  }

  async listarTodos({ status, motoristaId } = {}) {
    // Status que não existe no enum não casa com nenhuma entrega.
    if (status !== undefined && !Object.values(StatusEntrega).includes(status)) return [];
    const entregas = await prisma.entrega.findMany({
      where: { status, motoristaId },
      include: COM_HISTORICO,
      orderBy: { id: 'asc' },
    });
    return entregas.map(paraEntrega);
  }

  async buscarPorId(id) {
    if (!idValido(id)) return null;
    const entrega = await prisma.entrega.findUnique({ where: { id }, include: COM_HISTORICO });
    return entrega ? paraEntrega(entrega) : null;
  }

  async atualizar(id, { id: _id, historico, ...dados }) {
    if (!idValido(id)) return null;
    try {
      const entrega = await prisma.entrega.update({
        where: { id },
        data: {
          ...dados,
          // O histórico recebido substitui o anterior (mesma semântica do repository em memória).
          ...(historico && { historico: { deleteMany: {}, create: paraEventos(historico) } }),
        },
        include: COM_HISTORICO,
      });
      return paraEntrega(entrega);
    } catch (erro) {
      // P2025: registro não encontrado.
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2025') return null;
      throw erro;
    }
  }
}
