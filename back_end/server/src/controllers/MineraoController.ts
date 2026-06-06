import { Request, Response } from "express";
import path from "path";
import MineraoService from "../services/MineraoService";
import MineraoDbService from "../services/MineraoDbService";
import { PrismaClient } from "@prisma/client";

export default class MineraoController {
  private mineraoService: MineraoService;
  private mineraoDbService: MineraoDbService;

  constructor(mineraoService: MineraoService, prisma: PrismaClient) {
    this.mineraoService = mineraoService;
    this.mineraoDbService = new MineraoDbService(prisma);
    this.obterTodasAsRegras = this.obterTodasAsRegras.bind(this);
    this.obterRecomendacoes = this.obterRecomendacoes.bind(this);
    this.obterRecomendacoesMultiplas = this.obterRecomendacoesMultiplas.bind(this);
    this.obterEstatisticas = this.obterEstatisticas.bind(this);
    this.recarregarRegras = this.recarregarRegras.bind(this);
    this.obterHistoricoVersoes = this.obterHistoricoVersoes.bind(this);
  }

  /**
   * GET /mineracao/regras
   * Retorna todas as regras de associação (do banco de dados)
   */
  async obterTodasAsRegras(req: Request, res: Response): Promise<Response> {
    try {
      const regras = await this.mineraoDbService.obterRegrasAtivas();

      if (regras.length === 0) {
        return res.status(200).json({
          message: "Nenhuma regra encontrada",
          regras: [],
        });
      }

      return res.status(200).json({
        total: regras.length,
        regras,
      });
    } catch (error: any) {
      console.error("Erro ao buscar regras:", error);
      return res.status(500).json({
        message: "Erro ao buscar regras de mineração",
        error: error.message,
      });
    }
  }

  /**
   * GET /mineracao/recomendacoes?alimento=Arroz
   * Retorna recomendações baseadas em um alimento (do banco)
   */
  async obterRecomendacoes(req: Request, res: Response): Promise<Response> {
    try {
      const { alimento } = req.query;

      if (!alimento || typeof alimento !== "string") {
        return res.status(400).json({
          message: "Parâmetro 'alimento' é obrigatório",
        });
      }

      const recomendacoes =
        await this.mineraoDbService.obterRecomendacoesPorAlimento(alimento);

      if (recomendacoes.length === 0) {
        return res.status(200).json({
          message: `Nenhuma recomendação encontrada para ${alimento}`,
          alimento,
          recomendacoes: [],
        });
      }

      return res.status(200).json({
        alimento,
        total: recomendacoes.length,
        recomendacoes,
      });
    } catch (error: any) {
      console.error("Erro ao buscar recomendações:", error);
      return res.status(500).json({
        message: "Erro ao buscar recomendações",
        error: error.message,
      });
    }
  }

  /**
   * POST /mineracao/recomendacoes
   * Retorna recomendações baseadas em múltiplos alimentos (do banco)
   * Body: { alimentos: ["Arroz", "Feijão"] }
   */
  async obterRecomendacoesMultiplas(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { alimentos } = req.body;

      if (!alimentos || !Array.isArray(alimentos) || alimentos.length === 0) {
        return res.status(400).json({
          message: "Body deve conter um array 'alimentos' não vazio",
        });
      }

      const recomendacoes =
        await this.mineraoDbService.obterRecomendacoesPorAlimentos(alimentos);

      if (recomendacoes.length === 0) {
        return res.status(200).json({
          message: "Nenhuma recomendação encontrada",
          alimentosConsultados: alimentos,
          recomendacoes: [],
        });
      }

      return res.status(200).json({
        alimentosConsultados: alimentos,
        total: recomendacoes.length,
        recomendacoes,
      });
    } catch (error: any) {
      console.error("Erro ao buscar recomendações múltiplas:", error);
      return res.status(500).json({
        message: "Erro ao buscar recomendações múltiplas",
        error: error.message,
      });
    }
  }

  /**
   * GET /mineracao/estatisticas
   * Retorna estatísticas das regras (do banco)
   */
  async obterEstatisticas(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await this.mineraoDbService.obterEstatisticas();

      return res.status(200).json({
        message: "Estatísticas das regras de mineração",
        estatisticas: stats,
      });
    } catch (error: any) {
      console.error("Erro ao buscar estatísticas:", error);
      return res.status(500).json({
        message: "Erro ao buscar estatísticas",
        error: error.message,
      });
    }
  }

  /**
   * POST /mineracao/recarregar
   * Recarrega as regras do arquivo CSV (útil após regenerar mineração)
   */
  async recarregarRegras(req: Request, res: Response): Promise<Response> {
    try {
      const caminhoCSV = path.join(
        __dirname,
        "../../../..",
        "mineracao",
        "regras_associacao.csv"
      );
      const versao = await this.mineraoDbService.carregarRegrasDoCSV(caminhoCSV);

      return res.status(200).json({
        message: `Regras recarregadas com sucesso — versão ${versao}`,
        versao,
      });
    } catch (error: any) {
      console.error("Erro ao recarregar regras:", error);
      return res.status(500).json({
        message: "Erro ao recarregar regras",
        error: error.message,
      });
    }
  }

  /**
   * GET /mineracao/historico
   * Retorna histórico de versões geradas
   */
  async obterHistoricoVersoes(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const historico = await this.mineraoDbService.obterHistoricoVersoes();

      return res.status(200).json({
        message: "Histórico de versões de mineração",
        historico,
      });
    } catch (error: any) {
      console.error("Erro ao buscar histórico:", error);
      return res.status(500).json({
        message: "Erro ao buscar histórico de versões",
        error: error.message,
      });
    }
  }
} 