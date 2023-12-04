// require("@nomicfoundation/hardhat-web3");
// require("@nomiclabs/hardhat-ethers");
// require("@nomiclabs/hardhat-ipfs");

require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    mumbai: {
      url: process.env.MUMBAI_TESNET_URL,
      accounts: [process.env.ADMIN_ACCOUNT_PRIVATE_KEY],
      timeout: 0,
      gas: "auto",
      gasPrice: "auto",
    },
    // Puedes agregar configuraciones para otras redes aquí, como ropsten, rinkeby, etc.
  },
  ipfs: {
    // Configuraciones específicas de IPFS si es necesario
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },
}