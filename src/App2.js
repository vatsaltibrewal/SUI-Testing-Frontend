import React, { useState, useEffect } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient
} from '@mysten/dapp-kit';
import './mainpage.css';

// Ensure this matches your on-chain package ID
const LOYALTY_PACKAGE = '0xd22dbb13e6a3227f71afcc60cda88146a0574b6c0011c2e99edff5a1afd17f05';

// Ensure this matches your on-chain Policy ID
const POLICY_ID = `0xb7f98c3787c3b141f58c7e9c0fc19310565aba59b2df948ae43e40c9dc431bf2`;

// Define the full token type and the inner type for clarity
const loyaltyTokenType = `0x2::token::Token<${LOYALTY_PACKAGE}::loyalty::LOYALTY>`;
const loyaltyInnerType = `${LOYALTY_PACKAGE}::loyalty::LOYALTY`;


export default function NewPage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [balance, setBalance] = useState(0);
  const [rewardCapId, setRewardCapId] = useState('');
  const [rewardRecipient, setRewardRecipient] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Function to get the total loyalty points balance, with pagination.
  async function getLoyaltyBalance(userAddress) {
    if (!userAddress) return 0;
    try {
      let total = 0;
      let hasNextPage = true;
      let cursor = null;
      while (hasNextPage) {
        const { data, hasNextPage: newHasNextPage, nextCursor } = await client.getOwnedObjects({
          owner: userAddress,
          filter: { StructType: loyaltyTokenType },
          options: { showContent: true },
          cursor: cursor,
        });

        for (const obj of data) {
          const fields = obj.data?.content?.fields;
          if (fields && fields.balance) {
            total += Number(fields.balance);
          }
        }
        hasNextPage = newHasNextPage;
        cursor = nextCursor;
      }
      return total;
    } catch (error) {
      console.error("Error fetching balance:", error);
      setErrorMessage("Could not fetch balance.");
      return 0;
    }
  }

  useEffect(() => {
    if (!account) {
      setBalance(0);
      return;
    };
    const fetchBalance = async () => {
      const total = await getLoyaltyBalance(account.address);
      setBalance(total);
    }
    fetchBalance();
    const interval = setInterval(fetchBalance, 6000); // Refresh balance periodically
    return () => clearInterval(interval);
  }, [account, client]);

  // Admin-only: mint and transfer points to a user
  const rewardUser = () => {
    if (!account || !rewardCapId || !rewardRecipient || !rewardAmount) {
      setErrorMessage('Please fill all admin fields and connect your wallet.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    const tx = new Transaction();
    tx.moveCall({
      target: `${LOYALTY_PACKAGE}::loyalty::reward_user`,
      arguments: [
        tx.object(rewardCapId),
        tx.pure.u64(Number(rewardAmount)),
        tx.pure.address(rewardRecipient),
      ],
    });

    signAndExecuteTransaction(
      { transaction: tx },
      {
        onSuccess: (result) => {
          console.log('Reward successful!', result);
          setRewardRecipient('');
          setRewardAmount('');
        },
        onError: (error) => {
          console.error('Error rewarding user:', error);
          setErrorMessage(`Reward failed: ${error.message}`);
        },
        onSettled: () => setLoading(false)
      }
    );
  };

  // User: spend an exact amount of points
  const spendPoints = async () => {
    if (!account) {
      setErrorMessage('Please connect your wallet to spend points.');
      return;
    }
    const amountToSpend = Number(spendAmount);
    if (!amountToSpend || amountToSpend <= 0) {
      setErrorMessage('Please enter a valid amount to spend.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    try {
      const { data: tokenObjects } = await client.getOwnedObjects({
        owner: account.address,
        filter: { StructType: loyaltyTokenType },
        options: { showContent: true },
      });

      if (tokenObjects.length === 0) {
        throw new Error('You do not have any loyalty point tokens.');
      }

      const tokens = tokenObjects.map(obj => ({
        id: obj.data?.objectId,
        balance: Number(obj.data?.content?.fields?.balance),
      }));

      let sum = 0;
      const selectedTokens = [];
      for (const t of tokens) {
        selectedTokens.push(t);
        sum += t.balance;
        if (sum >= amountToSpend) break;
      }

      if (sum < amountToSpend) {
        throw new Error(`Insufficient points. You have ${sum}, but need ${amountToSpend}.`);
      }

      const tx = new Transaction();
      
      // The first token object will be the one we modify.
      const primaryToken = tx.object(selectedTokens[0].id);

      // If we need more than one token, queue up `join` operations.
      // `token::join` mutates the first argument and does not return a new object.
      if (selectedTokens.length > 1) {
        for (let i = 1; i < selectedTokens.length; i++) {
          tx.moveCall({
            target: '0x2::token::join',
            typeArguments: [loyaltyInnerType],
            arguments: [primaryToken, tx.object(selectedTokens[i].id)],
          });
        }
      }
      
      let tokenToSpend;
      
      if (sum > amountToSpend) {
        const splitPart = tx.moveCall({
            target: '0x2::token::split',
            typeArguments: [loyaltyInnerType],
            arguments: [primaryToken, tx.pure.u64(amountToSpend)],
        });
        tokenToSpend = splitPart;
      } else {
        tokenToSpend = primaryToken;
      }

      // Finally, call our custom `spend_points` function with the correctly prepared token.
      tx.moveCall({
        target: `${LOYALTY_PACKAGE}::loyalty::spend_points`,
        arguments: [tx.object(POLICY_ID), tokenToSpend],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Spend successful!', result);
            setSpendAmount('');
          },
          onError: (error) => {
            console.error('Spend error:', error);
            setErrorMessage(`Spend failed: ${error.message}`);
          },
          onSettled: () => setLoading(false)
        }
      );

    } catch (e) {
      setErrorMessage(e.message);
      console.error('Spend error', e);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>Hashcase Loyalty Points</h1>
      <ConnectButton />
      {account && (
        <div>
          <p><strong>Connected:</strong> {account.address}</p>
          <p><strong>Your Points Balance:</strong> {balance}</p>
        </div>
      )}
      {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}

      <section style={{ border: '1px solid #ccc', padding: '10px', margin: '20px 0', borderRadius: '8px' }}>
        <h2>Spend Points</h2>
        <input
          type="number"
          placeholder="Amount to Spend"
          value={spendAmount}
          onChange={e => setSpendAmount(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
        <button onClick={spendPoints} disabled={loading} style={{ marginTop: '10px', padding: '10px 15px' }}>
          {loading ? 'Processing...' : 'Spend'}
        </button>
      </section>

      <section style={{ border: '1px solid #ccc', padding: '10px', margin: '20px 0', borderRadius: '8px' }}>
        <h2>Reward Points (Admin)</h2>
        <input
          placeholder="TreasuryCap ID"
          value={rewardCapId}
          onChange={e => setRewardCapId(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '10px' }}
        />
        <input
          placeholder="Recipient Address"
          value={rewardRecipient}
          onChange={e => setRewardRecipient(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '10px' }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={rewardAmount}
          onChange={e => setRewardAmount(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
        <button onClick={rewardUser} disabled={loading} style={{ marginTop: '10px', padding: '10px 15px' }}>
          {loading ? 'Processing...' : 'Reward'}
        </button>
      </section>
    </div>
  );
}
