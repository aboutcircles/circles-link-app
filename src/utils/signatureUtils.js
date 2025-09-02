import { ethers } from "ethers";
import {
  EIP712_DOMAIN,
  LINK_REQUEST_TYPE
} from "../constants/contractInfo";

export const createLinkTypedData = (circlesAccount, externalAccount, nonce) => {
  return {
    types: {
      ...LINK_REQUEST_TYPE,
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ]
    },
    primaryType: "LinkRequest",
    domain: EIP712_DOMAIN,
    message: {
      circlesAccount,
      externalAccount,
      nonce
    }
  };
};


export const signTypedData = async (typedData) => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed!");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // In ethers v6, signTypedData is the recommended method for EIP-712
    console.log(typedData.primaryType, typedData.types[typedData.primaryType])
    const signature = await signer.signTypedData(
      typedData.domain,
      { [typedData.primaryType]: typedData.types[typedData.primaryType] },
      typedData.message
    );
    
    return signature;
  } catch (error) {
    console.error("Error signing typed data:", error);
    throw error;
  }
};