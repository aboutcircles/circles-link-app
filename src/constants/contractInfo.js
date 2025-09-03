export const GNOSIS_RPC = "https://rpc.gnosischain.com";

// PoH Membership condition
export const POHMC_CONTRACT_ADDRESS = "0x32cB147E4C529DFFdB837f60f0118f2002401FCA";
export const POH_GROUP_ADDRESS = "0xD55d4C7D48d8a4A158A1656356947BbF3f33f8d9";

// PoH Service with register function
export const GROUP_SERVICE_ADDRESS = "0xb5a7b74103AF9D6924B9f15Ab071aC48801E9B41";
export const LINKING_CONTRACT_ADDRESS = "0x3DE001984A546a90d05375f968a05ac39B2D52E9";

export const GROUP_SERVICE_ABI = [
  "function register(bytes20 humanityID, address _account) external"
];

export const POHMC_CONTRACT_ABI = [
  "function hasValidPoHId(address account) external view returns (bool)",
  "function getPoHIdByOwner(address _account) external view returns (bytes20 pohId)"
];
export const LINKING_CONTRACT_ABI = [
  // Only including the functions needed for our app
  "function gaslessLink(address circlesAccount, address externalAccount, uint256 nonce, bytes calldata circlesSignature, bytes calldata externalSignature) external",
  "function gaslessUnlink(address circlesAccount, address externalAccount, uint256 nonce, bytes calldata signature) external",
  "function externalToCircles(address) external view returns (address)",
  "function getLinkedExternalAccounts(address circlesAccount) external view returns (address[])",
  "function areAccountsLinked(address circlesAccount, address externalAccount) view returns (bool)",
  "function hasPendingLinkRequest(address circlesAccount, address externalAccount) view returns (bool)",
  "function getNonce(address circlesAccount, address externalAccount) view returns (uint256)",

  "function link(address _to) external",
  "function isCirclesAccount(address _account) external view returns (bool)",
  "function isLinkEstablished(address circlesAccount, address externalAccount) external view returns (bool)",
  "function circlesToExternal(address circlesAccount, address externalAccount) external view returns (address)"

];

export const HUB_ABI = [
  "function isTrusted(address _truster, address _trustee) external view returns (bool)"
];

export const HUB_ADDRESS = "0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8"; // The actual Circles Hub V2 address

export const CHAIN_ID = 100; // xDAI Chain ID - Change as needed

// Constants for EIP-712 typed data
export const EIP712_DOMAIN = {
  name: "CirclesLinkRegistry",
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: LINKING_CONTRACT_ADDRESS
};

export const LINK_REQUEST_TYPE = {
  LinkRequest: [
    { name: "circlesAccount", type: "address" },
    { name: "externalAccount", type: "address" },
    { name: "nonce", type: "uint256" }
  ]
};
