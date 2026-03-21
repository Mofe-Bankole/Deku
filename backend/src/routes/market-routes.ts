import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { createMarket, getMarketByIdOrSlug, listMarkets } from "../engines/market-engine";
import type { CreateMarketInput, MarketListQuery } from "../models/models";

export async function registerMarketRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));

  app.get(
    "/markets",
    async (
      request: FastifyRequest<{ Querystring: { status?: string; query?: string; limit?: number; cursor?: string } }>,
      reply: FastifyReply,
    ) => {
      const { status, query, limit, cursor } = request.query;

      const parsed: MarketListQuery = {
        status: status as any,
        query,
        limit: limit ? Number(limit) : undefined,
        cursor,
      };

      const markets = await listMarkets(parsed);
      return reply.send({ markets });
    },
  );

  app.get(
    "/markets/:idOrSlug",
    async (request: FastifyRequest<{ Params: { idOrSlug: string } }>, reply: FastifyReply) => {
      const market = await getMarketByIdOrSlug(request.params.idOrSlug);
      if (!market) {
        return reply.code(404).send({ error: "Market not found" });
      }

      return reply.send({ market });
    },
  );

  app.post(
    "/markets",
    async (request: FastifyRequest<{ Body: Omit<CreateMarketInput, "creatorAddress"> }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "Authentication required" });
      }

      try {
        const market = await createMarket({
          ...request.body,
          creatorAddress: request.user.address,
        });
        return reply.code(201).send({ market });
      } catch (err: any) {
        return reply.code(400).send({ error: err.message ?? "Failed to create market" });
      }
    },
  );
}
