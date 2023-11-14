// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PoapContract is ERC1155, Ownable {
    uint256 private _currentTokenID;

    address private _relayerContract;

    mapping(address => bool) public minters;

    mapping(uint256 => uint256) public eventMints; // Mapeo de ID de evento a cantidad de Poap minteados
    mapping(uint256 => mapping(address => bool)) public eventMinters; // Mapeo de ID de evento a direcciones que mintieron Poap

    event PoapMinted(address indexed account, uint256 tokenId, uint256 amount);

    constructor() ERC1155("URI") {
        _currentTokenID = 1;
    }

    function setRelayerContract(address relayer) external onlyOwner {
        _relayerContract = relayer;
    }

    function setMinter(address minter, bool status) external onlyOwner {
        minters[minter] = status;
    }

    function mint(address account, uint256 amount) external onlyOwner {
        require(minters[account], "Account is not allowed to mint");
        _mint(account, _currentTokenID, amount, "");
        _currentTokenID++;
        
        // Registra el minteo para el evento actual
        eventMints[_currentTokenID] += amount;
        eventMinters[_currentTokenID][account] = true;

        emit PoapMinted(account, _currentTokenID, amount);
    }

    function mintWithoutGas(address account, uint256 amount) external {
        require(msg.sender == _relayerContract, "Only relayer can mint without gas");
        _mint(account, _currentTokenID, amount, "");
        _currentTokenID++;

        // Registra el minteo para el evento actual
        eventMints[_currentTokenID] += amount;
        eventMinters[_currentTokenID][account] = true;

        emit PoapMinted(account, _currentTokenID, amount);
    }

    // Función para ver quién ha minteado Poap para un evento
    function getEventMinters(uint256 eventId) external view returns (address[] memory) {
        address[] memory mintersList = new address[](eventMints[eventId]);
        uint256 index = 0;
        for (uint256 i = 1; i <= _currentTokenID; i++) {
            if (eventMinters[eventId][address(i)]) {
                mintersList[index] = address(i);
                index++;
            }
        }
        return mintersList;
    }

    // Función para ver cuántos Poap se han minteado para un evento
    function getEventMintCount(uint256 eventId) external view returns (uint256) {
        return eventMints[eventId];
    }
}
