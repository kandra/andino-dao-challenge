// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";



contract PoapContract is ERC1155, Ownable {
     string public baseURI;
     address public relayer;
     uint256 private _currentTokenID;

    mapping(address => bool) public minters;
    mapping(uint256 => uint256) public eventMintCount;
    mapping(uint256 => mapping(address => bool)) public eventMinters;
    mapping(uint256 => address[]) public eventAddressList;

    event PoapMinted(address indexed account, uint256 tokenId);
    event PoapCreated(
        string indexed eventName,
        uint256 indexed tokenId,
        uint256 indexed createDate,
        uint256 startingDate,
        uint256 expiredPoap,
        string description
    );

    event PoapExpired(uint256 indexed tokenId, uint256 indexed expirationDate);

    struct Poap {
        uint256 tokenId;
        uint256 createDate;
        uint256 startingDate;
        uint256 expirationDate;
        string description;
        bool expired;
    }

    mapping(uint256 => Poap) public poaps;

    constructor(string memory _baseURI, address _relayer) 
        ERC1155("") // Llamada al constructor de ERC1155 con un argumento vacío
        Ownable(msg.sender) { // Llamada al constructor de Ownable con el remitente del mensaje
        baseURI = _baseURI;
        relayer = _relayer;
        minters[msg.sender] = true; // Establecer al remitente como minter por defecto
        _currentTokenID = 1; // Inicializar el ID del token en 1
    }


    function createPoap(
        string memory _eventName,
        uint256 _tokenId,
        uint256 _createDate,
        uint256 _startingDate,
        uint256 _expirationDate,
        string memory _description
    ) external onlyOwner {
        require(_expirationDate > block.timestamp, "La fecha de expiracion debe ser en el futuro");

        Poap memory newPoap = Poap({
            tokenId: _tokenId,
            createDate: _createDate,
            startingDate: _startingDate,
            expirationDate: _expirationDate,
            description: _description,
            expired: false
        });

        poaps[_tokenId] = newPoap;

        emit PoapCreated(_eventName, _tokenId, _createDate, _startingDate, _expirationDate, _description);
    }

    function expirePoap(uint256 _tokenId) external {
        require(block.timestamp > poaps[_tokenId].expirationDate, "La fecha limite de minteo no ha pasado todavia");
        poaps[_tokenId].expired = true;

        emit PoapExpired(_tokenId, poaps[_tokenId].expirationDate);
    }

    function setMinter(address _minter, bool _status) external onlyOwner {
        minters[_minter] = _status;
    }

    function mint(address _account, uint256 _eventId, uint256 _amount) external {
        require(minters[msg.sender], "El remitente no tiene permiso para crear Poaps");
        require(!poaps[_eventId].expired, "El poap ha expirado");

        _mint(_account, _currentTokenID, _amount, "");
        _currentTokenID++;

        // Registra el minteo para el evento actual
        eventMinters[_eventId][_account] = true;
        eventMintCount[_eventId] += _amount;

        emit PoapMinted(_account, _eventId);
    }

    function addAddressToEvent(uint256 _eventId, address _newAddress) external onlyOwner {
        eventAddressList[_eventId].push(_newAddress);
    }

    function getEventAddresses(uint256 _eventId) external view returns (address[] memory) {
        return eventAddressList[_eventId];
    }

    function getEventMintCount(uint256 _eventId) external view returns (uint256) {
        return eventMintCount[_eventId];
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

     function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
    }

    function addMinter(address _minter) external onlyOwner {
        minters[_minter] = true;
    }

    function removeMinter(address _minter) external onlyOwner {
        minters[_minter] = false;
    }

    function mint(address _account, uint256 _eventId, uint256 _amount, bytes memory _signature) external {
        require(minters[msg.sender], "No tiene permisos para crear tokens");

        // Verifica que el mensaje fue firmado por el relayer
        bytes32 messageHash = keccak256(abi.encodePacked(_account, _eventId, _amount));
        require(recoverSigner(messageHash, _signature) == relayer, "Firma no valida");

        _mint(_account, _eventId, _amount, "");
        emit PoapMinted(_account, _eventId);
    }

    function recoverSigner(bytes32 _messageHash, bytes memory _signature) internal pure returns (address) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        require(_signature.length == 65, "Longitud de firma incorrecta");

        assembly {
            r := mload(add(_signature, 0x20))
            s := mload(add(_signature, 0x40))
            v := byte(0, mload(add(_signature, 0x60)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Valor de 'v' invalido");

        return ecrecover(_messageHash, v, r, s);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(bytes(baseURI).length > 0, "URI base not set");
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId)));
    }

}

