import React, { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import {
  useSignAndExecuteTransaction,
  ConnectButton,
  useCurrentAccount
} from '@mysten/dapp-kit';
import './mainpage.css';

const MainPage = () => {
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
    adminCapId: '',
    registry: '',
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
    adminCapId: '',
    collectionId: '',
    recipient: '',
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

  const [fixedMintForm, setFixedMintForm] = useState({
    collectionId: '',
    name: '',
    description: '',
    imageUrl: '',
    attributes: '',
    payment: ''
  });

  const [dynamicMintForm, setDynamicMintForm] = useState({
    collectionId: '',
    name: '',
    description: '',
    imageUrl: '',
    attributes: '',
    mintPrice: '',
    payment: ''
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

  const handleFixedMintChange = (e) => {
    setFixedMintForm({ ...fixedMintForm, [e.target.name]: e.target.value });
  };

  const handleDynamicMintChange = (e) => {
    setDynamicMintForm({ ...dynamicMintForm, [e.target.name]: e.target.value });
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
          tx.object(collectionForm.adminCapId),
          tx.object(collectionForm.registry),
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
      // setCollectionForm({
      //   adminCapId: '',
      //   name: '',
      //   description: '',
      //   mintType: '0',
      //   baseMintPrice: '0',
      //   isOpenEdition: false,
      //   maxSupply: '0',
      //   isDynamic: false,
      //   isClaimable: false,
      //   baseImageUrl: '',
      //   baseAttributes: ''
      // });
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
        target: `${packageId}::hashcase_module::admin_free_mint_nft`,
        arguments: [
          tx.object(nftForm.adminCapId),
          tx.object(nftForm.collectionId),
          tx.pure.string(nftForm.name),
          tx.pure.string(nftForm.description),
          tx.pure.vector('u8', imageUrlBytes),
          tx.pure.vector('string', attributesArray),
          tx.pure.address(nftForm.recipient || currentAccount.address)
        ]
      });

      await signAndExecute({ transaction: tx });
      setNftForm({
        adminCapId: '',
        collectionId: '',
        recipient: '',
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


  const freeMintNFTSponsored = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    if (!nftForm.collectionId || !nftForm.name || !nftForm.description || !nftForm.imageUrl || !nftForm.attributes) {
      alert("Please fill in all NFT details.");
      return;
    }

    // Frontend SuiClient - Insecure for sponsor operations
    const client = new SuiClient({
      url: 'https://fullnode.testnet.sui.io:443',
    });

    // EXTREMELY INSECURE: Sponsor's private key in frontend code
    const SPONSOR_PRIVATE_KEY = 'suiprivkey1qruhepnm58td4px3pln40khgzxj28ftzkc3c796syhpzv9v95kqcvkpyfqz';
    const sponsorKeypair = Ed25519Keypair.fromSecretKey(SPONSOR_PRIVATE_KEY);
    const sponsorAddress = sponsorKeypair.getPublicKey().toSuiAddress();

    try {
      setLoading(true);
      const tx = new Transaction();

      // FIX 1: userAddress was not defined. Use currentAccount.address
      tx.setSender(currentAccount.address); 
      tx.setGasOwner(sponsorAddress);

      const referenceGasPrice = await client.getReferenceGasPrice();
      if (referenceGasPrice === undefined) {
          throw new Error('Failed to get reference gas price.');
      }
      tx.setGasPrice(referenceGasPrice);

      const gasCoins = await client.getCoins({ owner: sponsorAddress, coinType: '0x2::sui::SUI' });
      if (!gasCoins.data || gasCoins.data.length === 0) {
        throw new Error('Sponsor has no gas coins.');
      }
      const gasCoin = gasCoins.data.find(coin => BigInt(coin.balance) >= BigInt(20000000)) || gasCoins.data[0];
      if (!gasCoin) {
        throw new Error('Sponsor does not have a suitable gas coin.');
      }
      tx.setGasPayment([{ objectId: gasCoin.coinObjectId, version: gasCoin.version, digest: gasCoin.digest }]);
      tx.setGasBudget(20000000);

      // FIX 2: imageUrl was not defined. Use nftForm.imageUrl
      const imageUrlBytes = Array.from(new TextEncoder().encode(nftForm.imageUrl)); 
      const attributesArray = nftForm.attributes
        .split(',')
        .map(attr => attr.trim())
        .filter(Boolean);
      
      tx.moveCall({
        target: `${packageId}::hashcase_module::admin_free_mint_nft`,
        arguments: [
          tx.object(nftForm.collectionId), // Use the full ObjectRef
          tx.pure.string(nftForm.name),
          tx.pure.string(nftForm.description),
          tx.pure.vector('u8', imageUrlBytes),
          tx.pure.vector('string', attributesArray)
        ]
      });

      // Build the transaction bytes. The `client` here is the frontend client.
      const txBuildBytes = await tx.build({ client }); // Bytes for sponsor to sign

      // Sponsor signs these exact bytes on the frontend
      const { signature: sponsorSerializedSignature } = await sponsorKeypair.signTransaction(txBuildBytes);

      await signAndExecute(
        {
          transaction: tx,
          signature: sponsorSerializedSignature,
          options: {
            showEvents: true,
            showObjectChanges: true,
          },
        },
        {
          onSuccess: (result) => {
            console.log('Sponsored Free Mint NFT successful:', result);
            // Reset form, etc.
            //setNftForm({ collectionId: '', name: '', description: '', imageUrl: '', attributes: '' });
            alert('NFT minted successfully (sponsored)!');
          },
          onError: (error) => {
            console.error('Sponsored Free Mint NFT failed:', error);
            alert(`Sponsored Free Mint NFT failed: ${error.message || error}`);
          },
        }
      );
    } catch (error) {
      console.error('Error in sponsored freeMintNFT process:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSponsorMintAndTransfer = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet (this will be the recipient address).");
      return;
    }
    if (!nftForm.collectionId || !nftForm.name.trim() || !nftForm.description.trim() || !nftForm.imageUrl.trim() || !nftForm.attributes.trim()) {
      alert("Please fill in all NFT details.");
      return;
    }

    // This client is used by the sponsor to execute transactions
    const client = new SuiClient({
      url: 'https://fullnode.testnet.sui.io:443', // Or your target network
    });

    // EXTREMELY INSECURE: Sponsor's private key in frontend code. For testing/demo only.
    const SPONSOR_PRIVATE_KEY = 'suiprivkey1qruhepnm58td4px3pln40khgzxj28ftzkc3c796syhpzv9v95kqcvkpyfqz'; // Replace with your actual testnet private key
    const sponsorKeypair = Ed25519Keypair.fromSecretKey(SPONSOR_PRIVATE_KEY);
    const sponsorAddress = sponsorKeypair.getPublicKey().toSuiAddress();

    try {
      setLoading(true);
      console.log("Sponsor Address:", sponsorAddress);
      console.log("User (Recipient) Address:", currentAccount.address);

      // --- Transaction 1: Sponsor Mints NFT to Self ---
      console.log("Step 1: Sponsor minting NFT to self...");
      const txMint = new Transaction();
      txMint.setSender(sponsorAddress);

      const referenceGasPriceMint = await client.getReferenceGasPrice();
      if (referenceGasPriceMint === null || referenceGasPriceMint === undefined) {
        throw new Error('Failed to get reference gas price for minting.');
      }
      txMint.setGasPrice(referenceGasPriceMint);

      const gasCoinsMint = await client.getCoins({ owner: sponsorAddress, coinType: '0x2::sui::SUI' });
      if (!gasCoinsMint.data || gasCoinsMint.data.length === 0) {
        throw new Error('Sponsor has no SUI gas coins for minting.');
      }
      const mintGasCoin = gasCoinsMint.data.find(coin => BigInt(coin.balance) >= BigInt(30000000)) || gasCoinsMint.data[0];
      if (!mintGasCoin) {
        throw new Error('Sponsor does not have a suitable gas coin for minting.');
      }
      txMint.setGasPayment([{ objectId: mintGasCoin.coinObjectId, version: mintGasCoin.version, digest: mintGasCoin.digest }]);
      txMint.setGasBudget(30000000); // Adjust gas budget as needed

      const imageUrlBytes = Array.from(new TextEncoder().encode(nftForm.imageUrl));
      const attributesArray = nftForm.attributes.split(',').map(attr => attr.trim()).filter(Boolean);

      txMint.moveCall({
        target: `${packageId}::hashcase_module::admin_free_mint_nft`, // Ensure this is your correct module and function
        arguments: [
          txMint.object(nftForm.collectionId),
          txMint.pure.string(nftForm.name),
          txMint.pure.string(nftForm.description),
          txMint.pure.vector('u8', imageUrlBytes),
          txMint.pure.vector('string', attributesArray),
        ],
      });

      const mintResult = await client.signAndExecuteTransaction({
        transaction: txMint,
        signer: sponsorKeypair,
        options: {
          showObjectChanges: true,
          showEffects: true,
        },
      });

      console.log("Mint transaction result:", mintResult);
      if (mintResult.effects?.status?.status !== 'success') {
        throw new Error(`Minting transaction failed: ${mintResult.effects?.status?.error}`);
      }
      
      let newlyMintedNftId = null;
      const nftObjectTypePattern = `${packageId}::hashcase_module::NFT`;
      
      if (mintResult.objectChanges) {
        for (const change of mintResult.objectChanges) {
          if (change.type === 'created' && 
              change.objectType.startsWith(nftObjectTypePattern) &&
              change.owner.AddressOwner === sponsorAddress) {
            newlyMintedNftId = change.objectId;
            console.log("Found newly minted NFT ID:", newlyMintedNftId, "with type:", change.objectType);
            break;
          }
        }
      }

      if (!newlyMintedNftId) {
        console.error("Could not identify the newly minted NFT from objectChanges. Please inspect mintResult:", mintResult);
        throw new Error("Could not find the newly minted NFT ID. Check console for details and ensure nftObjectTypePattern is correct.");
      }
      
      // --- Transaction 2: Sponsor Transfers NFT to User ---
      console.log(`Step 2: Sponsor transferring NFT ${newlyMintedNftId} to user ${currentAccount.address}...`);
      // Introduce a delay to allow the network to process the mint transaction
      // and ensure the object is available for the next transaction.
      console.log("Waiting for 5 seconds before attempting transfer...");
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second pause
      const nftToTransferInfo = await client.getObject({
        id: newlyMintedNftId,
        options: { showContent: true, showOwner: true }, // Fetch content for version/digest
      });

      if (!nftToTransferInfo.data || !nftToTransferInfo.data.version || !nftToTransferInfo.data.digest) {
          throw new Error(`Could not get complete object data (version/digest) for the minted NFT ID: ${newlyMintedNftId}`);
      }

      const txTransfer = new Transaction();
      txTransfer.setSender(sponsorAddress);

      const referenceGasPriceTransfer = await client.getReferenceGasPrice();
      if (referenceGasPriceTransfer === null || referenceGasPriceTransfer === undefined) {
        throw new Error('Failed to get reference gas price for transfer.');
      }
      txTransfer.setGasPrice(referenceGasPriceTransfer);
      
      const gasCoinsTransfer = await client.getCoins({ owner: sponsorAddress, coinType: '0x2::sui::SUI' });
      if (!gasCoinsTransfer.data || gasCoinsTransfer.data.length === 0) {
        throw new Error('Sponsor has no SUI gas coins for transfer.');
      }
      const transferGasCoin = gasCoinsTransfer.data.find(coin => BigInt(coin.balance) >= BigInt(20000000)) || gasCoinsTransfer.data[0];
      if (!transferGasCoin) {
        throw new Error('Sponsor does not have a suitable gas coin for transfer.');
      }
      txTransfer.setGasPayment([{ objectId: transferGasCoin.coinObjectId, version: transferGasCoin.version, digest: transferGasCoin.digest }]);
      txTransfer.setGasBudget(20000000);

      txTransfer.transferObjects([txTransfer.object(newlyMintedNftId)], txTransfer.pure.address(currentAccount.address));

      const transferResult = await client.signAndExecuteTransaction({
        transaction: txTransfer,
        signer: sponsorKeypair,
        options: {
          showEffects: true,
        },
      });

      console.log("Transfer transaction result:", transferResult);
      if (transferResult.effects?.status?.status !== 'success') {
        throw new Error(`Transferring NFT failed: ${transferResult.effects?.status?.error}`);
      }

      alert('NFT minted and transferred to your address successfully (sponsored)!');

    } catch (error) {
      console.error('Error in sponsor mint and transfer process:', error);
      alert(`Error: ${error.message}`);
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

  const fixedPriceMintNFT = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      // instead of 100 put the real price of NFT
      const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(100)]);
      const imageUrlBytes = Array.from(new TextEncoder().encode(fixedMintForm.imageUrl));
      const attributesArray = fixedMintForm.attributes
        .split(',')
        .map(attr => attr.trim())
        .filter(Boolean);
      tx.moveCall({
        target: `${packageId}::hashcase_module::admin_fixed_price_mint_nft`,
        arguments: [
          tx.object(fixedMintForm.collectionId),
          payment,
          tx.pure.string(fixedMintForm.name),
          tx.pure.string(fixedMintForm.description),
          tx.pure.vector('u8', imageUrlBytes),
          tx.pure.vector('string', attributesArray)
        ]
      });

      tx.transferObjects([payment], tx.pure.address(currentAccount.address));

      await signAndExecute({ transaction: tx });
      setFixedMintForm({
        collectionId: '',
        name: '',
        description: '',
        imageUrl: '',
        attributes: '',
        payment: ''
      });
    } catch (error) {
      console.error('Error minting fixed price NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  const dynamicPriceMintNFT = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      // here price is being put dynamically
      const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(dynamicMintForm.mintPrice)]);
      const imageUrlBytes = Array.from(new TextEncoder().encode(dynamicMintForm.imageUrl));
      const attributesArray = dynamicMintForm.attributes
        .split(',')
        .map(attr => attr.trim())
        .filter(Boolean);

      tx.moveCall({
        target: `${packageId}::hashcase_module::admin_dynamic_price_mint_nft`,
        arguments: [
          tx.object(dynamicMintForm.collectionId),
          payment,
          tx.pure.string(dynamicMintForm.name),
          tx.pure.string(dynamicMintForm.description),
          tx.pure.vector('u8', imageUrlBytes),
          tx.pure.vector('string', attributesArray),
          tx.pure.u64(Number(dynamicMintForm.mintPrice)) // user-specified price
        ]
      });

      tx.transferObjects([payment], tx.pure.address(currentAccount.address));

      await signAndExecute({ transaction: tx });
      setDynamicMintForm({
        collectionId: '',
        name: '',
        description: '',
        imageUrl: '',
        attributes: '',
        mintPrice: '',
        payment: ''
      });
    } catch (error) {
      console.error('Error minting dynamic price NFT:', error);
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
          name="adminCapId"
          value={collectionForm.adminCapId}
          onChange={handleCollectionChange}
          placeholder="Enter Owner Cap ID"
        />
        <label>Registry</label>
        <input
          type="text"
          name="registry"
          value={collectionForm.registry}
          onChange={handleCollectionChange}
          placeholder="Enter Registry Object ID"
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
        <label>Admin Cap ID</label>
        <input
          type="text"
          name="adminCapId"
          value={nftForm.adminCapId}
          onChange={handleNFTChange}
          placeholder="AdminCap object ID"
        />
        <label>Collection ID</label>
        <input
          type="text"
          name="collectionId"
          value={nftForm.collectionId}
          onChange={handleNFTChange}
          placeholder="Enter Collection ID"
        />
        <label>Recipient Address</label>
        <input
          type="text"
          name="recipient"
          value={nftForm.recipient}
          onChange={handleNFTChange}
          placeholder="Where to send NFT (defaults to you)"
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

      {/* Fixed Price Mint NFT */}
      <section className="form-section">
        <h2>Fixed Price Mint NFT</h2>
        <label>Collection ID</label>
        <input
          type="text"
          name="collectionId"
          value={fixedMintForm.collectionId}
          onChange={handleFixedMintChange}
          placeholder="Enter Collection ID"
        />
        <label>NFT Name</label>
        <input
          type="text"
          name="name"
          value={fixedMintForm.name}
          onChange={handleFixedMintChange}
          placeholder="Enter NFT Name"
        />
        <label>Description</label>
        <textarea
          name="description"
          value={fixedMintForm.description}
          onChange={handleFixedMintChange}
          placeholder="Enter NFT Description"
        />
        <label>Image URL</label>
        <input
          type="text"
          name="imageUrl"
          value={fixedMintForm.imageUrl}
          onChange={handleFixedMintChange}
          placeholder="Enter NFT Image URL"
        />
        <label>Attributes (comma separated)</label>
        <input
          type="text"
          name="attributes"
          value={fixedMintForm.attributes}
          onChange={handleFixedMintChange}
          placeholder="Enter NFT Attributes"
        />
        <label>Payment Amount (in MIST)</label>
        <input
          type="number"
          name="payment"
          value={fixedMintForm.payment}
          onChange={handleFixedMintChange}
          placeholder="Enter payment amount"
        />
        <button onClick={fixedPriceMintNFT} disabled={loading}>
          Fixed Price Mint NFT
        </button>
      </section>

      {/* Dynamic Price Mint NFT */}
      <section className="form-section">
        <h2>Dynamic Price Mint NFT</h2>
        <label>Collection ID</label>
        <input
          type="text"
          name="collectionId"
          value={dynamicMintForm.collectionId}
          onChange={handleDynamicMintChange}
          placeholder="Enter Collection ID"
        />
        <label>NFT Name</label>
        <input
          type="text"
          name="name"
          value={dynamicMintForm.name}
          onChange={handleDynamicMintChange}
          placeholder="Enter NFT Name"
        />
        <label>Description</label>
        <textarea
          name="description"
          value={dynamicMintForm.description}
          onChange={handleDynamicMintChange}
          placeholder="Enter NFT Description"
        />
        <label>Image URL</label>
        <input
          type="text"
          name="imageUrl"
          value={dynamicMintForm.imageUrl}
          onChange={handleDynamicMintChange}
          placeholder="Enter NFT Image URL"
        />
        <label>Attributes (comma separated)</label>
        <input
          type="text"
          name="attributes"
          value={dynamicMintForm.attributes}
          onChange={handleDynamicMintChange}
          placeholder="Enter NFT Attributes"
        />
        <label>Mint Price (in MIST)</label>
        <input
          type="number"
          name="mintPrice"
          value={dynamicMintForm.mintPrice}
          onChange={handleDynamicMintChange}
          placeholder="Enter mint price"
        />
        <label>Payment Amount (in MIST)</label>
        <input
          type="number"
          name="payment"
          value={dynamicMintForm.payment}
          onChange={handleDynamicMintChange}
          placeholder="Enter payment amount"
        />
        <button onClick={dynamicPriceMintNFT} disabled={loading}>
          Dynamic Price Mint NFT
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

export default MainPage;
