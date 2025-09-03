import { ethers } from "ethers";
import {
  LINKING_CONTRACT_ABI,
  LINKING_CONTRACT_ADDRESS,
  POHMC_CONTRACT_ABI,
  POHMC_CONTRACT_ADDRESS,
  HUB_ABI,
  HUB_ADDRESS,
  POH_GROUP_ADDRESS,
  GROUP_SERVICE_ABI,
  GROUP_SERVICE_ADDRESS,
  GNOSIS_RPC
} from "../constants/contractInfo";

// Read-only functions (don't need wallet connection)
export const getReadOnlyProvider = () => {
  return new ethers.JsonRpcProvider(GNOSIS_RPC);
};

export const getReadOnlyContract = () => {
  const provider = getReadOnlyProvider();
  return new ethers.Contract(LINKING_CONTRACT_ADDRESS, LINKING_CONTRACT_ABI, provider);
};

export const getPoHContract = () => {
  const provider = getReadOnlyProvider();
  return new ethers.Contract(POHMC_CONTRACT_ADDRESS, POHMC_CONTRACT_ABI, provider);
};

export const getHubContract = () => {
  const provider = getReadOnlyProvider();
  return new ethers.Contract(HUB_ADDRESS, HUB_ABI, provider);
};

export const getGroupServiceContract = () => {
  const provider = getReadOnlyProvider();
  return new ethers.Contract(GROUP_SERVICE_ADDRESS, GROUP_SERVICE_ABI, provider);
};

// Functions that use the shared contract instances
export const getCirclesAddressForExternal = async (externalAddress, contract = null) => {
  try {
    const contractInstance = contract || getReadOnlyContract();
    return await contractInstance.externalToCircles(externalAddress);
  } catch (error) {
    console.error("Error getting Circles address:", error);
    throw error;
  }
};

export const getLinkedAccounts = async (circlesAddress, contract = null) => {
  try {
    const contractInstance = contract || getReadOnlyContract();
    return await contractInstance.getLinkedExternalAccounts(circlesAddress);
  } catch (error) {
    console.error("Error getting linked accounts:", error);
    throw error;
  }
};

export const checkAccountsLinked = async (circlesAddress, externalAddress, contract = null) => {
  try {
    const contractInstance = contract || getReadOnlyContract();
    return await contractInstance.areAccountsLinked(circlesAddress, externalAddress);
  } catch (error) {
    console.error("Error checking linked accounts:", error);
    throw error;
  }
};

export const checkPendingRequest = async (circlesAddress, externalAddress, contract = null) => {
  try {
    const contractInstance = contract || getReadOnlyContract();
    return await contractInstance.hasPendingLinkRequest(circlesAddress, externalAddress);
  } catch (error) {
    console.error("Error checking pending request:", error);
    throw error;
  }
};

export const getNonce = async (circlesAccount, externalAccount, contract = null) => {
  try {
    const contractInstance = contract || getReadOnlyContract();
    const result = await contractInstance.getNonce(circlesAccount, externalAccount);
    return result;
  } catch (error) {
    console.error("Error getting nonce:", error);
    throw error;
  }
};

export const isCirclesAccount = async (address, contract = null) => {
  try {
    const contractInstance = contract || getReadOnlyContract();
    return await contractInstance.isCirclesAccount(address);
  } catch (error) {
    console.error("Error checking if Circles account:", error);
    throw error;
  }
};

export const isLinkEstablished = async (circlesAccount, externalAccount, contract = null) => {
  try {
    const contractInstance = contract || getReadOnlyContract();
    return await contractInstance.isLinkEstablished(circlesAccount, externalAccount);
  } catch (error) {
    console.error("Error checking link established:", error);
    throw error;
  }
};

export const getCirclesLinkedAccounts = async (circlesAccount, contract = null) => {
  try {
    const contractInstance = contract || getReadOnlyContract();
    const links = [];
    
    // Traverse the linked list starting from sentinel
    const sentinel = "0x0000000000000000000000000000000000000001";
    let current = await contractInstance.circlesToExternal(circlesAccount, sentinel);
    let iterations = 0;
    const maxIterations = 100;
    
    while (current && current !== ethers.ZeroAddress && current !== sentinel && iterations < maxIterations) {
      links.push(current);
      current = await contractInstance.circlesToExternal(circlesAccount, current);
      iterations++;
    }
    
    return links;
  } catch (error) {
    console.error("Error getting Circles linked accounts:", error);
    throw error;
  }
};

// Functions that require a signer (write operations)
// These now expect the contract instance to be passed in
export const linkAccounts = async (targetAddress, contractInstance) => {
  try {
    if (!contractInstance) {
      throw new Error("Contract instance with signer is required");
    }
    
    const tx = await contractInstance.link(targetAddress);
    return tx;
  } catch (error) {
    console.error("Error linking accounts:", error);
    throw error;
  }
};

// Group registration function
export const registerToPoHGroup = async (humanityId, circlesAccount, contractInstance) => {
  try {
    if (!contractInstance) {
      throw new Error("Contract instance with signer is required");
    }
    
    const tx = await contractInstance.register(humanityId, circlesAccount);
    return tx;
  } catch (error) {
    console.error("Error registering to PoH group:", error);
    throw error;
  }
};

// PoH-related functions
export const hasValidPoHId = async (address, contract = null) => {
  try {
    const contractInstance = contract || getPoHContract();
    const result = await contractInstance.hasValidPoHId(address);
    return result;
  } catch (error) {
    console.error("Error checking PoH ID:", error);
    throw error;
  }
};

export const getPoHIdByOwner = async (address, contract = null) => {
  try {
    const contractInstance = contract || getPoHContract();
    const result = await contractInstance.getPoHIdByOwner(address);
    return result;
  } catch (error) {
    console.error("Error getting PoH ID:", error);
    throw error;
  }
};

// Hub/Group membership functions
export const isPoHGroupMember = async (circlesAddress, contract = null) => {
  try {
    const contractInstance = contract || getHubContract();
    // Check if PoH group trusts the Circles account
    const result = await contractInstance.isTrusted(POH_GROUP_ADDRESS, circlesAddress);
    return result;
  } catch (error) {
    console.error("Error checking PoH group membership:", error);
    throw error;
  }
};