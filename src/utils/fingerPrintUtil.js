import { getFingerprint as getThumbmarkFingerprint } from "@thumbmarkjs/thumbmarkjs";

let cachedFingerprint = null;

export async function getFingerprint() {
  if (cachedFingerprint) return cachedFingerprint;

  cachedFingerprint = await getThumbmarkFingerprint();
  return cachedFingerprint;
}