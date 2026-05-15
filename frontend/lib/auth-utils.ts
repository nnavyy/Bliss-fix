import jwt from "jsonwebtoken";

export interface JWTPayload {
  doctorId: string;
  iat: number;
  exp: number;
}

/**
 * Verifies the Authorization Bearer token.
 * Returns the decoded payload, or null if invalid/missing.
 */
export function verifyAuth(authHeader: string | null | undefined): JWTPayload | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("[AUTH] JWT_SECRET is not configured in environment variables");
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
