import "server-only";

const ALGORITHM = "AES-GCM" as const;
const IV_LENGTH = 12; // 96 bits

function getKeyBuffer(): Uint8Array {
  const key = process.env.QUICKBOOKS_TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("QUICKBOOKS_TOKEN_ENCRYPTION_KEY is not set");
  }
  return new Uint8Array(Buffer.from(key, "utf-8"));
}

async function getCryptoKey(): Promise<CryptoKey> {
  const rawKey = getKeyBuffer();
  const hash = await crypto.subtle.digest("SHA-256", rawKey as BufferSource);
  const keyBytes = new Uint8Array(hash);
  return crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    ALGORITHM,
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv as BufferSource },
    key,
    encoded as BufferSource,
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return Buffer.from(combined).toString("base64");
}

export async function decrypt(combined: string): Promise<string> {
  const key = await getCryptoKey();
  const data = Buffer.from(combined, "base64");

  const iv = data.subarray(0, IV_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv as BufferSource },
    key,
    ciphertext as BufferSource,
  );

  return new TextDecoder().decode(decrypted);
}
