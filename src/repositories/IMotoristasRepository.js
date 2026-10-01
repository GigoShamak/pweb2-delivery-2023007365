// Contrato do repository de motoristas. Os services dependem só deste contrato,
// nunca da implementação concreta (MotoristasRepository).

/**
 * @typedef {Object} Motorista
 * @property {number} id Gerado pelo repository.
 * @property {string} nome
 * @property {string} cpf Único entre os motoristas.
 * @property {string | null} placaVeiculo Opcional; null quando não informada.
 * @property {'ATIVO' | 'INATIVO'} status
 */

/**
 * @typedef {Object} IMotoristasRepository
 * @property {() => Motorista[]} listarTodos
 *   Lista todos os motoristas.
 * @property {(id: number) => Motorista | null} buscarPorId
 *   Busca um motorista pelo id; null se não existir.
 * @property {(cpf: string) => Motorista | null} buscarPorCpf
 *   Busca um motorista pelo CPF; null se não existir.
 * @property {(dados: Omit<Motorista, 'id'>) => Motorista} criar
 *   Persiste um novo motorista e o devolve com o id gerado.
 */

export {};
