import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

export default class MineraoDbService {

  private prisma: PrismaClient;

  private itensFrequentes:
    { item: string; support: number }[] = [];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * =========================
   * CARREGAR ITENS FREQUENTES
   * =========================
   */

  private async carregarItensFrequentesCSV():
    Promise<void> {

    if (this.itensFrequentes.length > 0) {
      return;
    }

    const caminhoCSV = path.join(
      __dirname,
      "../../../..",
      "mineracao",
      "itens_frequentes.csv"
    );

    if (!fs.existsSync(caminhoCSV)) {
      return;
    }

    return new Promise((resolve, reject) => {

      const itens:
        { item: string; support: number }[] = [];

      fs.createReadStream(caminhoCSV)

        .pipe(csv())

        .on("data", (row: any) => {

          if (row.item) {

            itens.push({

              item:
                row.item,

              support:
                parseFloat(row.support) || 0,
            });
          }
        })

        .on("end", () => {

          this.itensFrequentes = itens.sort(
            (a, b) => b.support - a.support
          );

          resolve();
        })

        .on("error", (error: any) => {
          reject(error);
        });
    });
  }

  /**
   * =========================
   * NORMALIZAR TEXTO
   * =========================
   */

  private normalizarTexto(text: string): string {

    return text

      .normalize("NFD")

      .replace(/[\u0300-\u036f]/g, "")

      .toLowerCase();
  }

  /**
   * =========================
   * VERSÃO MAIS RECENTE
   * =========================
   */

  async obterVersaoMaisRecente():
    Promise<number> {

    const ultimaRegra =
      await this.prisma.mineracao_regra.findFirst({

        orderBy: {
          versao: "desc"
        },

        select: {
          versao: true
        },
      });

    return ultimaRegra?.versao || 0;
  }

  /**
   * =========================
   * IMPORTAR CSV
   * =========================
   */

  async carregarRegrasDoCSV(
    caminhoCSV: string
  ): Promise<number> {

    if (!fs.existsSync(caminhoCSV)) {

      throw new Error(
        `Arquivo não encontrado: ${caminhoCSV}`
      );
    }

    const versao =
      (await this.obterVersaoMaisRecente()) + 1;

    const regras: any[] = [];

    return new Promise((resolve, reject) => {

      fs.createReadStream(caminhoCSV)

        .pipe(csv())

        .on("data", (row: any) => {

          regras.push({

            versao,

            antecedents:
              row.antecedents || "",

            consequents:
              row.consequents || "",

            support:
              parseFloat(row.support) || 0,

            confidence:
              parseFloat(row.confidence) || 0,

            lift:
              parseFloat(row.lift) || 0,

            ativo:
              true,
          });
        })

        .on("end", async () => {

          try {

            // Desativar regras antigas

            await this.prisma.mineracao_regra.updateMany({

              where: {
                versao: versao - 1
              },

              data: {
                ativo: false
              },
            });

            // Inserir novas regras

            await this.prisma.mineracao_regra.createMany({

              data: regras,
            });

            console.log(
              `✓ ${regras.length} regras `
              + `da versão ${versao} `
              + `inseridas no banco`
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
   * =========================
   * REGRAS ATIVAS
   * =========================
   */

  async obterRegrasAtivas():
    Promise<any[]> {

    return this.prisma.mineracao_regra.findMany({

      where: {
        ativo: true
      },

      orderBy: {
        lift: "desc"
      },
    });
  }

  /**
   * =========================
   * RECOMENDAÇÃO POR ALIMENTO
   * =========================
   */

  async obterRecomendacoesPorAlimento(
    alimento: string
  ): Promise<any[]> {
    

    const regrasAtivas =
      await this.prisma.mineracao_regra.findMany({

        where: {
          ativo: true
        },

        orderBy: [
          { confidence: "desc" },
          { lift: "desc" }
        ],
      });

    const termoNormalizado =
      this.normalizarTexto(alimento);

    const regras = regrasAtivas.filter((regra) =>

      this.normalizarTexto(
        regra.antecedents
      ).includes(termoNormalizado)
    );

    /**
     * =========================
     * EXISTE REGRA
     * =========================
     */

    if (regras.length > 0) {

      const recomendacoes = regras.map((r) => ({

        alimentoOrigem:
          r.antecedents,

        alimentoSugerido:
          r.consequents,

        confianca:
          r.confidence,

        lift:
          r.lift,

        forca:
          this.classificarForca(
            r.confidence,
            r.lift
          ),
      }));

      // Remove duplicados

      const unicas = Array.from(

        new Map(

          recomendacoes.map((r) => [

            r.alimentoSugerido,
            r

          ])
        ).values()
      );

      return unicas;
    }

    /**
     * =========================
     * FALLBACK:
     * ITENS FREQUENTES
     * =========================
     */

    await this.carregarItensFrequentesCSV();

    return this.itensFrequentes

      .filter(

        (item) =>

          this.normalizarTexto(item.item) !==
          this.normalizarTexto(alimento)
      )

      .slice(0, 5)

      .map((item) => ({

        alimentoOrigem:
          "Item frequente",

        alimentoSugerido:
          item.item,

        confianca:
          0,

        lift:
          0,

        forca:
          "Frequente",
      }));
  }

  /**
   * =========================
   * META DA CAMPANHA
   * =========================
   */

  async obterItensMetaDaCampanha(
    campanhaId: string
  ): Promise<string[]> {

    const metaItens =
      await this.prisma.alimento_campanha.findMany({

        where: {
          campanha_id: campanhaId
        },

        select: {
          alimento_id: true
        },
      });

    if (metaItens.length === 0) {
      return [];
    }

    const alimentoIds =
      metaItens.map(
        (item) => item.alimento_id
      );

    const alimentos =
      await this.prisma.alimento.findMany({

        where: {
          id: {
            in: alimentoIds
          }
        },

        select: {
          nm_alimento: true
        },
      });

    return alimentos.map(
      (item) => item.nm_alimento
    );
  }

  /**
   * =========================
   * ITENS FREQUENTES DISPONÍVEIS
   * =========================
   */

  private obterItensFrequentesDisponiveis(
    alimentosConsultadosSet: Set<string>,
    limite = 5
  ): any[] {

    return this.itensFrequentes

      .filter(

        (item) =>

          !alimentosConsultadosSet.has(
            item.item.toLowerCase()
          )
      )

      .slice(0, limite)

      .map((item) => ({

        alimentoOrigem:
          "Item frequente",

        alimentoSugerido:
          item.item,

        confianca:
          0,

        lift:
          0,

        forca:
          "Frequente",
      }));
  }

  /**
   * =========================
   * RECOMENDAÇÃO POR LISTA
   * =========================
   */

  async obterRecomendacoesPorAlimentos(
    alimentos: string[],
    campanhaId?: string
  ): Promise<any[]> {

    const recomendacoes: any[] = [];

    await this.carregarItensFrequentesCSV();

    const alimentosConsultadosSet =
      new Set(

        alimentos.map(
            (item) =>
              this.normalizarTexto(item)
        )
      );

    for (const alimento of alimentos) {

      const recs =
        await this.obterRecomendacoesPorAlimento(
          alimento
        );

      const recsFiltradas = recs.filter((rec) => {

        const sugestao =
          this.normalizarTexto(
            String(rec.alimentoSugerido || "")
        );

        return !alimentosConsultadosSet.has(
          sugestao
        );
      });

      if (recsFiltradas.length > 0) {

        recomendacoes.push(
          ...recsFiltradas
        );

        continue;
      }

      // Fallback

      recomendacoes.push(

        ...this.obterItensFrequentesDisponiveis(

          alimentosConsultadosSet,

          5
        )
      );
    }

    // Remove duplicados

    const recsUnicas = Array.from(

      new Map(

        recomendacoes.map((r) => [

          r.alimentoSugerido,
          r

        ])
      ).values()
    );

    if (recsUnicas.length === 0) {
      return this.obterItensFrequentesDisponiveis(
        alimentosConsultadosSet,
        5
      );
    }

    return recsUnicas.sort(

      (a, b) => b.confianca - a.confianca
    );
  }

  /**
   * =========================
   * ESTATÍSTICAS
   * =========================
   */

  async obterEstatisticas():
    Promise<any> {

    const regras =
      await this.obterRegrasAtivas();

    if (regras.length === 0) {

      return {

        totalRegras: 0,

        confiancaMedia: 0,

        liftMedio: 0,

        supportMedio: 0,

        versaoAtual: 0,
      };
    }

    const versaoAtual =
      Math.max(
        ...regras.map((r) => r.versao)
      );

    return {

      totalRegras:
        regras.length,

      confiancaMedia:
        parseFloat(

          (
            regras.reduce(

              (sum, r) =>
                sum + r.confidence,

              0
            ) / regras.length

          ).toFixed(4)
        ),

      liftMedio:
        parseFloat(

          (
            regras.reduce(

              (sum, r) =>
                sum + r.lift,

              0
            ) / regras.length

          ).toFixed(4)
        ),

      supportMedio:
        parseFloat(

          (
            regras.reduce(

              (sum, r) =>
                sum + r.support,

              0
            ) / regras.length

          ).toFixed(4)
        ),

      versaoAtual,
    };
  }

  /**
   * =========================
   * CLASSIFICAR FORÇA
   * =========================
   */

  private classificarForca(
    confidence: number,
    lift: number
  ): string {

    if (
      confidence >= 0.8 &&
      lift >= 2
    ) {
      return "Muito Forte";
    }

    if (
      confidence >= 0.6 &&
      lift >= 1.5
    ) {
      return "Forte";
    }

    if (
      confidence >= 0.4 &&
      lift >= 1.2
    ) {
      return "Moderada";
    }

    return "Fraca";
  }

  /**
   * =========================
   * HISTÓRICO DE VERSÕES
   * =========================
   */

  async obterHistoricoVersoes():
    Promise<any[]> {

    const versoes =
      await this.prisma.mineracao_regra.groupBy({

        by: ["versao"],

        _count: true,

        orderBy: {
          versao: "desc"
        },
      });

    return versoes;
  }
}