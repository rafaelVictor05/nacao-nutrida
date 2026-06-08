import express from "express";
import dotenv from "dotenv";
import { startServiceBusConsumer } from "./src/services/ServiceBusConsumer";
import usuarioRouter from "./src/routes/usuario.routes";
import alimentoRouter from "./src/routes/alimento.routes";
import campanhaRouter from "./src/routes/campanhas.routes";
import doacaoRouter from "./src/routes/doacao.routes";
import localidadeRouter from "./config/routes/localidade.router";
import mineraoRouter from "./src/routes/mineracao.routes";
import cors from "cors";
import chatRouter from "./src/routes/chat.routes";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

dotenv.config({ path: "../.env" });

const app = express();
app.use(cors());

// Express routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", usuarioRouter);
app.use("/api", alimentoRouter);
app.use("/api", campanhaRouter);
app.use("/api", doacaoRouter);
app.use("/api", localidadeRouter);
app.use("/api", mineraoRouter);
app.use("/api", chatRouter);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  startServiceBusConsumer();
});