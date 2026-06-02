import { Router } from "express";
import MineraoService from "../services/MineraoService";
import MineraoController from "../controllers/MineraoController";
import authMiddleware from "../middlewares/authMiddleware";

const mineraoService = new MineraoService();
const mineraoController = new MineraoController(mineraoService);

const mineraoRouter = Router();

/**
 * GET /api/mineracao/regras
 * Retorna todas as regras de associação
 */
mineraoRouter.get(
  "/mineracao/regras",
  authMiddleware,
  mineraoController.obterTodasAsRegras
);

/**
 * GET /api/mineracao/recomendacoes?alimento=Arroz
 * Retorna recomendações para um alimento específico
 */
mineraoRouter.get(
  "/mineracao/recomendacoes",
  authMiddleware,
  mineraoController.obterRecomendacoes
);

/**
 * POST /api/mineracao/recomendacoes
 * Retorna recomendações para múltiplos alimentos
 * Body: { alimentos: ["Arroz", "Feijão"] }
 */
mineraoRouter.post(
  "/mineracao/recomendacoes",
  authMiddleware,
  mineraoController.obterRecomendacoesMultiplas
);

/**
 * GET /api/mineracao/estatisticas
 * Retorna estatísticas das regras de mineração
 */
mineraoRouter.get(
  "/mineracao/estatisticas",
  authMiddleware,
  mineraoController.obterEstatisticas
);

/**
 * POST /api/mineracao/recarregar
 * Recarrega as regras do arquivo CSV
 */
mineraoRouter.post(
  "/mineracao/recarregar",
  authMiddleware,
  mineraoController.recarregarRegras
);

export default mineraoRouter;
