import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { decodeToken } from "../engines/auth-engine";

export interface AuthenticatedUser {
  id: string;
  address: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export const authPlugin = fp(async function authPlugin(app: FastifyInstance) {
  app.decorateRequest("user", undefined);

  app.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = request.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) return;

    const token = auth.slice("Bearer ".length).trim();
    if (!token) return;

    const payload = decodeToken(token);
    if (!payload) return;

    request.user = { id: payload.sub, address: payload.address };
  });
});
