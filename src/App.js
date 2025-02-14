import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import React, { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import {
  useSignAndExecuteTransaction,
  useReportTransactionEffects,
  ConnectButton,
  useCurrentAccount
} from '@mysten/dapp-kit';


// Initialize Sui client (adjust network as needed)
const provider = new SuiClient({ url: getFullnodeUrl('testnet') });


// Replace with your deployed package ID for the hashcase contract
const PACKAGE_ID = '0x15275c0ca9742fca7bbf68365acba809235cb685d3048a101043cd589aa19236';

const App = () => {
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [digest, setDigest] = useState('');

  // Form state for creating a collection
  const [collectionForm, setCollectionForm] = useState({
    ownerCapId: '',
    collectionName: '',
    collectionDescription: '',
    mintType: 0, // 0: Free, 1: Fixed, 2: Dynamic
    baseMintPrice: 0,
    isOpenEdition: false,
    maxSupply: 0,
    isDynamic: false,
    isClaimable: false,
    baseImageUrl: '',
    baseAttributes: '' // comma-separated string
  });

  // Form state for free minting an NFT
  const [nftForm, setNftForm] = useState({
    collectionId: '',
    nftName: '',
    nftDescription: '',
    nftUrl: '',
    nftAttributes: '' // comma-separated string
  });

  // Form state for claiming an NFT
  const [claimForm, setClaimForm] = useState({
    collectionId: '',
    nftId: ''
  });

  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { mutateAsync: reportTransactionEffects } = useReportTransactionEffects();

  // Update form handlers
  const handleCollectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCollectionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNFTChange = (e) => {
    const { name, value } = e.target;
    setNftForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClaimChange = (e) => {
    const { name, value } = e.target;
    setClaimForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create Collection by calling hashcase_module::create_collection
  const createCollection = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet.");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();

      // Convert the image URL string into a vector<u8>
      const imageUrlBytes = Array.from(new TextEncoder().encode(collectionForm.baseImageUrl));
      // Convert attributes (comma-separated) into an array of strings
      const attributesArray = collectionForm.baseAttributes
        .split(',')
        .map(attr => attr.trim())
        .filter(attr => attr);

      tx.moveCall({
        target: `${PACKAGE_ID}::hashcase_module::create_collection`,
        arguments: [
          // The owner cap must be provided by the caller (as an object)
          tx.object(collectionForm.ownerCapId),
          tx.pure.string(collectionForm.collectionName),
          tx.pure.string(collectionForm.collectionDescription),
          tx.pure.u8(Number(collectionForm.mintType)),
          tx.pure.u64(Number(collectionForm.baseMintPrice)),
          tx.pure.bool(collectionForm.isOpenEdition),
          tx.pure.u64(Number(collectionForm.maxSupply)),
          tx.pure.bool(collectionForm.isDynamic),
          tx.pure.bool(collectionForm.isClaimable),
          tx.pure.vector('u8',imageUrlBytes),
          tx.pure.vector('string',attributesArray)
        ]
      });

      await signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Collection created:', result);
            setDigest(result.digest);
          }
        }
      );

      setCollectionForm({
        ownerCapId: '',
        collectionName: '',
        collectionDescription: '',
        mintType: 0,
        baseMintPrice: 0,
        isOpenEdition: false,
        maxSupply: 0,
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

  async function get_collection_nft_count() {
    // Build a transaction that calls your “view” function.
    // Note: Even if your function is not marked as `entry`, you can simulate its execution.

    if (!currentAccount) {
      alert("Please connect your wallet.");
      return;
    }
    const sender = currentAccount.address;
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::hashcase_module::get_collection_nft_count`,
      arguments: [
        tx.object("0x155d02be1a1fbd2fd99ddbecbea6dac41cd414497a7e0fd7bf6c5622637cd5b1")
      ],
    });
  
    // Run the transaction in dev-inspect mode to simulate execution and get return values.
    const result = await provider.devInspectTransactionBlock({
      sender,
      transactionBlock: tx,
    });
  
    // The simulated result (if your function returns any values) is available in result.results.
    console.log("Simulated return values:", result.results);
  }
  //get_collection_nft_count();

  // Free mint NFT by calling hashcase_module::free_mint_nft
  const freeMintNFT = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet.");
      return;
    }
    try {
      const price = Number(100);
      
      setLoading(true);
      const tx = new Transaction();
      const imageUrlBytes = Array.from(new TextEncoder().encode(nftForm.nftUrl));
      //const coin = coinWithBalance({ balance: 100 }); // 1 SUI
      const attributesArray = nftForm.nftAttributes
        .split(',')
        .map(attr => attr.trim())
        .filter(attr => attr);

      tx.moveCall({
        target: `${PACKAGE_ID}::hashcase_module::free_mint_nft`,
        arguments: [
          // Collection object from which the NFT is minted
          tx.object(nftForm.collectionId),
          tx.pure.string(nftForm.nftName),
          tx.pure.string(nftForm.nftDescription),
          tx.pure.vector("u8",imageUrlBytes),
          tx.pure.vector("string",attributesArray)
        ]
      });

      await signAndExecute({ transaction: tx },{
        onSuccess: (result) => {
          console.log('Collection created:', result);
          setDigest(result.digest);
        }
      });

      setNftForm({
        collectionId: '',
        nftName: '',
        nftDescription: '',
        nftUrl: '',
        nftAttributes: ''
      });
    } catch (error) {
      console.error('Error free minting NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function For Fixed Price Mint
  const fixedMint = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet.");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64("0")]);
      //const coin = coinWithBalance({ balance: 100 });
      tx.moveCall({
        target: `${PACKAGE_ID}::hashcase_module::fixed_price_mint_nft`,
        arguments: [
          tx.object("0x50d6495977b59a1bed5d68c85edc19e72ce3c971c9d0c333de19facb1c0ff7c0"), //considering a Obj but will input it afterwards
          payment,
          // Collection object that holds the NFT
          tx.pure.string(claimForm.collectionId),
          // NFT ID to claim, passed as a pure value
          //tx.pure.string(claimForm.nftId),
          tx.pure.u64(0)
        ]
      });

      await signAndExecute({ transaction: tx });

      // setClaimForm({
      //   collectionId: '',
      //   nftId: ''
      // });
    } catch (error) {
      console.error('Error claiming NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  const claim = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet.");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::hashcase_module::claim_nft`,
        arguments: [
          tx.object(claimForm.collectionId), //considering a Obj but will input it afterwards
          tx.object(claimForm.nftId),
        ]
      });

      await signAndExecute({ transaction: tx });

      // setClaimForm({
      //   collectionId: '',
      //   nftId: ''
      // });
    } catch (error) {
      console.error('Error claiming NFT:', error);
    } finally {
      setLoading(false);
    }
  };


  const Update = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet.");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      //const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64("0")]);
      //const coin = coinWithBalance({ balance: 100 });
      const imageUrlBytes = Array.from(new TextEncoder().encode(nftForm.nftUrl));
      const attributesArray = nftForm.nftAttributes
        .split(',')
        .map(attr => attr.trim())
        .filter(attr => attr);
    
      tx.moveCall({
        target: `${PACKAGE_ID}::hashcase_module::update_nft_metadata`,
        arguments: [
          tx.object('0xf072025cb6ad9b58beafa3ad45db1f1a32bc0369e88e273fa5ead8c21858ea2d'),
          tx.object('0x1c804e2bf17d442d1498667939e7dd350e7bcaf10284a313391b7e1032518cd4'),
          tx.pure.string(nftForm.nftName),
          tx.pure.string(nftForm.nftDescription),
          tx.pure.vector('u8',imageUrlBytes),
          tx.pure.vector('string', attributesArray)
        ]
      });

      await signAndExecute({ transaction: tx });

      // setClaimForm({
      //   collectionId: '',
      //   nftId: ''
      // });
    } catch (error) {
      console.error('Error claiming NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-6">Hashcase NFT Manager</h1>
        <ConnectButton />
        <hr className="my-4" />

        {/* Create Collection Form */}
        <h2 className="text-2xl font-semibold mb-4">Create Collection</h2>
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">OwnerCap Object ID</label>
            <input
              type="text"
              name="ownerCapId"
              value={collectionForm.ownerCapId}
              onChange={handleCollectionChange}
              className="w-full p-2 border rounded"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Collection Name</label>
            <input
              type="text"
              name="collectionName"
              value={collectionForm.collectionName}
              onChange={handleCollectionChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Collection Description</label>
            <textarea
              name="collectionDescription"
              value={collectionForm.collectionDescription}
              onChange={handleCollectionChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mint Type (0: Free, 1: Fixed, 2: Dynamic)</label>
            <input
              type="number"
              name="mintType"
              value={collectionForm.mintType}
              onChange={handleCollectionChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Base Mint Price</label>
            <input
              type="number"
              name="baseMintPrice"
              value={collectionForm.baseMintPrice}
              onChange={handleCollectionChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isOpenEdition"
                checked={collectionForm.isOpenEdition}
                onChange={handleCollectionChange}
                className="form-checkbox"
              />
              <span className="ml-2">Is Open Edition?</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Supply</label>
            <input
              type="number"
              name="maxSupply"
              value={collectionForm.maxSupply}
              onChange={handleCollectionChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isDynamic"
                checked={collectionForm.isDynamic}
                onChange={handleCollectionChange}
                className="form-checkbox"
              />
              <span className="ml-2">Is Dynamic?</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isClaimable"
                checked={collectionForm.isClaimable}
                onChange={handleCollectionChange}
                className="form-checkbox"
              />
              <span className="ml-2">Is Claimable?</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Base Image URL</label>
            <input
              type="text"
              name="baseImageUrl"
              value={collectionForm.baseImageUrl}
              onChange={handleCollectionChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Base Attributes (comma separated)</label>
            <input
              type="text"
              name="baseAttributes"
              value={collectionForm.baseAttributes}
              onChange={handleCollectionChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={createCollection}
            disabled={loading || isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Collection...' : 'Create Collection'}
          </button>
        </div>

        <hr className="my-4" />

        {/* Free Mint NFT Form */}
        <h2 className="text-2xl font-semibold mb-4">Free Mint NFT</h2>
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Collection Object ID</label>
            <input
              type="text"
              name="collectionId"
              value={nftForm.collectionId}
              onChange={handleNFTChange}
              className="w-full p-2 border rounded"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NFT Name</label>
            <input
              type="text"
              name="nftName"
              value={nftForm.nftName}
              onChange={handleNFTChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NFT Description</label>
            <textarea
              name="nftDescription"
              value={nftForm.nftDescription}
              onChange={handleNFTChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NFT Image URL</label>
            <input
              type="text"
              name="nftUrl"
              value={nftForm.nftUrl}
              onChange={handleNFTChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NFT Attributes (comma separated)</label>
            <input
              type="text"
              name="nftAttributes"
              value={nftForm.nftAttributes}
              onChange={handleNFTChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={Update}
            disabled={loading || isPending}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Minting NFT...' : 'Free Mint NFT'}
          </button>
        </div>

        <hr className="my-4" />

        {/* Claim NFT Form */}
        <h2 className="text-2xl font-semibold mb-4">Claim NFT</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Collection Object ID</label>
            <input
              type="text"
              name="collectionId"
              value={claimForm.collectionId}
              onChange={handleClaimChange}
              className="w-full p-2 border rounded"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NFT ID</label>
            <input
              type="text"
              name="nftId"
              value={claimForm.nftId}
              onChange={handleClaimChange}
              className="w-full p-2 border rounded"
              placeholder="0x..."
            />
          </div>
          <button
            onClick={claim}
            disabled={loading || isPending}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Claiming NFT...' : 'Claim NFT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
