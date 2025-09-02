import React, { useState, useEffect } from 'react';
import { isAddress } from 'ethers';
import { useProvider } from '../contexts/ProviderContext';
import { createLinkTypedData, signTypedData } from '../utils/signatureUtils';
import { getNonce } from '../utils/contractInteraction';

const LinkForm = () => {
  const { account, getReadOnlyContract, isCorrectChain } = useProvider();
  const [circlesAccount, setCirclesAccount] = useState('');
  const [externalAccount, setExternalAccount] = useState('');
  const [circlesSignature, setCirclesSignature] = useState('');
  const [externalSignature, setExternalSignature] = useState('');
  const [nonce, setNonce] = useState(0);
  const [isCircles, setIsCircles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [nonceLoading, setNonceLoading] = useState(false);

  const handleAccountType = (e) => {
    setIsCircles(e.target.value === 'circles');
    // Reset form when changing account type
    setCirclesAccount('');
    setExternalAccount('');
    setCirclesSignature('');
    setExternalSignature('');
    setNonce(0);
    setError(null);
    setSuccess(null);
  };

  // Fetch nonce when both accounts are provided
  useEffect(() => {
    const fetchNonce = async () => {
      if (circlesAccount && externalAccount && 
          isAddress(circlesAccount) && 
          isAddress(externalAccount)) {
        
        setNonceLoading(true);
        try {
          const readOnlyContract = getReadOnlyContract();
          const currentNonce = await getNonce(circlesAccount, externalAccount, readOnlyContract);
          setNonce(Number(currentNonce));
        } catch (err) {
          console.error("Error fetching nonce:", err);
          setError("Error fetching nonce: " + err.message);
        } finally {
          setNonceLoading(false);
        }
      } else {
        setNonce(0);
      }
    };

    fetchNonce();
  }, [circlesAccount, externalAccount, getReadOnlyContract]);

  const generateSignature = async () => {
    if (!isCorrectChain) {
      setError("Please switch to Gnosis Chain first");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs
      if (!circlesAccount || !isAddress(circlesAccount)) {
        throw new Error("Please enter a valid Circles account address");
      }
      
      if (!externalAccount || !isAddress(externalAccount)) {
        throw new Error("Please enter a valid external account address");
      }

      if (circlesAccount.toLowerCase() === externalAccount.toLowerCase()) {
        throw new Error("Circles and external accounts cannot be the same");
      }

      // Validate that the current account matches the selected role
      if (isCircles && account.address.toLowerCase() !== circlesAccount.toLowerCase()) {
        throw new Error("You selected 'Circles Account' but your connected wallet doesn't match the Circles account address");
      }
      
      if (!isCircles && account.address.toLowerCase() !== externalAccount.toLowerCase()) {
        throw new Error("You selected 'External Account' but your connected wallet doesn't match the external account address");
      }

      // Fetch the latest nonce to ensure we're using the correct one
      const readOnlyContract = getReadOnlyContract();
      const currentNonce = await getNonce(circlesAccount, externalAccount, readOnlyContract);
      const nonceNumber = Number(currentNonce);
      setNonce(nonceNumber);

      const typedData = createLinkTypedData(circlesAccount, externalAccount, nonceNumber);
      const signature = await signTypedData(typedData);

      // Set the appropriate signature based on the account type
      if (isCircles) {
        setCirclesSignature(signature);
        setSuccess("Circles signature generated successfully! Share this with the external account owner.");
      } else {
        setExternalSignature(signature);
        setSuccess("External signature generated successfully! Share this with the Circles account owner.");
      }
    } catch (err) {
      console.error("Error generating signature:", err);
      setError(err.message || "Error generating signature. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setCirclesAccount('');
    setExternalAccount('');
    setCirclesSignature('');
    setExternalSignature('');
    setNonce(0);
    setError(null);
    setSuccess(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Signature copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy signature');
    });
  };

  if (!account) {
    return (
      <div className="card">
        <h2>Link Accounts</h2>
        <p>Please connect your wallet to generate signatures.</p>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div className="card">
        <h2>Link Accounts</h2>
        <p className="error">Please switch to Gnosis Chain to use this feature.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Link Accounts</h2>
      
      <div className="form-section">
        <p>Select your account type:</p>
        <div>
          <input 
            type="radio" 
            id="circles" 
            name="accountType" 
            value="circles" 
            checked={isCircles} 
            onChange={handleAccountType} 
          />
          <label htmlFor="circles">I am the Circles Account</label>
          
          <input 
            type="radio" 
            id="external" 
            name="accountType" 
            value="external" 
            checked={!isCircles} 
            onChange={handleAccountType} 
            style={{ marginLeft: '20px' }}
          />
          <label htmlFor="external">I am the External Account</label>
        </div>
        <p className="info">
          Connected as: <strong>{account.address}</strong>
        </p>
      </div>
      
      <div className="form-section">
        <label>Circles Account Address:</label>
        <input 
          type="text" 
          value={circlesAccount} 
          onChange={(e) => setCirclesAccount(e.target.value)}
          placeholder="0x..." 
        />
        {isCircles && (
          <button 
            type="button" 
            onClick={() => setCirclesAccount(account.address)}
            className="fill-button"
          >
            Use My Address
          </button>
        )}
      </div>
      
      <div className="form-section">
        <label>External Account Address:</label>
        <input 
          type="text" 
          value={externalAccount} 
          onChange={(e) => setExternalAccount(e.target.value)}
          placeholder="0x..." 
        />
        {!isCircles && (
          <button 
            type="button" 
            onClick={() => setExternalAccount(account.address)}
            className="fill-button"
          >
            Use My Address
          </button>
        )}
      </div>
      
      {circlesAccount && externalAccount && isAddress(circlesAccount) && isAddress(externalAccount) && (
        <div className="form-section">
          <p>
            Current Nonce: {nonceLoading ? (
              <span>Loading...</span>
            ) : (
              <strong>{nonce}</strong>
            )}
          </p>
          <p className="info">This nonce will be used in the signature. Both parties must use the same nonce.</p>
        </div>
      )}
      
      <div className="form-section">
        <div className="button-group">
          <button 
            onClick={generateSignature} 
            disabled={loading || nonceLoading || !circlesAccount || !externalAccount || !isAddress(circlesAccount) || !isAddress(externalAccount)}
          >
            {loading ? "Processing..." : `Generate ${isCircles ? 'Circles' : 'External'} Signature`}
          </button>
          
          <button 
            onClick={clearForm} 
            disabled={loading}
            className="secondary-button"
          >
            Clear Form
          </button>
        </div>
      </div>

      {(circlesSignature || externalSignature) && (
        <div className="form-section">
          <p>Your Signature:</p>
          <div className="signature-container">
            <div className="account-box signature-box">
              {isCircles ? circlesSignature : externalSignature}
            </div>
            <button 
              onClick={() => copyToClipboard(isCircles ? circlesSignature : externalSignature)}
              className="copy-button"
            >
              Copy
            </button>
          </div>
          
          <div className="signature-info">
            <h4>Instructions:</h4>
            <ul>
              <li>Share this signature with the other party</li>
              <li>Make sure they use the same nonce value: <strong>{nonce}</strong></li>
              <li>The signature is only valid for these specific addresses and nonce</li>
              <li>Both signatures are needed to complete the link</li>
            </ul>
          </div>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default LinkForm;