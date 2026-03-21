import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { issueNonce, verifyAndIssueToken } from "../engines/auth-engine";

export async function registerAuthRoutes(app: FastifyInstance) {
  // Request a short‑lived nonce to sign with a wallet.
  app.get(
    "/auth/nonce",
    async (request: FastifyRequest<{ Querystring: { address?: string } }>, reply: FastifyReply) => {
      const address = request.query.address?.trim();
      if (!address) {
        return reply.code(400).send({ error: "address is required" });
      }

      const nonce = await issueNonce(address);
      return reply.send({ nonce });
    },
  );

  // Verify a signed message and issue a JWT token.
  app.post(
    "/auth/verify",
    async (
      request: FastifyRequest<{ Body: { address?: string; message?: string; signature?: string } }>,
      reply: FastifyReply,
    ) => {
      const { address, message, signature } = request.body;

      if (!address || !message || !signature) {
        return reply.code(400).send({ error: "address, message and signature are required" });
      }

      try {
        const { token, user } = await verifyAndIssueToken({ address, message, signature });
        return reply.send({ token, user });
      } catch (err: any) {
        return reply.code(400).send({ error: err?.message ?? "Unable to verify signature" });
      }
    },
  );
}
