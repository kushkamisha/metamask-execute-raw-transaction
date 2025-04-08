import React, { useState } from 'react';
import { ethers } from 'ethers';

const App = () => {
  const [account, setAccount] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [functionPayload, setFunctionPayload] = useState('');
  const [message, setMessage] = useState('');

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

      // Construct and send the transaction
      const tx = {
        to: contractAddress,
        data: functionPayload,
      };

      const transactionResponse = await signer.sendTransaction(tx);
      await transactionResponse.wait();
      setMessage(`Transaction successful! Hash: ${transactionResponse.hash}`);
    } catch (error) {
      console.error('Error executing transaction:', error);
      setMessage('Transaction failed. Check the console for details.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial' }}>
      <h1>Execute Contract Transaction</h1>

      {!account && (
        <button
          onClick={connectMetaMask}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Connect MetaMask
        </button>
      )}

      {account && <p>Connected account: {account}</p>}

      <div style={{ margin: '20px' }}>
        <input
          type="text"
          placeholder="Enter contract address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          style={{ width: '70%', padding: '10px', fontSize: '16px' }}
        />
      </div>

      <div style={{ margin: '20px' }}>
        <input
          type="text"
          placeholder="Enter encoded function data"
          value={functionPayload}
          onChange={(e) => setFunctionPayload(e.target.value)}
          style={{ width: '70%', padding: '10px', fontSize: '16px' }}
        />
      </div>

      <button
        onClick={executeTransaction}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Execute Transaction
      </button>

      {message && <p style={{ marginTop: '20px', color: 'blue' }}>{message}</p>}
    </div>
  );
};

export default App;