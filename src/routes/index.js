import { Router } from 'express';
import { EntregasPrismaRepository } from '../repositories/EntregasRepository.prisma.js';
import { MotoristasPrismaRepository } from '../repositories/MotoristasRepository.prisma.js';
import { EntregasService } from '../services/EntregasService.js';
import { MotoristasService } from '../services/MotoristasService.js';
import { EntregasController } from '../controllers/EntregasController.js';
import { MotoristasController } from '../controllers/MotoristasController.js';

export function criarRotas() {
  // Composition root: único ponto de injeção de dependências.
  // Persistência com Prisma (SQLite). Para voltar à memória, troque estas duas linhas por
  // new EntregasRepository(database) / new MotoristasRepository(database), com database = new Database().
  const entregasRepo = new EntregasPrismaRepository();
  const motoristasRepo = new MotoristasPrismaRepository();
  const entregasService = new EntregasService(entregasRepo, motoristasRepo);
  const motoristasService = new MotoristasService(motoristasRepo, entregasRepo);
  const entregasController = new EntregasController(entregasService);
  const motoristasController = new MotoristasController(motoristasService);

  const router = Router();

  router.post('/entregas', entregasController.criar);
  router.get('/entregas', entregasController.listar);
  router.get('/entregas/:id', entregasController.buscarPorId);
  router.get('/entregas/:id/historico', entregasController.historico);
  router.patch('/entregas/:id/avancar', entregasController.avancar);
  router.patch('/entregas/:id/cancelar', entregasController.cancelar);
  router.patch('/entregas/:id/atribuir', entregasController.atribuir);

  router.post('/motoristas', motoristasController.criar);
  router.get('/motoristas', motoristasController.listar);
  router.get('/motoristas/:id', motoristasController.buscarPorId);
  router.get('/motoristas/:id/entregas', motoristasController.listarEntregas);

  return router;
}
