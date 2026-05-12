import { createHmac } from "crypto";

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function parseExpiresIn(expiresIn: string | number | undefined) {
  if (typeof expiresIn === "number") return expiresIn;
  if (!expiresIn) return 0;

  const match = /^([0-9]+)([smhd])$/.exec(expiresIn);
  if (!match) return 0;

  const value = Number(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  };

  return value * (multipliers[unit] ?? 0);
}

export function signJwt(payload: Record<string, unknown>, secret: string, expiresIn: string | number = "8h") {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const ttl = parseExpiresIn(expiresIn);
  const body = ttl > 0 ? { ...payload, iat: now, exp: now + ttl } : { ...payload, iat: now };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(data).digest("base64url");

  return `${data}.${signature}`;
}
