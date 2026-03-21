import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerMarketRoutes } from "./src/routes/market-routes";
import { registerAuthRoutes } from "./src/routes/auth-routes";
import { authPlugin } from "./src/plugins/auth";

const PORT = Number(process.env.PORT ?? 4000);

async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(authPlugin);

  await registerAuthRoutes(app);
  await registerMarketRoutes(app);

  return app;
}

buildServer()
  .then((app) => {
    app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
      app.log.info({ address }, "Deku backend listening");
    });
  })
  .catch((err) => {
    console.error("Failed to start Fastify server", err);
    process.exit(1);
  });
