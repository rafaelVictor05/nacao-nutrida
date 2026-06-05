import { ServiceBusClient, ProcessErrorArgs } from "@azure/service-bus";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function startServiceBusConsumer(): Promise<void> {
  const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
  if (!connectionString) {
    console.warn("[ServiceBusConsumer] SERVICEBUS_CONNECTION_STRING ausente — consumer não iniciado.");
    return;
  }

  const client = new ServiceBusClient(connectionString);
  const receiver = client.createReceiver("fila1");

  receiver.subscribe({
    async processMessage(message) {
      console.log("[ServiceBusConsumer] Mensagem recebida:", message.body);
      const evento = message.body as {
        evento: string;
        campanha_id: string;
        usuario_id: string;
        alimentos: { alimento_id: string; quantidade: number }[];
        timestamp: string;
      };
      console.log(
        `[ServiceBusConsumer] Doação na campanha ${evento.campanha_id} ` +
        `por usuário ${evento.usuario_id} em ${evento.timestamp}`
      );
      try {
        await verificarMetaCampanha(evento.campanha_id);
      } catch (err) {
        console.error("[ServiceBusConsumer] Erro ao verificar meta:", err);
      }
    },
    async processError(args: ProcessErrorArgs) {
      console.error("[ServiceBusConsumer] Erro no receiver:", args.error.message);
    },
  });

  console.log("[ServiceBusConsumer] Inscrito na fila 'fila1'.");
}

async function verificarMetaCampanha(campanhaId: string): Promise<void> {
  const itensCampanha = await prisma.alimento_campanha.findMany({
    where: { campanha_id: campanhaId },
  });
  if (itensCampanha.length === 0) return;

  // Prisma + MongoDB não suporta groupBy — agrega manualmente
  const doacoes = await prisma.alimento_doacao.findMany({
    where: { campanha_id: campanhaId },
  });

  const mapaDoado: Record<string, number> = {};
  for (const d of doacoes) {
    mapaDoado[d.alimento_id] = (mapaDoado[d.alimento_id] ?? 0) + d.qt_alimento_doado;
  }

  const metaAtingida = itensCampanha.every(
    (item) => (mapaDoado[item.alimento_id] ?? 0) >= item.qt_alimento_meta
  );

  if (metaAtingida) {
    await prisma.campanha.updateMany({
      where: { id: campanhaId },
      data: { fg_campanha_ativa: false },
    });
    console.log(`[ServiceBusConsumer] Meta atingida — campanha ${campanhaId} desativada automaticamente.`);
  }
}
