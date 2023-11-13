const express = require('express');
const { ethers, AlchemyProvider } = require('ethers');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());

// Setup Ethereum provider using Alchemy
//const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL);
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL);

// Relayer's wallet
const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

// Contract setup
//const contractABI = require('./contractABI.json');
const contractABI = [
{
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }];
const contractAddress = '0xadC7cd04E6693C816ef8d314e526A5684f13D752';
const contract = new ethers.Contract(contractAddress, contractABI, relayerWallet);

// Route to handle meta-transactions
app.get('/relay', async (req, res) => {
    try {
        // const { to, tokenId } = req.body;
        // Validate and process the transaction
        // ...
        


        const tx = await contract.safeMint('0x95cA121498fb98A6DD5EB88b81463cA0f74aC214', 124);        

        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Hello World! 123')
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
