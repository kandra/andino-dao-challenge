// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
require("dotenv").config();

const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

var MINTER_ROLE = getRole("MINTER_ROLE");

// Publicar en Mumbai
async function deployMumbai() {
  console.log("Deployando el contrato...");

  // utiliza deploySC
  var contratoPoap = await deploySCNoUp("PoapContract");

  // utiliza printAddress
  console.log("Addresses...")
  var implementacionContrato = await contratoPoap.getAddress();
  console.log("Address: " + implementacionContrato);

  // utiliza ex

  console.log("Esperando confirmaciones...");
  var res = await contratoPoap.waitForDeployment();
  await res.deploymentTransaction().wait(10);
  console.log("Confirmaciones recibidas!");

  // utiliza verify
  console.log("Verificando...")
  await verify(implementacionContrato, "PublicSale");
}


deployMumbai()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });