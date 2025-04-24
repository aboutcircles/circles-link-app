import React, { useState, useEffect } from 'react';
import { isAddress } from 'ethers';
import { createLinkTypedData, signTypedData } from '../utils/signatureUtils';
import { getNonce } from '../utils/contractInteraction';

const LinkForm = ({ account }) => {
  const [circlesAccount, setCirclesAccount] = useState('');
  const [externalAccount, setExternalAccount] = useState('');
  const [circlesSignature, setCirclesSignature] = useState('');
  const [externalSignature, setExternalSignature] = useState('');
  const [nonce, setNonce] = useState(0);
  const [isCircles, setIsCircles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAccountType = (e) => {
    setIsCircles(e.target.value === 'circles');
    // Reset form when changing account type
    setCirclesAccount('');
    setExternalAccount('');
    setCirclesSignature('');
    setExternalSignature('');
    setNonce(0);
  };

  // Fetch nonce when both accounts are provided
  useEffect(() => {
    const fetchNonce = async () => {
      if (circlesAccount && externalAccount && 
          isAddress(circlesAccount) && 
          isAddress(externalAccount)) {
        try {
          const currentNonce = await getNonce(circlesAccount, externalAccount);
          setNonce(currentNonce);
        } catch (err) {
          console.error("Error fetching nonce:", err);
        }
      }
    };

    fetchNonce();
  }, [circlesAccount, externalAccount]);

  const generateSignature = async () => {
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

      // Fetch the latest nonce to ensure we're using the correct one
      const currentNonce = await getNonce(circlesAccount, externalAccount);
      setNonce(currentNonce);

      const typedData = createLinkTypedData(circlesAccount, externalAccount, currentNonce);
      const signature = await signTypedData(typedData);

      // Set the appropriate signature based on the account type
      if (isCircles) {
        setCirclesSignature(signature);
        setSuccess("Signature generated successfully. Share this with the external account owner.");
      } else {
        setExternalSignature(signature);
        setSuccess("Signature generated successfully. Share this with the Circles account owner.");
      }
    } catch (err) {
      console.error("Error generating signature:", err);
      setError(err.message || "Error generating signature. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <label htmlFor="circles">Circles Account</label>
          
          <input 
            type="radio" 
            id="external" 
            name="accountType" 
            value="external" 
            checked={!isCircles} 
            onChange={handleAccountType} 
            style={{ marginLeft: '20px' }}
          />
          <label htmlFor="external">External Account</label>
        </div>
      </div>
      
      <div className="form-section">
        <label>Circles Account Address:</label>
        <input 
          type="text" 
          value={circlesAccount} 
          onChange={(e) => setCirclesAccount(e.target.value)}
          placeholder="0x..." 
        />
      </div>
      
      <div className="form-section">
        <label>External Account Address:</label>
        <input 
          type="text" 
          value={externalAccount} 
          onChange={(e) => setExternalAccount(e.target.value)}
          placeholder="0x..." 
        />
      </div>
      
      {circlesAccount && externalAccount && isAddress(circlesAccount) && isAddress(externalAccount) && (
        <div className="form-section">
          <p>Current Nonce: <strong>{nonce}</strong></p>
          <p className="info">This nonce will be used in the signature. Both parties must use the same nonce.</p>
        </div>
      )}
      
      {isCircles ? (
        <div className="form-section">
          <button 
            onClick={generateSignature} 
            disabled={loading || !circlesAccount || !externalAccount}
          >
            {loading ? "Processing..." : "Generate Circles Signature"}
          </button>
          
          {circlesSignature && (
            <div>
              <p>Your Signature:</p>
              <div className="account-box">{circlesSignature}</div>
            </div>
          )}

        </div>
      ) : (
        <div className="form-section">
          <button 
            onClick={generateSignature} 
            disabled={loading || !circlesAccount || !externalAccount}
          >
            {loading ? "Processing..." : "Generate External Signature"}
          </button>
          
          {externalSignature && (
            <div>
              <p>Your Signature:</p>
              <div className="account-box">{externalSignature}</div>
            </div>
          )}

        </div>
      )}
      
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default LinkForm;
