import { useState } from 'react';
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
        <h1>Circles Link Registry</h1>
        <p>Link your external addresses to Circle account</p>
      </header>

      <ConnectWallet onConnect={handleConnect} />
      
      <div className="card">
        <h2>About This Application</h2>
        <p>This application allows you to link your external addresses to a Circles account.</p>
        <p>"If a user has a Proof of Humanity (PoH) ID on any connected external account, or if their Circles account itself holds a PoH ID, they are eligible to join the PoH Circles Group.</p>
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
              Link
            </button>
            {/*<button 
              className={`tab ${activeTab === 'link' ? 'active' : ''}`}
              onClick={() => setActiveTab('link')}
            >
              Gasless Link
            </button>*/}
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