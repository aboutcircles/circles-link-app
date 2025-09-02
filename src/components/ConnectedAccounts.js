import React, { useState, useEffect } from 'react';
import { useProvider } from '../contexts/ProviderContext';
import { 
  getLinkedAccounts, 
  getCirclesAddressForExternal, 
  isCirclesAccount,
  getCirclesLinkedAccounts,
  isLinkEstablished,
  hasValidPoHId,
  isPoHGroupMember,
  getPoHIdByOwner,
  registerToPoHGroup
} from '../utils/contractInteraction';

const ConnectedAccounts = () => {
  const { account, getReadOnlyContract, getPoHContract, getHubContract, getGroupServiceContractInstance, isCorrectChain } = useProvider();
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCircles, setIsCircles] = useState(false);
  const [currentAccountPoHStatus, setCurrentAccountPoHStatus] = useState(false);
  const [currentAccountGroupMember, setCurrentAccountGroupMember] = useState(false);
  const [pohLoading, setPohLoading] = useState(true);
  const [canJoinGroup, setCanJoinGroup] = useState(false);
  const [joinGroupLoading, setJoinGroupLoading] = useState(false);
  const [linkedPoHAccount, setLinkedPoHAccount] = useState(null);

  useEffect(() => {
    if (account?.address) {
      loadLinkedAccounts();
    }
  }, [account?.address]);

  const loadLinkedAccounts = async () => {
    if (!account?.address) return;
    
    setLoading(true);
    setPohLoading(true);
    setError(null);

    try {
      // Get shared contract instances
      const readOnlyContract = getReadOnlyContract();
      const pohContract = getPoHContract();
      const hubContract = getHubContract();
      
      // Check if current account is Circles account
      console.log("Checking account type for:", account.address);
      const circlesCheck = await isCirclesAccount(account.address, readOnlyContract);
      console.log("Is Circles account:", circlesCheck);
      setIsCircles(circlesCheck);

      // Check PoH status for current account
      const currentAccountPoH = await hasValidPoHId(account.address, pohContract);
      setCurrentAccountPoHStatus(currentAccountPoH);

      // Check if current account is a member of PoH group (only for Circles accounts)
      let currentAccountGroupMembership = false;
      if (circlesCheck) {
        currentAccountGroupMembership = await isPoHGroupMember(account.address, hubContract);
        setCurrentAccountGroupMember(currentAccountGroupMembership);
      } else {
        setCurrentAccountGroupMember(false);
      }

      let accounts = [];
      let pohAccountWithBidirectionalLink = null;

      if (circlesCheck) {
        // For Circles accounts, get linked external accounts
        const linkedExternal = await getCirclesLinkedAccounts(account.address, readOnlyContract);
        
        // Check bidirectional status and PoH status for each
        for (const externalAddr of linkedExternal) {
          const isBidirectional = await isLinkEstablished(account.address, externalAddr, readOnlyContract);
          const hasPoH = await hasValidPoHId(externalAddr, pohContract);
          
          // Check if this is a bidirectional link with a PoH account
          if (isBidirectional && hasPoH && !pohAccountWithBidirectionalLink) {
            pohAccountWithBidirectionalLink = externalAddr;
          }
          
          accounts.push({
            address: externalAddr,
            type: 'External Account',
            isBidirectional,
            hasPoH,
            isGroupMember: false // External accounts can't be group members
          });
        }
      } else {
        console.log("Checking for linked Circles account...");
        // For external accounts, check if linked to a Circles account
        const circlesAddr = await getCirclesAddressForExternal(account.address, readOnlyContract);
        console.log("Found Circles address:", circlesAddr);
        
        if (circlesAddr && circlesAddr !== '0x0000000000000000000000000000000000000000') {
          const isBidirectional = await isLinkEstablished(circlesAddr, account.address, readOnlyContract);
          const hasPoH = await hasValidPoHId(circlesAddr, pohContract);
          // Check if the linked Circles account is a PoH group member
          const isGroupMember = await isPoHGroupMember(circlesAddr, hubContract);
          accounts.push({
            address: circlesAddr,
            type: 'Circles Account',
            isBidirectional,
            hasPoH,
            isGroupMember
          });
        }
      }

      setLinkedAccounts(accounts);
      
      // Determine if user can join PoH group
      const canJoin = circlesCheck && // User is a Circles account
                     !currentAccountGroupMembership && // Not already a group member
                     pohAccountWithBidirectionalLink; // Has bidirectional link with PoH account
      
      setCanJoinGroup(canJoin);
      setLinkedPoHAccount(pohAccountWithBidirectionalLink);
      
    } catch (err) {
      console.error("Error loading linked accounts:", err);
      setError("Error loading linked accounts: " + err.message);
    } finally {
      setLoading(false);
      setPohLoading(false);
    }
  };

  const handleJoinPoHGroup = async () => {
    if (!isCorrectChain) {
      setError("Please switch to Gnosis Chain first");
      return;
    }

    if (!linkedPoHAccount) {
      setError("No linked PoH account found");
      return;
    }

    setJoinGroupLoading(true);
    setError(null);

    try {
      // Get the PoH ID from the linked account
      const pohContract = getPoHContract();
      const humanityId = await getPoHIdByOwner(linkedPoHAccount, pohContract);
      
      if (!humanityId || humanityId === "0x0000000000000000000000000000000000000000") {
        throw new Error("Could not retrieve PoH ID from linked account");
      }

      // Get the group service contract instance with signer
      const groupServiceContract = getGroupServiceContractInstance();
      
      // Register to PoH group
      const tx = await registerToPoHGroup(humanityId, account.address, groupServiceContract);
      
      alert(`Registration transaction submitted: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      alert(`Successfully joined PoH Group! Transaction confirmed in block ${receipt.blockNumber}`);
      
      // Refresh the data to show updated status
      loadLinkedAccounts();
      
    } catch (err) {
      console.error("Error joining PoH group:", err);
      setError(err.message || "Error joining PoH group. Please try again.");
    } finally {
      setJoinGroupLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="card">
        <h2>Connected Accounts</h2>
        <p>Please connect your wallet to view linked accounts.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <h2>Connected Accounts</h2>
        <p>Loading your connections...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Connected Accounts</h2>
      
      <div className="wallet-info">
        <div className="account-type-info">
          <span>Your Account Type: <strong>{isCircles ? 'Circles Account' : 'External Account'}</strong></span>
          <div className="poh-status">
            PoH Status: {pohLoading ? (
              <span>Loading...</span>
            ) : (
              <span className={currentAccountPoHStatus ? 'poh-verified' : 'poh-not-verified'}>
                {currentAccountPoHStatus ? '✅ Verified' : '❌ Not Verified'}
              </span>
            )}
          </div>
          {isCircles && (
            <div className="group-status">
              PoH Group Member: {pohLoading ? (
                <span>Loading...</span>
              ) : (
                <span className={currentAccountGroupMember ? 'group-member' : 'not-group-member'}>
                  {currentAccountGroupMember ? '🌟 Yes' : '❌ No'}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="button-group">
          <button onClick={loadLinkedAccounts} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          
          {canJoinGroup && (
            <button 
              onClick={handleJoinPoHGroup} 
              disabled={joinGroupLoading || !isCorrectChain}
              className="join-group-btn"
            >
              {joinGroupLoading ? 'Joining...' : '🌟 Join PoH Group'}
            </button>
          )}
        </div>
      </div>
      
      {error && <p className="error">{error}</p>}
      
      {canJoinGroup && (
        <div className="join-group-info">
          <h3>🎉 You can join the PoH Group!</h3>
          <p>
            Your Circles account has a bidirectional link with a PoH-verified account ({linkedPoHAccount}). 
            You can now register your Circles token to the PoH Group to enable group token minting.
          </p>
        </div>
      )}
      
      {linkedAccounts.length === 0 ? (
        <p>No connected accounts found.</p>
      ) : (
        <div className="account-list">
          {linkedAccounts.map((linked, index) => (
            <div key={index} className="account-box">
              <div className="account-header">
                <div>
                  <strong>{linked.type}:</strong> {linked.address}
                </div>
                <div className="status-badges">
                  <div className="poh-badge">
                    <span className={linked.hasPoH ? 'poh-verified' : 'poh-not-verified'}>
                      {linked.hasPoH ? '✅ PoH Verified' : '❌ No PoH'}
                    </span>
                  </div>
                  {linked.type === 'Circles Account' && (
                    <div className="group-badge">
                      <span className={linked.isGroupMember ? 'group-member' : 'not-group-member'}>
                        {linked.isGroupMember ? '🌟 PoH Group' : '⭕ Not in PoH Group'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="account-details">
                <div className="link-status">
                  Status: {linked.isBidirectional ? '✅ Bidirectional Link' : '⏳ One-way Link'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectedAccounts;