import { Router } from 'express';
import { Database } from '../database/Database.js';
import { EntregasRepository } from '../repositories/EntregasRepository.js';
import { EntregasService } from '../services/EntregasService.js';
import { EntregasController } from '../controllers/EntregasController.js';

export function criarRotas() {
  // Composition root: único ponto de injeção de dependências.
  const database = new Database();
  const repository = new EntregasRepository(database);
  const service = new EntregasService(repository);
  const controller = new EntregasController(service);

  const router = Router();

  router.post('/entregas', controller.criar);
  router.get('/entregas', controller.listar);
  router.get('/entregas/:id', controller.buscarPorId);
  router.get('/entregas/:id/historico', controller.historico);
  router.patch('/entregas/:id/avancar', controller.avancar);
  router.patch('/entregas/:id/cancelar', controller.cancelar);

  return router;
}
