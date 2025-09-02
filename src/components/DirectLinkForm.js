import React, { useState } from 'react';
import { isAddress } from 'ethers';
import { linkAccounts, isCirclesAccount } from '../utils/contractInteraction';
import { useProvider } from '../contexts/ProviderContext';

const DirectLinkForm = () => {
  const { account, getContractInstance, getReadOnlyContract, isCorrectChain } = useProvider();
  const [targetAddress, setTargetAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const handleLink = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setTxHash(null);

    try {
      if (!isCorrectChain) {
        throw new Error("Please switch to Gnosis Chain first");
      }

      // Validate target address
      if (!targetAddress || !isAddress(targetAddress)) {
        throw new Error("Please enter a valid target address");
      }

      if (targetAddress.toLowerCase() === account.address.toLowerCase()) {
        throw new Error("Cannot link to yourself");
      }

      // Check account types using read-only contract
      const readOnlyContract = getReadOnlyContract();
      const isCurrentCircles = await isCirclesAccount(account.address, readOnlyContract);
      const isTargetCircles = await isCirclesAccount(targetAddress, readOnlyContract);

      if (!isCurrentCircles && !isTargetCircles) {
        throw new Error("At least one account must be a Circles account");
      }

      // Execute the link transaction using contract with signer
      const contractInstance = getContractInstance();
      const tx = await linkAccounts(targetAddress, contractInstance);
      setTxHash(tx.hash);
      setSuccess(`Transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      setSuccess(`Link created successfully! Transaction confirmed in block ${receipt.blockNumber}`);

    } catch (err) {
      console.error("Error linking accounts:", err);
      setError(err.message || "Error linking accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isCorrectChain) {
    return (
      <div className="card">
        <h2>Direct Link (On-Chain)</h2>
        <p className="error">Please switch to Gnosis Chain to use this feature.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Direct Link (On-Chain)</h2>
      
      <div className="form-section">
        <label>Target Account Address:</label>
        <input 
          type="text" 
          value={targetAddress} 
          onChange={(e) => setTargetAddress(e.target.value)}
          placeholder="0x..." 
        />
        <p className="info">
          Enter the address you want to link to. This will create an on-chain transaction.
        </p>
      </div>
      
      <div className="form-section">
        <button 
          onClick={handleLink} 
          disabled={loading || !targetAddress}
        >
          {loading ? "Processing..." : "Create Link"}
        </button>
      </div>
      
      {txHash && (
        <div className="form-section">
          <p>Transaction Hash:</p>
          <div className="account-box">{txHash}</div>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default DirectLinkForm;