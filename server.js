const express = require('express');
const { ethers, AlchemyProvider } = require('ethers');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());

// Setup Ethereum provider using Alchemy
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL);

// Relayer's wallet
const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

// Contract setup
const contractABI = [
  {
    "inputs": [
        {
            "internalType": "address",
            "name": "_account",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "_eventId",
            "type": "uint256"
        }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
  "inputs": [],
  "name": "getEvents",
  "outputs": [
      {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
      }
  ],
  "stateMutability": "view",
  "type": "function"
}];
const contractAddress = '0x8AA807dFCF80FE046ABEeC39c391d5931f63d616';
const contract = new ethers.Contract(contractAddress, contractABI, relayerWallet);

// Route to handle meta-transactions
app.get('/mint/:to/:tokenId', async (req, res) => {
    try {
      // const { to, tokenId } = req.body;
      const { to, tokenId } = req.params;
      console.log("to: " + to);
      console.log("tokenId: " + tokenId);

      // TODO: Validate the event exists
      var events = await contract.getEvents();
      if(events.indexOf(BigInt(tokenId))<0){
        throw new Error("Event ID doesn't exist");
      }

      const tx = await contract.mint(to, tokenId);        
      res.json({ success: true, txHash: tx.hash });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/', (req, res) => {
  res.redirect('https://andino.vercel.app/mint')
});
const PORT = process.env.PORT || 3000; // Cambia el número del puerto aquí
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
