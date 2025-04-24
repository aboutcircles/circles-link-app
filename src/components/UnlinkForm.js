import React, { useState, useEffect } from 'react';
import { isAddress } from 'ethers';
import { createUnlinkTypedData, signTypedData } from '../utils/signatureUtils';
import { getNonce } from '../utils/contractInteraction';

const UnlinkForm = ({ account }) => {
  const [circlesAccount, setCirclesAccount] = useState('');
  const [externalAccount, setExternalAccount] = useState('');
  const [signature, setSignature] = useState('');
  const [nonce, setNonce] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

      const typedData = createUnlinkTypedData(circlesAccount, externalAccount, currentNonce);
      const signature = await signTypedData(typedData);
      
      setSignature(signature);
      setSuccess("Signature generated successfully. You can now submit the unlink request.");
    } catch (err) {
      console.error("Error generating signature:", err);
      setError(err.message || "Error generating signature. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Unlink Accounts</h2>
      
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
          <p className="info">This nonce will be used in the signature. The signature is only valid for this nonce value.</p>
        </div>
      )}
      
      <div className="form-section">
        <button 
          onClick={generateSignature} 
          disabled={loading || !circlesAccount || !externalAccount}
        >
          {loading ? "Processing..." : "Generate Signature"}
        </button>
      </div>
      
      {signature && (
        <div className="form-section">
          <p>Your Signature:</p>
          <div className="account-box">{signature}</div>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default UnlinkForm;
