import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

export default class MineraoDbService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Obter a versão mais recente das regras
   */
  async obterVersaoMaisRecente(): Promise<number> {
    const ultimaRegra = await this.prisma.mineracao_regra.findFirst({
      orderBy: { versao: "desc" },
      select: { versao: true },
    });

    return ultimaRegra?.versao || 0;
  }

  /**
   * Carregar regras do arquivo CSV e salvar no banco com versão
   */
  async carregarRegrasDoCSV(caminhoCSV: string): Promise<number> {
    if (!fs.existsSync(caminhoCSV)) {
      throw new Error(`Arquivo não encontrado: ${caminhoCSV}`);
    }

    const versao = (await this.obterVersaoMaisRecente()) + 1;
    const regras: any[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(caminhoCSV)
        .pipe(csv())
        .on("data", (row: any) => {
          regras.push({
            versao,
            antecedents: row.antecedents || "",
            consequents: row.consequents || "",
            support: parseFloat(row.support) || 0,
            confidence: parseFloat(row.confidence) || 0,
            lift: parseFloat(row.lift) || 0,
            ativo: true,
          });
        })
        .on("end", async () => {
          try {
            // CORRIGIDO: Passando where e data no mesmo objeto
            await this.prisma.mineracao_regra.updateMany({
              where: { versao: versao - 1 },
              data: { ativo: false },
            });

            // Inserir novas regras
            await this.prisma.mineracao_regra.createMany({
              data: regras,
            });

            console.log(
              `✓ ${regras.length} regras da versão ${versao} inseridas no banco`
            );
            resolve(versao);
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error: any) => {
          reject(error);
        });
    });
  }

  /**
   * Obter todas as regras ativas
   */
  async obterRegrasAtivas(): Promise<any[]> {
    return this.prisma.mineracao_regra.findMany({
      where: { ativo: true },
      orderBy: { lift: "desc" },
    });
  }

  /**
   * Obter recomendações por alimento (do banco)
   */
  async obterRecomendacoesPorAlimento(
    alimento: string
  ): Promise<any[]> {
    const regras = await this.prisma.mineracao_regra.findMany({
      where: {
        ativo: true,
        antecedents: {
          contains: alimento,
          mode: "insensitive",
        },
      },
      orderBy: [{ confidence: "desc" }, { lift: "desc" }],
    });

    return regras.map((r) => ({
      alimentoOrigem: r.antecedents,
      alimentoSugerido: r.consequents,
      confianca: r.confidence,
      lift: r.lift,
      forca: this.classificarForca(r.confidence, r.lift),
    }));
  }

  async obterItensMetaDaCampanha(campanhaId: string): Promise<string[]> {
    const metaItens = await this.prisma.alimento_campanha.findMany({
      where: { campanha_id: campanhaId },
      select: { alimento_id: true },
    });

    if (metaItens.length === 0) {
      return [];
    }

    const alimentoIds = metaItens.map((item) => item.alimento_id);

    const alimentos = await this.prisma.alimento.findMany({
      where: { id: { in: alimentoIds } },
      select: { nm_alimento: true },
    });

    return alimentos.map((item) => item.nm_alimento);
  }

  /**
   * Obter recomendações por múltiplos alimentos
   */
  async obterRecomendacoesPorAlimentos(
    alimentos: string[],
    campanhaId?: string
  ): Promise<any[]> {
    const recomendacoes: any[] = [];

    const itensPermitidos = campanhaId
      ? await this.obterItensMetaDaCampanha(campanhaId)
      : [];

    const permitidosSet = new Set(
      itensPermitidos.map((item) => item.toLowerCase())
    );
    const alimentosConsultadosSet = new Set(
      alimentos.map((item) => item.toLowerCase())
    );

    for (const alimento of alimentos) {
      const recs = await this.obterRecomendacoesPorAlimento(alimento);
      recomendacoes.push(...recs);
    }

    // Filtrar itens de recomendação para a meta da campanha
    const recomendacoesFiltradas = recomendacoes.filter((rec) => {
      const sugestao = String(rec.alimentoSugerido || "").toLowerCase();

      if (alimentosConsultadosSet.has(sugestao)) {
        return false;
      }

      if (campanhaId && permitidosSet.size > 0) {
        return permitidosSet.has(sugestao);
      }

      return true;
    });

    const recsUnicas = Array.from(
      new Map(recomendacoesFiltradas.map((r) => [r.alimentoSugerido, r])).values()
    );

    return recsUnicas.sort((a, b) => b.confianca - a.confianca);
  }

  /**
   * Obter estatísticas das regras ativas
   */
  async obterEstatisticas(): Promise<any> {
    const regras = await this.obterRegrasAtivas();

    if (regras.length === 0) {
      return {
        totalRegras: 0,
        confiancaMedia: 0,
        liftMedio: 0,
        supportMedio: 0,
        versaoAtual: 0,
      };
    }

    const versaoAtual = Math.max(...regras.map((r) => r.versao));

    return {
      totalRegras: regras.length,
      confiancaMedia: parseFloat(
        (
          regras.reduce((sum, r) => sum + r.confidence, 0) / regras.length
        ).toFixed(4)
      ),
      liftMedio: parseFloat(
        (regras.reduce((sum, r) => sum + r.lift, 0) / regras.length).toFixed(4)
      ),
      supportMedio: parseFloat(
        (regras.reduce((sum, r) => sum + r.support, 0) / regras.length).toFixed(
          4
        )
      ),
      versaoAtual,
    };
  }

  /**
   * Classificar força da regra
   */
  private classificarForca(confidence: number, lift: number): string {
    if (confidence >= 0.8 && lift >= 2) return "Muito Forte";
    if (confidence >= 0.6 && lift >= 1.5) return "Forte";
    if (confidence >= 0.4 && lift >= 1.2) return "Moderada";
    return "Fraca";
  }

  /**
   * Obter histórico de versões
   */
  async obterHistoricoVersoes(): Promise<any[]> {
    const versoes = await this.prisma.mineracao_regra.groupBy({
      by: ["versao"],
      _count: true,
      orderBy: { versao: "desc" },
    });

    return versoes;
  }
}