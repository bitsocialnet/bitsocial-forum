// bitsocial-react-hooks addresses a community by `{ name }` (a domain such as `forum.bitsocial.bso`) or
// `{ publicKey }` (an IPNS key). Section data and routes carry a single address string.
export type CommunityIdentifier = { name: string } | { publicKey: string };

export function toCommunityIdentifier(address: string): CommunityIdentifier {
  return address.includes('.') ? { name: address } : { publicKey: address };
}

export function getShortAddress(address: string): string {
  if (address.includes('.')) return address;
  return address.length > 12 ? `${address.slice(0, 12)}…` : address;
}
