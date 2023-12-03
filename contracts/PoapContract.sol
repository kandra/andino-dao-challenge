// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

import "hardhat/console.sol";

contract PoapContract is ERC1155, AccessControl, ERC1155Supply  {
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    // string public baseURI;
    // address public relayer;
    uint256 public currentTokenId; // maybe private?
    struct Poap {
        uint256 tokenId;
        string eventName;
        uint256 createDate;
        uint256 startingDate;
        uint256 expirationDate;
        string description;
        uint256 maxSupply;
    }
    struct PoapId{
        uint256 tokenId;
        uint256 seat;
    }

    mapping(uint256 events => address[]) public eventAddressList;
    // mapping(address => uint256[] events) public poapsByAccount;
    mapping(address => PoapId[] events) public poapsByAccount;
    mapping(uint256 id => Poap) public poaps;
    mapping(uint256 => string) private eventURIs;
    uint256[] public eventIds;
    

    event PoapCreated(
        string indexed eventName,
        uint256 indexed tokenId,
        uint256 indexed createDate,
        uint256 startingDate,
        uint256 expirationDate,
        string description, 
        uint256 maxSupply
    );
    event PoapMinted(address indexed account, uint256 tokenId, uint256 totalSupply);

    // constructor(string memory _baseURI, address _relayer) 
    constructor() 
        ERC1155("") { // Llamada al constructor de ERC1155 con un argumento vacío
        // Ownable(msg.sender) { // Llamada al constructor de Ownable con el remitente del mensaje
        // baseURI = _baseURI;
        // relayer = _relayer;
        // minters[msg.sender] = true; // Establecer al remitente como minter por defecto
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
        // currentTokenId = 0; // Inicializar el ID del evento en 1
    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    function createPoap(
        string memory _eventName,
        uint256 _startingDate,
        uint256 _expirationDate,
        string memory _description,
        uint256 _maxSupply,
        string memory _uri
    ) public onlyRole(MINTER_ROLE) returns(uint256) {
        // TODO: Parece que no se pasan los datos sino que se pone en el json en el IPFS?
        // eventURIs[newEventId] = eventURI;
        // emit URI(eventURI, newEventId);


        require(_expirationDate > block.timestamp, "La fecha de expiracion debe ser en el futuro");
        require(_startingDate < _expirationDate, "La fecha de expiracion debe ser despues de la fecha de inicio");
        require(bytes(_eventName).length > 0, "El Poap debe tener un nombre");
        require(_maxSupply>0, "El maximo numero de minteos debe ser mayor a 0");

        uint256 id = uint256(keccak256(abi.encodePacked(_eventName, block.timestamp, _startingDate, _expirationDate)));
        if (poaps[id].createDate != 0){ // What to do if the id has already been taken
            id++;
        }
        console.log("id token: %s", id);

        // currentTokenId++;
        Poap memory newPoap = Poap({
            tokenId: id,
            eventName: _eventName,
            createDate: block.timestamp,
            startingDate: _startingDate,
            expirationDate: _expirationDate,
            description: _description,
            maxSupply: _maxSupply
        });

        poaps[newPoap.tokenId] = newPoap;
        eventIds.push(newPoap.tokenId);
        eventURIs[newPoap.tokenId] = _uri;
        emit PoapCreated(
            newPoap.eventName, 
            newPoap.tokenId, 
            newPoap.createDate, 
            newPoap.startingDate, 
            newPoap.expirationDate, 
            newPoap.description,
            newPoap.maxSupply
        );
        return newPoap.tokenId;
    }

    function getEvents() public view returns(uint256[] memory){
        return eventIds;
    }

    function mint(
        address _account, 
        uint256 _eventId 
    ) public onlyRole(MINTER_ROLE) {
        // https://github.com/ethereum/ercs/blob/master/ERCS/erc-1155.md

        require(poaps[_eventId].expirationDate > block.timestamp, "El poap ha expirado o no existe");
        require(balanceOf(_account, _eventId) == 0, "Solo un poap por persona / evento");
        // console.log("%s: %s / %s", _eventId, poaps[_eventId].maxSupply, eventAddressList[_eventId].length);
        require(poaps[_eventId].maxSupply > eventAddressList[_eventId].length, "Maximo numero de poaps emitidos para este evento");
        
        // TODO: se debe subir la metadata como un archivo JSON (?) ver: https://github.com/ethereum/ercs/blob/master/ERCS/erc-1155.md#metadata

        /***
         * A mint/create operation is essentially a specialized transfer and MUST follow these rules:
To broadcast the existence of a token ID with no initial balance, the contract SHOULD emit the TransferSingle event from 0x0 to 0x0, with the token creator as _operator, and a _value of 0.
The "TransferSingle and TransferBatch event rules" MUST be followed as appropriate for the mint(s) (i.e. singles or batches) however the _from argument MUST be set to 0x0 (i.e. zero address) to flag the transfer as a mint to contract observers.
NOTE: This includes tokens that are given an initial balance in the contract. The balance of the contract MUST also be able to be determined by events alone meaning initial contract balances (for eg. in construction) MUST emit events to reflect those balances too.
         * * */

        // console.log("supply %s", totalSupply(1));
        _mint(_account, _eventId, 1, "");
        // console.log("2 supply %s", totalSupply(1));
        // console.log("balance de %s es %s", _account, balanceOf(_account, _eventId));

        // Registra el minteo para el evento actual
        eventAddressList[_eventId].push(_account);
        PoapId memory newPoapId = PoapId({
            tokenId: _eventId,
            seat: eventAddressList[_eventId].length
        });
        poapsByAccount[_account].push(newPoapId);

        emit PoapMinted(_account, _eventId, totalSupply(_eventId));
    }

    // Function to set the URI for a specific token ID
    function setEventURI(uint256 eventId, string memory newURI) public onlyRole(MINTER_ROLE) {
        // require(bytes(poaps[eventId]).length > 0, "El evento no existe");
        require(poaps[eventId].createDate > 0, "El evento no existe");
        eventURIs[eventId] = newURI;
        emit URI(newURI, eventId);
    }

    // Override the URI function
    function uri(uint256 eventId) override public view returns (string memory) {
        require(bytes(eventURIs[eventId]).length > 0, "POAPToken: URI not set");
        return eventURIs[eventId];
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        // _mintBatch(to, ids, amounts, data);
    }

    function getEventAddresses(uint256 _eventId) public view returns (address[] memory) {
        require(poaps[_eventId].createDate > 0, "El evento no existe");
        return eventAddressList[_eventId];
    }

    // function setBaseURI(string memory newBaseURI) external onlyOwner {
    //     baseURI = newBaseURI;
    // }

    function getPoapsByAccount(address _account) public view returns(PoapId[] memory){
        return poapsByAccount[_account];
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}

