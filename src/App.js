import React, { useState } from 'react';
import { ethers } from 'ethers';

const App = () => {
  // --- Existing State ---
  const [account, setAccount] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [functionPayload, setFunctionPayload] = useState('');
  const [message, setMessage] = useState('');

  // --- New State for Typed Data Signing ---
  const [typedData, setTypedData] = useState('');
  const [signature, setSignature] = useState('');

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setMessage('MetaMask connected!');
      } catch (error) {
        console.error('Error connecting MetaMask:', error);
        setMessage('Failed to connect MetaMask.');
      }
    } else {
      setMessage('MetaMask is not installed!');
    }
  };

  const executeTransaction = async () => {
    if (!account || !contractAddress || !functionPayload) {
      setMessage('Ensure MetaMask is connected and all fields are filled.');
      return;
    }
    setMessage('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = {
        to: contractAddress,
        data: functionPayload,
      };

      const transactionResponse = await signer.sendTransaction(tx);
      await transactionResponse.wait();
      setMessage(`Transaction successful! Hash: ${transactionResponse.hash}`);
    } catch (error) {
      console.error('Error executing transaction:', error);
      setMessage(`Transaction failed: ${error.message}`);
    }
  };

  // --- New Function for Signing Typed Data ---
  const signTypedData = async () => {
    if (!account || !typedData) {
      setMessage('Ensure MetaMask is connected and the typed data field is filled.');
      return;
    }
    setMessage('');
    setSignature('');

    try {
        const parsedData = JSON.parse(typedData);

        // This is the raw method that MetaMask understands
        const newSignature = await window.ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [account, JSON.stringify(parsedData)], // The second param must be a JSON string
        });

        setSignature(newSignature);
        setMessage('Data signed successfully!');
    } catch (error) {
        console.error('Error signing typed data:', error);
        setMessage(`Signing failed: ${error.message}`);
    }
  };

  // --- New Function to Copy Signature to Clipboard ---
  const copyToClipboard = () => {
    navigator.clipboard.writeText(signature);
    setMessage('Signature copied to clipboard!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Web3 Interaction Helper</h1>

      {!account ? (
        <button
          onClick={connectMetaMask}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', display: 'block', margin: '20px auto' }}
        >
          Connect MetaMask
        </button>
      ) : (
        <p style={{ textAlign: 'center' }}><strong>Connected account:</strong> {account}</p>
      )}

      {message && <p style={{ marginTop: '20px', color: 'blue', textAlign: 'center' }}>{message}</p>}

      <hr style={{ margin: '40px 0' }} />

      {/* --- Existing Transaction UI --- */}
      <div style={{ textAlign: 'center' }}>
        <h2>Execute Raw Transaction</h2>
        <div style={{ margin: '20px' }}>
          <input
            type="text"
            placeholder="Enter contract address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            style={{ width: '90%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        <div style={{ margin: '20px' }}>
          <input
            type="text"
            placeholder="Enter encoded function data (e.g., 0x...)"
            value={functionPayload}
            onChange={(e) => setFunctionPayload(e.target.value)}
            style={{ width: '90%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        <button
          onClick={executeTransaction}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
          disabled={!account}
        >
          Execute Transaction
        </button>
      </div>

      <hr style={{ margin: '40px 0' }} />

      {/* --- New Typed Data Signing UI --- */}
      <div style={{ textAlign: 'center' }}>
        <h2>Sign Typed Data (EIP-712)</h2>
        <p>Paste the JSON object containing the domain, types, and value.</p>
        <div style={{ margin: '20px' }}>
          <textarea
            placeholder='e.g., { "domain": {...}, "types": {...}, "value": {...} }'
            value={typedData}
            onChange={(e) => setTypedData(e.target.value)}
            style={{ width: '90%', padding: '10px', fontSize: '14px', height: '150px', fontFamily: 'monospace' }}
          />
        </div>
        <button
          onClick={signTypedData}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
          disabled={!account}
        >
          Sign Data
        </button>
      </div>
      
      {signature && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <h3>Signature Result:</h3>
          <code style={{
            display: 'block',
            padding: '15px',
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '5px',
            wordWrap: 'break-word',
            textAlign: 'left',
            fontFamily: 'monospace'
          }}>
            {signature}
          </code>
          <button
            onClick={copyToClipboard}
            style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Copy Signature
          </button>
        </div>
      )}
    </div>
  );
};

export default App;