import * as crypto from "crypto";

/**
 * Generates an HMAC SHA256 signature for a given payload.
 * @param payload - The data to sign (string or object)
 * @returns The generated hex signature
 */
export function generateSignature(payload: string | object): string {
  const secret = process.env.MEEZAN_SECRET_KEY!;
  if (!secret) {
    throw new Error("Missing MEEZAN_SECRET_KEY environment variable");
  }

  const data = typeof payload === "string" ? payload : JSON.stringify(payload);

  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Verifies that a provided signature matches the expected HMAC signature.
 * @param payload - The data to verify (string or object)
 * @param receivedSignature - The signature received from the request
 * @returns true if signatures match, false otherwise
 */
export function verifySignature(
  payload: string | object,
  receivedSignature: string
): boolean {
  const expectedSignature = generateSignature(payload);

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(receivedSignature, "hex")
  );
}
