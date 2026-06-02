import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import path from "path";
import MineraoDbService from "./src/services/MineraoDbService";
import { promisify } from "util";

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function regenerarMineracao() {
  try {
    console.log("🔄 Iniciando regeneração de mineração...\n");

    // Passo 1: Executar script Python
    console.log("📊 Passo 1: Executando script Python de mineração...");
    const caminhoMineracao = path.join(__dirname, "..", "mineracao");

    try {
      const { stdout, stderr } = await execAsync(
        "python regras_associacao.py",
        {
          cwd: caminhoMineracao,
        }
      );

      console.log(stdout);
      if (stderr) console.warn(stderr);
    } catch (error: any) {
      console.error("❌ Erro ao executar Python:", error.message);
      process.exit(1);
    }

    // Passo 2: Carregar regras do CSV para o banco
    console.log("\n💾 Passo 2: Salvando regras no banco de dados...");
    const mineraoDbService = new MineraoDbService(prisma);
    const caminhoCSV = path.join(caminhoMineracao, "regras_associacao.csv");

    try {
      const versao = await mineraoDbService.carregarRegrasDoCSV(caminhoCSV);
      console.log(`✅ Regras salvadas com versão ${versao}\n`);

      // Passo 3: Exibir estatísticas
      console.log("📈 Passo 3: Estatísticas das regras:");
      const stats = await mineraoDbService.obterEstatisticas();
      console.log(`   • Total de regras: ${stats.totalRegras}`);
      console.log(`   • Versão atual: ${stats.versaoAtual}`);
      console.log(`   • Confiança média: ${stats.confiancaMedia}`);
      console.log(`   • Lift médio: ${stats.liftMedio}`);
      console.log(`   • Support médio: ${stats.supportMedio}\n`);

      // Passo 4: Histórico de versões
      console.log("📋 Passo 4: Histórico de versões:");
      const historico = await mineraoDbService.obterHistoricoVersoes();
      historico.forEach((v: any) => {
        console.log(`   • Versão ${v.versao}: ${v._count} regras`);
      });

      console.log("\n✅ Regeneração concluída com sucesso!\n");
    } catch (error: any) {
      console.error("❌ Erro ao salvar no banco:", error.message);
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Erro geral:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
regenerarMineracao();
