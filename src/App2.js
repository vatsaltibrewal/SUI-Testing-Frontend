import React, { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import {
  useSignAndExecuteTransaction,
  ConnectButton,
  useCurrentAccount
} from '@mysten/dapp-kit';
import './mainpage.css';

const App = () => {
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [packageId, setPackageId] = useState('');
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Create User Points Form State
  const [createPointsForm, setCreatePointsForm] = useState({
    treasuryCapId: '',
    amount: '',
    recipient: ''
  });

  // Add Points Form State
  const [addPointsForm, setAddPointsForm] = useState({
    treasuryCapId: '',
    userTokenId: '',
    amount: ''
  });

  // Spend Points Form State
  const [spendPointsForm, setSpendPointsForm] = useState({
    treasuryCapId: '',
    tokenId: '',
    amount: ''
  });

  // Handlers for input changes
  const handleCreatePointsChange = (e) => {
    setCreatePointsForm({ ...createPointsForm, [e.target.name]: e.target.value });
  };

  const handleAddPointsChange = (e) => {
    setAddPointsForm({ ...addPointsForm, [e.target.name]: e.target.value });
  };

  const handleSpendPointsChange = (e) => {
    setSpendPointsForm({ ...spendPointsForm, [e.target.name]: e.target.value });
  };


  // Action: Create User Points
  const createUserPoints = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty_points::create_user_points`,
        arguments: [
          tx.object(createPointsForm.treasuryCapId),
          tx.pure.u64(Number(createPointsForm.amount)),
          tx.pure.address(createPointsForm.recipient)
        ]
      });
      await signAndExecute({ transaction: tx });
      setCreatePointsForm({ treasuryCapId: '', amount: '', recipient: '' });
      alert("User points created successfully");
    } catch (error) {
      console.error('Error creating user points:', error);
    } finally {
      setLoading(false);
    }
  };

  // Action: Add Points
  const addPoints = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty_points::add_points`,
        arguments: [
          tx.object(addPointsForm.treasuryCapId),
          tx.object(addPointsForm.userTokenId),
          tx.pure.u64(Number(addPointsForm.amount))
        ]
      });
      await signAndExecute({ transaction: tx });
      setAddPointsForm({ treasuryCapId: '', userTokenId: '', amount: '' });
      alert("Points added successfully");
    } catch (error) {
      console.error('Error adding points:', error);
    } finally {
      setLoading(false);
    }
  };

  // Action: Spend Points
  const spendPoints = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty_points::spend_points`,
        arguments: [
          tx.object(spendPointsForm.treasuryCapId),
          tx.object(spendPointsForm.tokenId),
          tx.pure.u64(Number(spendPointsForm.amount))
        ]
      });
      await signAndExecute({ transaction: tx });
      setSpendPointsForm({ treasuryCapId: '', tokenId: '', amount: '' });
      alert("Points spent successfully");
    } catch (error) {
      console.error('Error spending points:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Hashcase Loyalty Points Manager</h1>
      <ConnectButton />

      <div className="package-input">
        <label>Package ID</label>
        <input
          type="text"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          placeholder="Enter Package ID"
        />
      </div>

      {/* Create User Points */}
      <section className="form-section">
        <h2>Create User Points</h2>
        <label>Treasury Cap ID</label>
        <input
          type="text"
          name="treasuryCapId"
          value={createPointsForm.treasuryCapId}
          onChange={handleCreatePointsChange}
          placeholder="Enter Treasury Cap ID"
        />
        <label>Amount</label>
        <input
          type="number"
          name="amount"
          value={createPointsForm.amount}
          onChange={handleCreatePointsChange}
          placeholder="Enter amount of points"
        />
        <label>Recipient Address</label>
        <input
          type="text"
          name="recipient"
          value={createPointsForm.recipient}
          onChange={handleCreatePointsChange}
          placeholder="Enter recipient address"
        />
        <button onClick={createUserPoints} disabled={loading}>
          Create User Points
        </button>
      </section>

      {/* Add Points */}
      <section className="form-section">
        <h2>Add Points</h2>
        <label>Treasury Cap ID</label>
        <input
          type="text"
          name="treasuryCapId"
          value={addPointsForm.treasuryCapId}
          onChange={handleAddPointsChange}
          placeholder="Enter Treasury Cap ID"
        />
        <label>User Token ID</label>
        <input
          type="text"
          name="userTokenId"
          value={addPointsForm.userTokenId}
          onChange={handleAddPointsChange}
          placeholder="Enter User Token ID"
        />
        <label>Amount</label>
        <input
          type="number"
          name="amount"
          value={addPointsForm.amount}
          onChange={handleAddPointsChange}
          placeholder="Enter amount to add"
        />
        <button onClick={addPoints} disabled={loading}>
          Add Points
        </button>
      </section>

      {/* Spend Points */}
      <section className="form-section">
        <h2>Spend Points</h2>
        <label>Treasury Cap ID</label>
        <input
          type="text"
          name="treasuryCapId"
          value={spendPointsForm.treasuryCapId}
          onChange={handleSpendPointsChange}
          placeholder="Enter Treasury Cap ID"
        />
        <label>Token ID</label>
        <input
          type="text"
          name="tokenId"
          value={spendPointsForm.tokenId}
          onChange={handleSpendPointsChange}
          placeholder="Enter Token ID"
        />
        <label>Amount</label>
        <input
          type="number"
          name="amount"
          value={spendPointsForm.amount}
          onChange={handleSpendPointsChange}
          placeholder="Enter amount to spend"
        />
        <button onClick={spendPoints} disabled={loading}>
          Spend Points
        </button>
      </section>
    </div>
  );
};

export default App;
