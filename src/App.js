import React, { useState } from 'react';
import { ethers } from 'ethers';

const API_KEYS = {
  1: process.env.REACT_APP_ETHERSCAN_API_KEY, // Ethereum
  42161: process.env.REACT_APP_ARBISCAN_API_KEY, // Arbitrum
};

const API_BASE_URLS = {
  1: 'https://api.etherscan.io/api',
  42161: 'https://api.arbiscan.io/api',
};

const App = () => {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [abi, setAbi] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [functionPayload, setFunctionPayload] = useState('');
  const [isReadOnlyFunction, setIsReadOnlyFunction] = useState(false);
  const [message, setMessage] = useState('');

  // Function to connect MetaMask and fetch network
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setNetwork(`${network.name} (${network.chainId})`);
        setNetworkId(network.chainId);

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

  // Function to fetch ABI from the corresponding blockchain explorer
  const fetchAbi = async () => {
    if (!contractAddress) {
      setMessage('Please enter a contract address.');
      return;
    }

    if (!API_KEYS[networkId] || !API_BASE_URLS[networkId]) {
      setMessage('Unsupported network. Please connect to Ethereum or Arbitrum.');
      return;
    }

    try {
      setMessage('Fetching contract ABI...');
      const response = await fetch(
        `${API_BASE_URLS[networkId]}?module=contract&action=getabi&address=${contractAddress}&apikey=${API_KEYS[networkId]}`
      );
      const data = await response.json();

      if (data.status === '1') {
        const abiJson = JSON.parse(data.result);
        setAbi(abiJson);
        setMessage('ABI fetched successfully!');
      } else {
        setMessage('Failed to fetch ABI. Ensure the contract address is correct.');
      }
    } catch (error) {
      console.error('Error fetching ABI:', error);
      setMessage('Failed to fetch ABI. Check the console for details.');
    }
  };

  // Function to handle function selection
  const handleFunctionSelection = (funcName) => {
    setSelectedFunction(funcName);

    // Determine if the function is read-only (stateMutability: "view" or "pure")
    const func = abi.find((item) => item.name === funcName);
    setIsReadOnlyFunction(func && (func.stateMutability === 'view' || func.stateMutability === 'pure'));
  };

  // Function to execute selected contract function
  const executeContractFunction = async () => {
    if (!account || !window.ethereum) {
      setMessage('Please connect MetaMask first.');
      return;
    }

    if (!contractAddress || !selectedFunction || !abi.length) {
      setMessage('Ensure contract address, ABI, and function are properly set.');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, isReadOnlyFunction ? provider : signer);

      if (isReadOnlyFunction) {
        // Call the read-only function
        const result = await contract[selectedFunction](...functionPayload.split(','));
        setMessage(`Function executed successfully! Result: ${result}`);
      } else {
        // Execute a write function
        const tx = await contract[selectedFunction](...functionPayload.split(','));
        setMessage(`Transaction sent! Hash: ${tx.hash}`);
      }
    } catch (error) {
      console.error('Error executing function:', error);
      setMessage('Function execution failed. Check the console for details.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial' }}>
      <h1>MetaMask Contract Interaction</h1>

      {/* Connect MetaMask Button */}
      {!account && (
        <button
          onClick={connectMetaMask}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Connect MetaMask
        </button>
      )}

      {account && <p>Connected account: {account}</p>}
      {network && <p>Connected network: {network}</p>}

      {/* Contract Address Input */}
      <div style={{ margin: '20px' }}>
        <input
          type="text"
          placeholder="Enter contract address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          style={{ width: '70%', padding: '10px', fontSize: '16px' }}
        />
        <button
          onClick={fetchAbi}
          style={{ marginLeft: '10px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Fetch ABI
        </button>
      </div>

      {/* Dropdown for Contract Functions */}
      {abi.length > 0 && (
        <div style={{ margin: '20px' }}>
          <select
            onChange={(e) => handleFunctionSelection(e.target.value)}
            style={{ padding: '10px', fontSize: '16px' }}
          >
            <option value="">Select a function</option>
            {abi
              .filter((item) => item.type === 'function')
              .map((func, index) => (
                <option key={index} value={func.name}>
                  {func.name} ({func.stateMutability})
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Function Payload Input */}
      {selectedFunction && (
        <div style={{ margin: '20px' }}>
          <input
            type="text"
            placeholder="Enter function arguments (comma-separated)"
            value={functionPayload}
            onChange={(e) => setFunctionPayload(e.target.value)}
            style={{ width: '70%', padding: '10px', fontSize: '16px' }}
          />
        </div>
      )}

      {/* Execute Button */}
      {selectedFunction && (
        <button
          onClick={executeContractFunction}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          {isReadOnlyFunction ? 'Call Function' : 'Execute Function'}
        </button>
      )}

      {/* Message */}
      {message && <p style={{ marginTop: '20px', color: 'blue' }}>{message}</p>}
    </div>
  );
};

export default App;