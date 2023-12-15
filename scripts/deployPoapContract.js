// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

const hre = require("hardhat");
require("dotenv").config();

const {
  getRole,
  verify,
 deploySCNoUp,
} = require("../utils");

var MINTER_ROLE = getRole("MINTER_ROLE");

// Publicar en Mumbai
async function deployMumbai() {
  console.log("Desplegando el contrato...");

  // Despliegue de una nueva versión del contrato
  var newPoapContract = await deploySCNoUp("PoapContract");

  // Obteniendo la dirección de la nueva implementación
  var newImplementationAddress = await newPoapContract.getAddress();
  console.log("Dirección de la nueva implementación: " + newImplementationAddress);

  // Esperando confirmaciones y verificando
  console.log("Esperando confirmaciones...");
  var res = await newPoapContract.waitForDeployment();
  await res.deploymentTransaction().wait(10);
  console.log("Confirmaciones recibidas!");

  console.log("Verificando la nueva implementación...");
  await verify(newImplementationAddress, "NombreDelContrato");
}

deployMumbai()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });


  
