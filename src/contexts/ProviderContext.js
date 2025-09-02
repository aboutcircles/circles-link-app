import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from "ethers";
import { 
  LINKING_CONTRACT_ABI, 
  LINKING_CONTRACT_ADDRESS, 
  POHMC_CONTRACT_ABI, 
  POHMC_CONTRACT_ADDRESS, 
  HUB_ABI, 
  HUB_ADDRESS, 
  GROUP_SERVICE_ABI, 
  GROUP_SERVICE_ADDRESS, 
  CHAIN_ID, 
  GNOSIS_RPC 
} from "../constants/contractInfo";

const ProviderContext = createContext();

// Wallet configurations
const WALLET_CONFIGS = {
  metamask: {
    name: 'MetaMask',
    icon: '🦊',
    detect: (provider) => provider.isMetaMask
  },
  rabby: {
    name: 'Rabby',
    icon: '🐰',
    detect: (provider) => provider.isRabby || provider._rabby,
    directAccess: () => window.rabby
  }
};

export const useProvider = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
};

export const ProviderProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [isCorrectChain, setIsCorrectChain] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentWallet, setCurrentWallet] = useState(null);

  // Create read-only provider
  const readOnlyProvider = useCallback(() => 
    new ethers.JsonRpcProvider(GNOSIS_RPC), []
  );

  // Contract factory function
  const createContract = useCallback((address, abi, withSigner = false) => {
    const contractProvider = withSigner ? signer : readOnlyProvider();
    if (withSigner && !signer) {
      throw new Error("No signer available. Please connect wallet first.");
    }
    return new ethers.Contract(address, abi, contractProvider);
  }, [signer, readOnlyProvider]);

  // Contract getters
  const getReadOnlyContract = useCallback(() => 
    createContract(LINKING_CONTRACT_ADDRESS, LINKING_CONTRACT_ABI), [createContract]
  );

  const getPoHContract = useCallback(() => 
    createContract(POHMC_CONTRACT_ADDRESS, POHMC_CONTRACT_ABI), [createContract]
  );

  const getHubContract = useCallback(() => 
    createContract(HUB_ADDRESS, HUB_ABI), [createContract]
  );

  const getContractInstance = useCallback(() => 
    createContract(LINKING_CONTRACT_ADDRESS, LINKING_CONTRACT_ABI, true), [createContract]
  );

  const getGroupServiceContractInstance = useCallback(() => 
    createContract(GROUP_SERVICE_ADDRESS, GROUP_SERVICE_ABI, true), [createContract]
  );

  // Detect available wallets
  const getAvailableWallets = useCallback(() => {
    if (!window.ethereum) return [];

    const wallets = [];
    const providers = window.ethereum.providers || [window.ethereum];

    Object.entries(WALLET_CONFIGS).forEach(([id, config]) => {
      // Check direct access first
      if (config.directAccess && config.directAccess()) {
        wallets.push({ ...config, id, provider: config.directAccess() });
        return;
      }

      // Find matching provider
      const matchingProvider = providers.find(config.detect);
      if (matchingProvider) {
        wallets.push({ ...config, id, provider: matchingProvider });
      }
    });

    // Fallback for unknown wallets
    if (wallets.length === 0 && window.ethereum) {
      wallets.push({
        name: 'Injected Wallet',
        id: 'injected',
        provider: window.ethereum,
        icon: '💼'
      });
    }

    return wallets;
  }, []);

  // Get wallet provider by ID
  const getWalletProvider = useCallback((walletId) => {
    const config = WALLET_CONFIGS[walletId];
    if (!config) return window.ethereum;

    // Direct access check
    if (config.directAccess) {
      const direct = config.directAccess();
      if (direct) return direct;
    }

    if (!window.ethereum) return null;

    const providers = window.ethereum.providers || [window.ethereum];
    return providers.find(config.detect) || window.ethereum;
  }, []);

  // Chain operations
  const checkChain = useCallback(async (providerInstance) => {
    try {
      const network = await providerInstance.getNetwork();
      return Number(network.chainId) === CHAIN_ID;
    } catch (error) {
      console.error("Error checking chain:", error);
      return false;
    }
  }, []);

  const switchChain = useCallback(async (walletProvider) => {
    const targetProvider = walletProvider || getWalletProvider(currentWallet);
    
    if (!targetProvider) {
      throw new Error("No wallet provider available!");
    }

    await targetProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
    });
  }, [currentWallet, getWalletProvider]);

  // Connect wallet
  const connectWallet = useCallback(async (walletId = 'metamask') => {
    const walletProvider = getWalletProvider(walletId);
    
    if (!walletProvider) {
      throw new Error(`${walletId} wallet is not available!`);
    }

    setIsConnecting(true);
    
    try {
      // Enable wallet if needed
      if (walletProvider.enable) {
        await walletProvider.enable();
      }
      
      // Request accounts
      const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
      const newProvider = new ethers.BrowserProvider(walletProvider);
      
      // Handle chain
      const onCorrectChain = await checkChain(newProvider);
      if (!onCorrectChain) {
        await switchChain(walletProvider);
      }
      setIsCorrectChain(await checkChain(newProvider));

      // Setup signer and account
      const newSigner = await newProvider.getSigner();
      const address = await newSigner.getAddress();
      
      // Update state
      setProvider(newProvider);
      setSigner(newSigner);
      setAccount({ address });
      setCurrentWallet(walletId);
      
      return { address, wallet: walletId };
    } finally {
      setIsConnecting(false);
    }
  }, [checkChain, switchChain, getWalletProvider]);

  // Disconnect
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setIsCorrectChain(false);
    setCurrentWallet(null);
  }, []);

  // Event listeners
  useEffect(() => {
    if (!currentWallet) return;

    const walletProvider = getWalletProvider(currentWallet);
    if (!walletProvider) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (account && accounts[0] !== account.address) {
        connectWallet(currentWallet).catch(console.error);
      }
    };

    const handleChainChanged = () => {
      if (provider) {
        connectWallet(currentWallet).catch(console.error);
      }
    };

    walletProvider.on('accountsChanged', handleAccountsChanged);
    walletProvider.on('chainChanged', handleChainChanged);

    return () => {
      walletProvider.removeListener('accountsChanged', handleAccountsChanged);
      walletProvider.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, provider, connectWallet, disconnect, currentWallet, getWalletProvider]);

  const value = {
    // State
    provider,
    signer,
    account,
    isCorrectChain,
    isConnecting,
    isConnected: !!account,
    currentWallet,

    // Methods
    connectWallet,
    disconnect,
    switchChain,
    readOnlyProvider,
    getReadOnlyContract,
    getPoHContract,
    getHubContract,
    getContractInstance,
    getGroupServiceContractInstance,
    getAvailableWallets,
  };

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};