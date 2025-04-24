import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../constants/contractInfo";

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed!");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const getContractInstance = async (provider) => {
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const getCirclesAddressForExternal = async (externalAddress) => {
  try {
    const provider = getProvider();
    const contract = await getContractInstance(provider);
    return await contract.externalToCircles(externalAddress);
  } catch (error) {
    console.error("Error getting Circles address:", error);
    throw error;
  }
};

export const getLinkedAccounts = async (circlesAddress) => {
  try {
    const provider = getProvider();
    const contract = await getContractInstance(provider);
    return await contract.getLinkedExternalAccounts(circlesAddress);
  } catch (error) {
    console.error("Error getting linked accounts:", error);
    throw error;
  }
};

export const checkAccountsLinked = async (circlesAddress, externalAddress) => {
  try {
    const provider = getProvider();
    const contract = await getContractInstance(provider);
    return await contract.areAccountsLinked(circlesAddress, externalAddress);
  } catch (error) {
    console.error("Error checking linked accounts:", error);
    throw error;
  }
};

export const checkPendingRequest = async (circlesAddress, externalAddress) => {
  try {
    const provider = getProvider();
    const contract = await getContractInstance(provider);
    return await contract.hasPendingLinkRequest(circlesAddress, externalAddress);
  } catch (error) {
    console.error("Error checking pending request:", error);
    throw error;
  }
};

export const getNonce = async (circlesAccount, externalAccount) => {
  try {
    const provider = getProvider();
    const contract = await getContractInstance(provider);
    const result = await contract.getNonce(circlesAccount, externalAccount);
    return result;
  } catch (error) {
    console.error("Error getting nonce:", error);
    throw error;
  }
};