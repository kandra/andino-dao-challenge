const { ethers } = require("hardhat");
const { updateProxyImplementation } = require("../utils"); // O cualquier función necesaria para la actualización

async function deployMumbai(newImplementationAddress) {
  console.log("Actualizando la dirección de implementación en el contrato PoapContractProxy...");

  // Suponiendo que tienes acceso al contrato proxy y su dirección
  const proxyAddress = "0x8AA807dFCF80FE046ABEeC39c391d5931f63d616"; // Reemplaza con la dirección real del contrato proxy
  const PoapContractProxy = await ethers.getContractAt("PoapContractProxy",proxyAddress ); // Reemplaza "PoapContractProxy" por el nombre real de tu contrato proxy

  // Actualizar la dirección de la implementación en el contrato proxy
  await updateProxyImplementation(PoapContractProxy, newImplementationAddress); // Función para actualizar, reemplaza con tu propia lógica

  console.log("¡Actualización de la implementación exitosa en el contrato PoapContractProxy!");
}



deployMumbai()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });


