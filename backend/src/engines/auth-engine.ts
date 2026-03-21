import jwt from "jsonwebtoken";
import { redis } from "../db/redis";
import { prisma } from "../db/prisma-db";

const NONCE_TTL_SECONDS = 60 * 5; // 5 minutes
const JWT_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const JWT_SECRET = process.env.JWT_SECRET || "deku-dev-secret-change-me";

export interface AuthUser {
  id: string;
  address: string;
}

export interface AuthTokenPayload {
  sub: string; // user id
  address: string;
}

export async function issueNonce(address: string): Promise<string> {
  const normalized = address.trim();
  if (!normalized) throw new Error("address is required");

  const nonce = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const key = `auth:nonce:${normalized}`;

  await redis.set(key, nonce, "EX", NONCE_TTL_SECONDS);

  return nonce;
}

export async function verifyAndIssueToken(params: {
  address: string;
  message: string;
  signature: string;
}): Promise<{ token: string; user: AuthUser }> {
  const { address } = params;
  const normalized = address.trim();
  if (!normalized) throw new Error("address is required");

  // 1) Check nonce
  const key = `auth:nonce:${normalized}`;
  const nonce = await redis.get(key);
  if (!nonce) {
    throw new Error("Nonce expired or not found. Please request a new sign-in message.");
  }

  // 2) TODO: real Solana signature verification.
  // For the hackathon MVP backend, we trust that the frontend has
  // already used the connected wallet to sign the provided message.
  // A production version should:
  // - parse the message
  // - ensure it contains this nonce and address
  // - verify the ed25519 signature against the address' public key.

  // 3) Upsert user
  const user = await prisma.user.upsert({
    where: { address: normalized },
    create: { address: normalized },
    update: {},
  });

  // 4) Issue JWT
  const payload: AuthTokenPayload = {
    sub: user.id,
    address: user.address,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTL_SECONDS });

  // 5) Clear nonce so it cannot be reused
  await redis.del(key);

  return {
    token,
    user: { id: user.id, address: user.address },
  };
}

export function decodeToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}
