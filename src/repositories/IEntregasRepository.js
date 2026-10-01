// Contrato do repository de entregas. Os services dependem só deste contrato,
// nunca da implementação concreta (EntregasRepository).

/**
 * @typedef {Object} Evento
 * @property {string} data Data do evento em formato ISO.
 * @property {string} descricao O que aconteceu com a entrega.
 */

/**
 * @typedef {Object} Entrega
 * @property {number} id Gerado pelo repository.
 * @property {string} descricao
 * @property {string} origem
 * @property {string} destino
 * @property {'CRIADA' | 'EM_TRANSITO' | 'ENTREGUE' | 'CANCELADA'} status
 * @property {number | null} motoristaId null enquanto não houver atribuição.
 * @property {Evento[]} historico
 */

/**
 * Filtros de igualdade aceitos na listagem. Campo ausente = não filtra.
 * @typedef {Object} FiltrosEntrega
 * @property {Entrega['status']} [status]
 * @property {number} [motoristaId]
 */

/**
 * @typedef {Object} IEntregasRepository
 * @property {(filtros?: FiltrosEntrega) => Entrega[]} listarTodos
 *   Lista as entregas; com filtros, só as que têm todos os campos iguais.
 * @property {(id: number) => Entrega | null} buscarPorId
 *   Busca uma entrega pelo id; null se não existir.
 * @property {(dados: Omit<Entrega, 'id'>) => Entrega} criar
 *   Persiste uma nova entrega e a devolve com o id gerado.
 * @property {(id: number, dados: Partial<Omit<Entrega, 'id'>>) => Entrega} atualizar
 *   Altera os campos informados da entrega e devolve a entrega atualizada.
 */

export {};
