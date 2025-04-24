import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ConnectWallet = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    // Check if MetaMask is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            onConnect(accounts[0], provider);
          }
        } catch (err) {
          console.error("Error checking connection:", err);
        }
      }
    };

    checkConnection();
  }, [onConnect]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onConnect(accounts[0], new ethers.BrowserProvider(window.ethereum));
        } else {
          setAccount(null);
        }
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [onConnect]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed! Please install MetaMask to use this app.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      setAccount(accounts[0]);
      onConnect(accounts[0], provider);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Error connecting wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="card">
      <h2>Connect Your Wallet</h2>
      
      {account ? (
        <div>
          <div className="wallet-status">
            <span className="status-indicator status-connected"></span>
            <span>Connected</span>
          </div>
          <p>Your Account: <span className="account-box">{account.address}</span></p>
        </div>
      ) : (
        <div>
          <div className="wallet-status">
            <span className="status-indicator status-disconnected"></span>
            <span>Disconnected</span>
          </div>
          <p>Connect your MetaMask wallet to use the application.</p>
          <button 
            onClick={connectWallet} 
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ConnectWallet;
