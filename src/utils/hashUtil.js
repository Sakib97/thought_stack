import Hashids from "hashids";

const secret_key = import.meta.env.VITE_HASHID_SECRET;

const hashids = new Hashids(secret_key, 7); 
// 6 = min length of hash 

export function encodeId(id) {
  return hashids.encode(parseInt(id));
}

export function decodeId(hash) {
  const decoded = hashids.decode(hash);
  return decoded.length ? decoded[0] : null;
}