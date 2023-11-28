require("@nomicfoundation/hardhat-web3");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-ipfs");

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {},
    // Puedes agregar configuraciones para otras redes aquí, como ropsten, rinkeby, etc.
  },
  ipfs: {
    // Configuraciones específicas de IPFS si es necesario
  },
}