export const CONTRACT_ADDRESS = "0xe8dea0048ac0283db97dbb935c2ee471f30c75c1";

export const CONTRACT_ABI = [
  // Only including the functions needed for our app
  "function gaslessLink(address circlesAccount, address externalAccount, uint256 nonce, bytes calldata circlesSignature, bytes calldata externalSignature) external",
  "function gaslessUnlink(address circlesAccount, address externalAccount, uint256 nonce, bytes calldata signature) external",
  "function externalToCircles(address) view returns (address)",
  "function getLinkedExternalAccounts(address circlesAccount) view returns (address[])",
  "function areAccountsLinked(address circlesAccount, address externalAccount) view returns (bool)",
  "function hasPendingLinkRequest(address circlesAccount, address externalAccount) view returns (bool)",
  "function getNonce(address circlesAccount, address externalAccount) view returns (uint256)"
];

export const HUB_ADDRESS = "0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8"; // The actual Circles Hub V2 address

export const CHAIN_ID = 100; // xDAI Chain ID - Change as needed

// Constants for EIP-712 typed data
export const EIP712_DOMAIN = {
  name: "CirclesLinkRegistry",
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESS
};

export const LINK_REQUEST_TYPE = {
  LinkRequest: [
    { name: "circlesAccount", type: "address" },
    { name: "externalAccount", type: "address" },
    { name: "nonce", type: "uint256" }
  ]
};

export const UNLINK_REQUEST_TYPE = {
  UnlinkRequest: [
    { name: "circlesAccount", type: "address" },
    { name: "externalAccount", type: "address" },
    { name: "nonce", type: "uint256" }
  ]
};
