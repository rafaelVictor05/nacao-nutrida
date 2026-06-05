import fs from "fs";
import path from "path";
import csv from "csv-parser";

export interface Regra {
  antecedents: string;
  consequents: string;
  support: number;
  confidence: number;
  lift: number;
}

export interface Recomendacao {
  alimentoOrigem: string;
  alimentoSugerido: string;
  confianca: number;
  lift: number;
  forca: string;
}

export default class MineraoService {
  private regras: Regra[] = [];
  private caminhoRegras: string;

  constructor() {
    this.caminhoRegras = path.join(
      __dirname,
      "../../../..",
      "mineracao/regras_associacao.csv"
    );
    this.carregarRegras();
  }

  /**
   * Carrega as regras do arquivo CSV na memória
   */
  private carregarRegras(): void {
    if (!fs.existsSync(this.caminhoRegras)) {
      console.warn(
        `Arquivo de regras não encontrado em ${this.caminhoRegras}`
      );
      return;
    }

    fs.createReadStream(this.caminhoRegras)
      .pipe(csv())
      .on("data", (row: any) => {
        this.regras.push({
          antecedents: row.antecedents || "",
          consequents: row.consequents || "",
          support: parseFloat(row.support) || 0,
          confidence: parseFloat(row.confidence) || 0,
          lift: parseFloat(row.lift) || 0,
        });
      })
      .on("end", () => {
        console.log(`${this.regras.length} regras carregadas com sucesso.`);
      })
      .on("error", (error: any) => {
        console.error("Erro ao carregar regras:", error);
      });
  }

  /**
   * Retorna todas as regras carregadas
   */
  async obterTodasAsRegras(): Promise<Regra[]> {
    return this.regras;
  }

  /**
   * Busca recomendações baseadas em um alimento
   * @param alimento Nome do alimento
   * @returns Array de recomendações
   */
  async obterRecomendacoesPorAlimento(
    alimento: string
  ): Promise<Recomendacao[]> {
    const recomendacoes: Recomendacao[] = [];

    this.regras.forEach((regra) => {
      if (
        regra.antecedents.toLowerCase().includes(alimento.toLowerCase())
      ) {
        recomendacoes.push({
          alimentoOrigem: regra.antecedents,
          alimentoSugerido: regra.consequents,
          confianca: regra.confidence,
          lift: regra.lift,
          forca: this.classificarForca(regra.confidence, regra.lift),
        });
      }
    });

    // Ordenar por confiança e lift (maior primeiro)
    return recomendacoes.sort(
      (a, b) => b.confianca - a.confianca || b.lift - a.lift
    );
  }

  /**
   * Busca recomendações baseadas em múltiplos alimentos
   * @param alimentos Array de alimentos
   * @returns Array de recomendações filtradas
   */
  async obterRecomendacoesPorAlimentos(
    alimentos: string[]
  ): Promise<Recomendacao[]> {
    const recomendacoes: Recomendacao[] = [];

    for (const alimento of alimentos) {
      const recsAlimento =
        await this.obterRecomendacoesPorAlimento(alimento);
      recomendacoes.push(...recsAlimento);
    }

    // Remover duplicatas e ordenar
    const recsUnicas = Array.from(
      new Map(
        recomendacoes.map((r) => [
          r.alimentoSugerido,
          r,
        ])
      ).values()
    );

    return recsUnicas.sort(
      (a, b) => b.confianca - a.confianca || b.lift - a.lift
    );
  }

  /**
   * Classifica a força da regra
   */
  private classificarForca(confidence: number, lift: number): string {
    if (confidence >= 0.8 && lift >= 2) return "Muito Forte";
    if (confidence >= 0.6 && lift >= 1.5) return "Forte";
    if (confidence >= 0.4 && lift >= 1.2) return "Moderada";
    return "Fraca";
  }

  /**
   * Retorna estatísticas das regras
   */
  async obterEstatisticas(): Promise<any> {
    if (this.regras.length === 0) {
      return {
        totalRegras: 0,
        confiancaMedia: 0,
        liftMedio: 0,
        supportMedio: 0,
      };
    }

    const confiancaMedia =
      this.regras.reduce((sum, r) => sum + r.confidence, 0) /
      this.regras.length;
    const liftMedio =
      this.regras.reduce((sum, r) => sum + r.lift, 0) / this.regras.length;
    const supportMedio =
      this.regras.reduce((sum, r) => sum + r.support, 0) / this.regras.length;

    return {
      totalRegras: this.regras.length,
      confiancaMedia: parseFloat(confiancaMedia.toFixed(4)),
      liftMedio: parseFloat(liftMedio.toFixed(4)),
      supportMedio: parseFloat(supportMedio.toFixed(4)),
    };
  }

  /**
   * Recarrega as regras do arquivo (útil para atualizar dados)
   */
  async recarregarRegras(): Promise<void> {
    this.regras = [];
    this.carregarRegras();
  }
}
