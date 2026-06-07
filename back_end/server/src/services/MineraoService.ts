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

export interface ItemFrequente {
  item: string;
  support: number;
}

export default class MineraoService {

  private regras: Regra[] = [];

  private itensFrequentes: ItemFrequente[] = [];

  private caminhoRegras: string;

  private caminhoItensFrequentes: string;

  constructor() {

    this.caminhoRegras = path.join(
      __dirname,
      "../../../..",
      "mineracao/regras_associacao.csv"
    );

    this.caminhoItensFrequentes = path.join(
      __dirname,
      "../../../..",
      "mineracao/itens_frequentes.csv"
    );

    this.carregarRegras();

    this.carregarItensFrequentes();
  }

  /**
   * Carrega regras
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
        });

      })

      .on("end", () => {

        console.log(
          `${this.regras.length} regras carregadas com sucesso.`
        );

      })

      .on("error", (error: any) => {

        console.error(
          "Erro ao carregar regras:",
          error
        );

      });
  }

  /**
   * Carrega itens frequentes
   */
  private carregarItensFrequentes(): void {

    if (!fs.existsSync(this.caminhoItensFrequentes)) {

      console.warn(
        `Arquivo de itens frequentes não encontrado em ${this.caminhoItensFrequentes}`
      );

      return;
    }

    fs.createReadStream(this.caminhoItensFrequentes)

      .pipe(csv())

      .on("data", (row: any) => {

        this.itensFrequentes.push({

          item:
            row.item || "",

          support:
            parseFloat(row.support) || 0,
        });

      })

      .on("end", () => {

        console.log(
          `${this.itensFrequentes.length} itens frequentes carregados com sucesso.`
        );

      })

      .on("error", (error: any) => {

        console.error(
          "Erro ao carregar itens frequentes:",
          error
        );

      });
  }

  /**
   * Obter todas as regras
   */
  async obterTodasAsRegras(): Promise<Regra[]> {

    return this.regras;
  }

  /**
   * Buscar recomendações por alimento
   */
  async obterRecomendacoesPorAlimento(
    alimento: string
  ): Promise<Recomendacao[]> {

    const recomendacoes: Recomendacao[] = [];

    this.regras.forEach((regra) => {

      if (

        regra.antecedents
          .toLowerCase()
          .includes(alimento.toLowerCase())

      ) {

        recomendacoes.push({

          alimentoOrigem:
            regra.antecedents,

          alimentoSugerido:
            regra.consequents,

          confianca:
            regra.confidence,

          lift:
            regra.lift,

          forca:
            this.classificarForca(
              regra.confidence,
              regra.lift
            ),
        });
      }
    });

    return recomendacoes.sort(

      (a, b) =>

        b.confianca - a.confianca ||

        b.lift - a.lift
    );
  }

  /**
   * Buscar recomendações por múltiplos alimentos
   */
  async obterRecomendacoesPorAlimentos(
    alimentos: string[]
  ): Promise<Recomendacao[]> {

    const recomendacoes: Recomendacao[] = [];

    const alimentosConsultados = new Set(

      alimentos.map((a) =>
        a.toLowerCase()
      )
    );

    for (const alimento of alimentos) {

      const recsAlimento =
        await this.obterRecomendacoesPorAlimento(
          alimento
        );

      // Remove sugestões já selecionadas
      const recsFiltradas = recsAlimento.filter(

        (r) =>

          !alimentosConsultados.has(
            r.alimentoSugerido.toLowerCase()
          )
      );

      // =========================
      // POSSUI REGRA
      // =========================

      if (recsFiltradas.length > 0) {

        recomendacoes.push(
          ...recsFiltradas
        );

      } else {

        // =========================
        // FALLBACK
        // ITENS FREQUENTES
        // =========================

        const fallback =

          this.itensFrequentes

            .filter(

              (item) =>

                !alimentosConsultados.has(
                  item.item.toLowerCase()
                )
            )

            .slice(0, 5)

            .map((item) => ({

              alimentoOrigem:
                "Item frequente",

              alimentoSugerido:
                item.item,

              confianca: 0,

              lift: 0,

              forca: "Frequente",
            }));

        recomendacoes.push(
          ...fallback
        );
      }
    }

    // =========================
    // REMOVER DUPLICADOS
    // =========================

    const recsUnicas = Array.from(

      new Map(

        recomendacoes.map((r) => [

          r.alimentoSugerido,
          r

        ])

      ).values()

    );

    return recsUnicas.sort(

      (a, b) =>

        b.confianca - a.confianca ||

        b.lift - a.lift
    );
  }

  /**
   * Classificar força
   */
  private classificarForca(
    confidence: number,
    lift: number
  ): string {

    if (confidence >= 0.8 && lift >= 2)
      return "Muito Forte";

    if (confidence >= 0.6 && lift >= 1.5)
      return "Forte";

    if (confidence >= 0.4 && lift >= 1.2)
      return "Moderada";

    return "Fraca";
  }

  /**
   * Estatísticas
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

      this.regras.reduce(
        (sum, r) => sum + r.confidence,
        0
      ) / this.regras.length;

    const liftMedio =

      this.regras.reduce(
        (sum, r) => sum + r.lift,
        0
      ) / this.regras.length;

    const supportMedio =

      this.regras.reduce(
        (sum, r) => sum + r.support,
        0
      ) / this.regras.length;

    return {

      totalRegras:
        this.regras.length,

      confiancaMedia:
        parseFloat(
          confiancaMedia.toFixed(4)
        ),

      liftMedio:
        parseFloat(
          liftMedio.toFixed(4)
        ),

      supportMedio:
        parseFloat(
          supportMedio.toFixed(4)
        ),
    };
  }

  /**
   * Recarregar regras
   */
  async recarregarRegras(): Promise<void> {

    this.regras = [];

    this.itensFrequentes = [];

    this.carregarRegras();

    this.carregarItensFrequentes();
  }
}