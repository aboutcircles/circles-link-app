import { useState, useEffect } from 'react';
import { useProvider } from '../contexts/ProviderContext';

const ConnectWallet = ({ onConnect }) => {
  const { 
    account, 
    isConnecting, 
    isConnected, 
    isCorrectChain, 
    currentWallet,
    connectWallet, 
    disconnect, 
    switchChain,
    getAvailableWallets
  } = useProvider();

  const [availableWallets, setAvailableWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('metamask');

  useEffect(() => {
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);
    
    // Set default wallet to the first available one
    if (wallets.length > 0) {
      setSelectedWallet(wallets[0].id);
    }
  }, [getAvailableWallets]);

  const handleConnect = async (walletId = selectedWallet) => {
    try {
      const accountData = await connectWallet(walletId);
      onConnect(accountData, null);
    } catch (error) {
      console.error("Failed to connect:", error);
      alert(`Failed to connect: ${error.message}`);
    }
  };

  const handleSwitchChain = async () => {
    try {
      await switchChain();
    } catch (error) {
      console.error("Failed to switch chain:", error);
      alert(`Failed to switch chain: ${error.message}`);
    }
  };

  if (isConnected) {
    return (
      <div className="card">
        <h2>Wallet Connected</h2>
        <div className="account-info">
          <p>Connected with {currentWallet ? availableWallets.find(w => w.id === currentWallet)?.name : 'Wallet'}:</p>
          <div className="account-box">
            {currentWallet && (
              <span className="wallet-icon">
                {availableWallets.find(w => w.id === currentWallet)?.icon}
              </span>
            )}
            {account.address}
          </div>
          
          {isCorrectChain && (
            <p className="success">✅ Connected to Gnosis Chain</p>
          )}
          
          <button onClick={disconnect} className="disconnect-btn">
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  if (availableWallets.length === 0) {
    return (
      <div className="card">
        <h2>No Wallet Detected</h2>
        <p>Please install MetaMask or Rabby wallet to continue:</p>
        <div className="wallet-install-links">
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="install-link"
          >
            🦊 Install MetaMask
          </a>
          <a 
            href="https://rabby.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="install-link"
          >
            🐰 Install Rabby
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Connect Your Wallet</h2>
      <p>Choose a wallet to connect:</p>
      
      <div className="wallet-options">
        {availableWallets.map((wallet) => (
          <div 
            key={wallet.id} 
            className={`wallet-option ${selectedWallet === wallet.id ? 'selected' : ''}`}
            onClick={() => setSelectedWallet(wallet.id)}
          >
            <span className="wallet-icon">{wallet.icon}</span>
            <span className="wallet-name">{wallet.name}</span>
            {selectedWallet === wallet.id && <span className="checkmark">✓</span>}
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => handleConnect(selectedWallet)} 
        disabled={isConnecting || !selectedWallet}
        className="connect-btn"
      >
        {isConnecting ? (
          <>
            Connecting to {availableWallets.find(w => w.id === selectedWallet)?.name}...
          </>
        ) : (
          <>
            Connect {availableWallets.find(w => w.id === selectedWallet)?.name}
          </>
        )}
      </button>
    </div>
  );
};

export default ConnectWallet;