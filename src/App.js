import React, { useState } from 'react';
import { ProviderProvider, useProvider } from './contexts/ProviderContext';
import ConnectWallet from './components/ConnectWallet';
import LinkForm from './components/LinkForm';
import DirectLinkForm from './components/DirectLinkForm';
import ConnectedAccounts from './components/ConnectedAccounts';

import './App.css';

// Main app content that uses the provider context
function AppContent() {
  const { account } = useProvider();
  const [activeTab, setActiveTab] = useState('connected');

  const handleConnect = (accountAddress) => {
    console.log('Connected to account:', accountAddress);
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
              className={`tab ${activeTab === 'connected' ? 'active' : ''}`}
              onClick={() => setActiveTab('connected')}
            >
              Connected Accounts
            </button>
            <button 
              className={`tab ${activeTab === 'direct' ? 'active' : ''}`}
              onClick={() => setActiveTab('direct')}
            >
              Direct Link
            </button>
            <button 
              className={`tab ${activeTab === 'link' ? 'active' : ''}`}
              onClick={() => setActiveTab('link')}
            >
              Link Accounts
            </button>
          </div>

          {activeTab === 'connected' && (
            <ConnectedAccounts />
          )}
          
          {activeTab === 'direct' && (
            <DirectLinkForm />
          )}
          
          {activeTab === 'link' && (
            <LinkForm />
          )}
        </>
      )}
    </div>
  );
}

// Root App component with provider wrapper
function App() {
  return (
    <ProviderProvider>
      <AppContent />
    </ProviderProvider>
  );
}

export default App;