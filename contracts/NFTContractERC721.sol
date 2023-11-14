 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTContract is ERC721 {
    address public admin; // admin acuña nuevos POAP
    uint256 public tokenIdCounter;// lleva la cuenta del próximo ID de token disponible.
    string public baseTokenURI = "https://ipfs.io/ipfs/";
    uint256 public prepaidBalance; // Saldo prepagado en el contrato


    mapping(uint256 => bool) public isTokenMinted;//Es un mapeo que indica si un token específico ha sido acuñado o no//Evita la acuñación duplicada del mismo token.
    mapping(uint256 => string) public tokenMetadataCID;

    constructor() ERC721("PoapNFT", "POAP") {
        admin = msg.sender;
        prepaidBalance = 0; // Inicializar el saldo prepagado
    }
    

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    // Función para recargar el saldo prepagado
    function depositPrepaidFunds() external payable onlyAdmin {
        prepaidBalance += msg.value;
    }

   function mintPoap(address to, string memory metadataCID) external onlyAdmin {
    require(!isTokenMinted[tokenIdCounter], "Token already minted");
    
    // Verificar si hay suficientes fondos prepagados para cubrir la tarifa de gas
    require(prepaidBalance >= tx.gasprice * gasRequired, "Insufficient prepaid funds");
    
    _safeMint(to, tokenIdCounter);
    isTokenMinted[tokenIdCounter] = true;
    tokenMetadataCID[tokenIdCounter] = metadataCID;
    tokenIdCounter++;
    
    // Descontar la tarifa de gas del saldo prepagado
    prepaidBalance -= tx.gasprice * gasRequired;
}

    

    function bulkMintPoaps(address[] memory recipients) external onlyAdmin {// Permite al administrador acuñar múltiples Poaps a la vez, proporcionando una matriz de direcciones de destinatarios.
        for (uint256 i = 0; i < recipients.length; i++) {
            mintPoap(recipients[i]);
        }
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "Token does not exist");
    string memory baseURI = "https://ipfs.io/ipfs/[enter the CID here]/";
    return string(abi.encodePacked(baseURI, tokenId.toString()));
}

//    function tokenURI(uint256 tokenId) public view override returns (string memory) {
//         require(_exists(tokenId), "Token does not exist");
//         string memory metadataCID = tokenMetadataCID[tokenId];
//         require(bytes(metadataCID).length > 0, "Metadata CID not set");

//         return string(abi.encodePacked(baseTokenURI, metadataCID, "/"));
//     }

}

/*El contrato no necesita un relayer porque ha implementado un sistema de prepago para cubrir las tarifas de gas asociadas con la creación de Poap NFTs. En tu contrato, los administradores pueden cargar fondos prepagados utilizando la función depositPrepaidFunds. Cuando un usuario solicita acuñar un Poap NFT utilizando la función mintPoap, el contrato verifica si hay suficientes fondos prepagados para cubrir las tarifas de gas antes de realizar la acuñación. Si hay suficientes fondos prepagados, se descuentan las tarifas de gas del saldo prepagado.

Este enfoque elimina la necesidad de un relayer porque el sistema de prepago permite que las transacciones se ejecuten sin que los usuarios tengan que pagar las tarifas de gas en el momento de la transacción. En lugar de depender de un relayer, los usuarios deben asegurarse de que haya suficientes fondos prepagados en el contrato para cubrir las tarifas de gas asociadas con sus transacciones.

Es importante tener cuidado al gestionar el saldo prepagado para evitar que se agote, lo que podría evitar que las transacciones se ejecuten correctamente. Además, asegúrate de implementar medidas de seguridad sólidas para proteger los fondos prepagados y garantizar que el sistema sea transparente y confiable para los usuarios que deseen acuñar Poap NFTs.*/