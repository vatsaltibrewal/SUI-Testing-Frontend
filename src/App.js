import React, { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import {
  useSignAndExecuteTransaction,
  ConnectButton,
  useCurrentAccount
} from '@mysten/dapp-kit';
import './App.css';

const App = () => {
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [packageId, setPackageId] = useState('');
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Form states
  const [ownerForm, setOwnerForm] = useState({
    adminCapId: '',
    address: ''
  });

  const [collectionForm, setCollectionForm] = useState({
    ownerCapId: '',
    name: '',
    description: '',
    mintType: '0', // 0: Free, 1: Fixed Price, 2: Dynamic Price
    baseMintPrice: '0',
    isOpenEdition: false,
    maxSupply: '0',
    isDynamic: false,
    isClaimable: false,
    baseImageUrl: '',
    baseAttributes: ''
  });

  const [nftForm, setNftForm] = useState({
    collectionId: '',
    name: '',
    description: '',
    imageUrl: '',
    attributes: ''
  });

  const [updateForm, setUpdateForm] = useState({
    collectionId: '',
    nftId: '',
    name: '',
    description: '',
    imageUrl: '',
    attributes: ''
  });

  const [claimForm, setClaimForm] = useState({
    collectionId: '',
    nftId: ''
  });

  // Form Handlers
  const handleOwnerChange = (e) => {
    setOwnerForm({ ...ownerForm, [e.target.name]: e.target.value });
  };

  const handleCollectionChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setCollectionForm({ ...collectionForm, [e.target.name]: value });
  };

  const handleNFTChange = (e) => {
    setNftForm({ ...nftForm, [e.target.name]: e.target.value });
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleClaimChange = (e) => {
    setClaimForm({ ...claimForm, [e.target.name]: e.target.value });
  };

  // Action Handlers
  const createOwner = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      // Pass both the admin cap object and the target user address.
      tx.moveCall({
        target: `${packageId}::hashcase_module::create_owner_cap`,
        arguments: [
          tx.object(ownerForm.adminCapId),
          tx.pure.address(ownerForm.address)
        ]
      });
      await signAndExecute({ transaction: tx });
      setOwnerForm({ adminCapId: '', address: '' });
    } catch (error) {
      console.error('Error creating owner cap:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      const imageUrlBytes = Array.from(new TextEncoder().encode(collectionForm.baseImageUrl));
      const attributesArray = collectionForm.baseAttributes
        .split(',')
        .map(attr => attr.trim())
        .filter(Boolean);

      tx.moveCall({
        target: `${packageId}::hashcase_module::create_collection`,
        arguments: [
          tx.object(collectionForm.ownerCapId),
          tx.pure.string(collectionForm.name),
          tx.pure.string(collectionForm.description),
          tx.pure.u8(Number(collectionForm.mintType)),
          tx.pure.u64(Number(collectionForm.baseMintPrice)),
          tx.pure.bool(collectionForm.isOpenEdition),
          tx.pure.u64(Number(collectionForm.maxSupply)),
          tx.pure.bool(collectionForm.isDynamic),
          tx.pure.bool(collectionForm.isClaimable),
          tx.pure.vector('u8', imageUrlBytes),
          tx.pure.vector('string', attributesArray)
        ]
      });

      await signAndExecute({ transaction: tx });
      setCollectionForm({
        ownerCapId: '',
        name: '',
        description: '',
        mintType: '0',
        baseMintPrice: '0',
        isOpenEdition: false,
        maxSupply: '0',
        isDynamic: false,
        isClaimable: false,
        baseImageUrl: '',
        baseAttributes: ''
      });
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const freeMintNFT = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      const imageUrlBytes = Array.from(new TextEncoder().encode(nftForm.imageUrl));
      const attributesArray = nftForm.attributes
        .split(',')
        .map(attr => attr.trim())
        .filter(Boolean);

      tx.moveCall({
        target: `${packageId}::hashcase_module::free_mint_nft`,
        arguments: [
          tx.object(nftForm.collectionId),
          tx.pure.string(nftForm.name),
          tx.pure.string(nftForm.description),
          tx.pure.vector('u8', imageUrlBytes),
          tx.pure.vector('string', attributesArray)
        ]
      });

      await signAndExecute({ transaction: tx });
      setNftForm({
        collectionId: '',
        name: '',
        description: '',
        imageUrl: '',
        attributes: ''
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNFTMetadata = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      const imageUrlBytes = Array.from(new TextEncoder().encode(updateForm.imageUrl));
      const attributesArray = updateForm.attributes
        .split(',')
        .map(attr => attr.trim())
        .filter(Boolean);

      tx.moveCall({
        target: `${packageId}::hashcase_module::update_nft_metadata`,
        arguments: [
          tx.object(updateForm.collectionId),
          tx.object(updateForm.nftId),
          tx.pure.string(updateForm.name),
          tx.pure.string(updateForm.description),
          tx.pure.vector('u8', imageUrlBytes),
          tx.pure.vector('string', attributesArray)
        ]
      });

      await signAndExecute({ transaction: tx });
      setUpdateForm({
        collectionId: '',
        nftId: '',
        name: '',
        description: '',
        imageUrl: '',
        attributes: ''
      });
    } catch (error) {
      console.error('Error updating NFT metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimNFT = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::hashcase_module::claim_nft`,
        arguments: [
          tx.object(claimForm.collectionId),
          tx.object(claimForm.nftId)
        ]
      });
      await signAndExecute({ transaction: tx });
      setClaimForm({
        collectionId: '',
        nftId: ''
      });
    } catch (error) {
      console.error('Error claiming NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Sui NFT Manager</h1>
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

      {/* Create Owner Cap */}
      <section className="form-section">
        <h2>Create Owner Cap</h2>
        <label>Admin Cap ID</label>
        <input
          type="text"
          name="adminCapId"
          value={ownerForm.adminCapId}
          onChange={handleOwnerChange}
          placeholder="Enter Admin Cap ID"
        />
        <label>Owner Address</label>
        <input
          type="text"
          name="address"
          value={ownerForm.address}
          onChange={handleOwnerChange}
          placeholder="Enter Owner Address"
        />
        <button onClick={createOwner} disabled={loading}>
          Create Owner Cap
        </button>
      </section>

      {/* Create Collection */}
      <section className="form-section">
        <h2>Create Collection</h2>
        <label>Owner Cap ID</label>
        <input
          type="text"
          name="ownerCapId"
          value={collectionForm.ownerCapId}
          onChange={handleCollectionChange}
          placeholder="Enter Owner Cap ID"
        />
        <label>Collection Name</label>
        <input
          type="text"
          name="name"
          value={collectionForm.name}
          onChange={handleCollectionChange}
          placeholder="Enter Collection Name"
        />
        <label>Description</label>
        <textarea
          name="description"
          value={collectionForm.description}
          onChange={handleCollectionChange}
          placeholder="Enter Collection Description"
        />
        <label>Mint Type</label>
        <select
          name="mintType"
          value={collectionForm.mintType}
          onChange={handleCollectionChange}
        >
          <option value="0">Free</option>
          <option value="1">Fixed Price</option>
          <option value="2">Dynamic Price</option>
        </select>
        <label>Base Mint Price</label>
        <input
          type="number"
          name="baseMintPrice"
          value={collectionForm.baseMintPrice}
          onChange={handleCollectionChange}
          placeholder="Enter Base Mint Price"
        />
        <label>
          <input
            type="checkbox"
            name="isOpenEdition"
            checked={collectionForm.isOpenEdition}
            onChange={handleCollectionChange}
          />
          Is Open Edition
        </label>
        <label>Max Supply</label>
        <input
          type="number"
          name="maxSupply"
          value={collectionForm.maxSupply}
          onChange={handleCollectionChange}
          placeholder="Enter Max Supply (0 for unlimited)"
        />
        <label>
          <input
            type="checkbox"
            name="isDynamic"
            checked={collectionForm.isDynamic}
            onChange={handleCollectionChange}
          />
          Is Dynamic
        </label>
        <label>
          <input
            type="checkbox"
            name="isClaimable"
            checked={collectionForm.isClaimable}
            onChange={handleCollectionChange}
          />
          Is Claimable
        </label>
        <label>Base Image URL</label>
        <input
          type="text"
          name="baseImageUrl"
          value={collectionForm.baseImageUrl}
          onChange={handleCollectionChange}
          placeholder="Enter Base Image URL"
        />
        <label>Base Attributes (comma separated)</label>
        <input
          type="text"
          name="baseAttributes"
          value={collectionForm.baseAttributes}
          onChange={handleCollectionChange}
          placeholder="Enter Base Attributes"
        />
        <button onClick={createCollection} disabled={loading}>
          Create Collection
        </button>
      </section>

      {/* Free Mint NFT */}
      <section className="form-section">
        <h2>Free Mint NFT</h2>
        <label>Collection ID</label>
        <input
          type="text"
          name="collectionId"
          value={nftForm.collectionId}
          onChange={handleNFTChange}
          placeholder="Enter Collection ID"
        />
        <label>NFT Name</label>
        <input
          type="text"
          name="name"
          value={nftForm.name}
          onChange={handleNFTChange}
          placeholder="Enter NFT Name"
        />
        <label>Description</label>
        <textarea
          name="description"
          value={nftForm.description}
          onChange={handleNFTChange}
          placeholder="Enter NFT Description"
        />
        <label>Image URL</label>
        <input
          type="text"
          name="imageUrl"
          value={nftForm.imageUrl}
          onChange={handleNFTChange}
          placeholder="Enter NFT Image URL"
        />
        <label>Attributes (comma separated)</label>
        <input
          type="text"
          name="attributes"
          value={nftForm.attributes}
          onChange={handleNFTChange}
          placeholder="Enter NFT Attributes"
        />
        <button onClick={freeMintNFT} disabled={loading}>
          Free Mint NFT
        </button>
      </section>

      {/* Update NFT Metadata */}
      <section className="form-section">
        <h2>Update NFT Metadata</h2>
        <label>Collection ID</label>
        <input
          type="text"
          name="collectionId"
          value={updateForm.collectionId}
          onChange={handleUpdateChange}
          placeholder="Enter Collection ID"
        />
        <label>NFT ID</label>
        <input
          type="text"
          name="nftId"
          value={updateForm.nftId}
          onChange={handleUpdateChange}
          placeholder="Enter NFT ID"
        />
        <label>New NFT Name</label>
        <input
          type="text"
          name="name"
          value={updateForm.name}
          onChange={handleUpdateChange}
          placeholder="Enter New NFT Name"
        />
        <label>New Description</label>
        <textarea
          name="description"
          value={updateForm.description}
          onChange={handleUpdateChange}
          placeholder="Enter New Description"
        />
        <label>New Image URL</label>
        <input
          type="text"
          name="imageUrl"
          value={updateForm.imageUrl}
          onChange={handleUpdateChange}
          placeholder="Enter New Image URL"
        />
        <label>New Attributes (comma separated)</label>
        <input
          type="text"
          name="attributes"
          value={updateForm.attributes}
          onChange={handleUpdateChange}
          placeholder="Enter New Attributes"
        />
        <button onClick={updateNFTMetadata} disabled={loading}>
          Update NFT Metadata
        </button>
      </section>

      {/* Claim NFT */}
      <section className="form-section">
        <h2>Claim NFT</h2>
        <label>Collection ID</label>
        <input
          type="text"
          name="collectionId"
          value={claimForm.collectionId}
          onChange={handleClaimChange}
          placeholder="Enter Collection ID"
        />
        <label>NFT ID</label>
        <input
          type="text"
          name="nftId"
          value={claimForm.nftId}
          onChange={handleClaimChange}
          placeholder="Enter NFT ID"
        />
        <button onClick={claimNFT} disabled={loading}>
          Claim NFT
        </button>
      </section>
    </div>
  );
};

export default App;
