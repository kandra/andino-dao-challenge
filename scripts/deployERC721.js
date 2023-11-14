const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Contract = await hre.ethers.getContractFactory("NFTContract");
  const contract = await Contract.deploy();
  await contract.deployed();

  // Cargar saldo al contrato (por ejemplo, 1 Ether)
  const value = hre.ethers.utils.parseEther("1"); // 1 Ether en wei // SE CARGA EL SALDO NECESARIO PARA EL EVENTO ESPECIFICO O NO.
  await deployer.sendTransaction({ to: contract.address, value });

  console.log("Contrato desplegado en:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
