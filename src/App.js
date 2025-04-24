import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import LinkForm from './components/LinkForm';
import UnlinkForm from './components/UnlinkForm';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [, setProvider] = useState(null);
  const [activeTab, setActiveTab] = useState('link');

  const handleConnect = (accountAddress, providerInstance) => {
    setAccount(accountAddress);
    setProvider(providerInstance);
  };

  return (
    <div className="container">
      <header>
        <h1>Circles Link Registry - Signature Generator</h1>
        <p>Generate signatures to link your external accounts to Circles accounts using gasless operations</p>
      </header>

      <ConnectWallet onConnect={handleConnect} />
      
      <div className="card">
        <h2>About This Application</h2>
        <p>This application allows you to generate signatures to link your external wallet to a Circles account using gasless operations.</p>
        
        <div className="nonce-info">
          <h3>Important: Nonce Protection</h3>
          <p>This application uses a nonce system to prevent signature replay attacks:</p>
          <ul>
            <li>Each pair of accounts (Circles and external) has a unique nonce value</li>
            <li>The nonce is incremented after each successful operation</li>
            <li>Signatures are only valid for the specific nonce value used to create them</li>
            <li>If the nonce changes, you will need to generate new signatures</li>
          </ul>
          <p>Always make sure both parties are using the same nonce value when creating signatures.</p>
        </div>
      </div>

      {account && (
        <>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'link' ? 'active' : ''}`}
              onClick={() => setActiveTab('link')}
            >
              Link Accounts
            </button>
            <button 
              className={`tab ${activeTab === 'unlink' ? 'active' : ''}`}
              onClick={() => setActiveTab('unlink')}
            >
              Unlink Accounts
            </button>
          </div>

          {activeTab === 'link' ? (
            <LinkForm account={account} />
          ) : (
            <UnlinkForm account={account} />
          )}
        </>
      )}
    </div>
  );
}

export default App;