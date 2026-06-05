import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";

let sender: ServiceBusSender | null = null;

function getSender(queueName: string): ServiceBusSender {
  if (sender) return sender;
  const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("[ServiceBus] SERVICEBUS_CONNECTION_STRING não definida no .env");
  }
  const client = new ServiceBusClient(connectionString);
  sender = client.createSender(queueName);
  return sender;
}

export async function sendMessage(queueName: string, payload: object): Promise<void> {
  const sbSender = getSender(queueName);
  await sbSender.sendMessages({ body: payload, contentType: "application/json" });
  console.log(`[ServiceBus] Mensagem enviada para "${queueName}":`, JSON.stringify(payload));
}
