var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");
const keccak256 = require("keccak256");

const DEFAULT_ADMIN_ROLE = getRole("DEFAULT_ADMIN_ROLE");
const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");
const URI_SETTER_ROLE = getRole("URI_SETTER_ROLE");

var owner, alice;
const timeNow = Math.floor(new Date().getTime()/1000.0);

before(async () => {
    [owner, alice] = await ethers.getSigners();
    provider = ethers.provider;

    
});

describe("Set up", function () {
    it("Publish contract", async () => {
        // Publicar PoapContract 
        PoapToken = await hre.ethers.getContractFactory("PoapContract");
        contractPoap = await hre.ethers.deployContract("PoapContract");
        // console.log("Contrato address: ", contractPoap.target);
    });
});

describe("Poap management", function () {
    it("protects the creation of a poap", async () => {
        await expect(contractPoap.connect(alice).createPoap("evento", 1701232998, timeNow + 10000, "description")).to.be.reverted;
    });
    it("eventName, and dates from poap cannot be empty", async () => {
        await expect(contractPoap.connect(owner).createPoap("", 1701232998, timeNow + 10000, "description")).to.revertedWith("El Poap debe tener un nombre");
        await expect(contractPoap.connect(owner).createPoap("Nombre del evento", 0, 0, "")).to.revertedWith("La fecha de expiracion debe ser en el futuro");
        await expect(contractPoap.connect(owner).createPoap("Nombre del evento", timeNow + 1000, timeNow + 100, "")).to.revertedWith("La fecha de expiracion debe ser despues de la fecha de inicio");
    });
    it("creates a poap", async () => {
        await expect(contractPoap.connect(owner).createPoap("evento", 1701232998, timeNow + 10000, "description")).to.emit(contractPoap,"PoapCreated");

        // var id = ethers.solidityPackedKeccak256(["string", "uint256", "uint256", "uint256"], ["evento", timeNow, 1701232998, timeNow + 10000]);
        // console.log("id calc: " + id);
        // var contract_id = await contractPoap.connect(owner).createPoap("evento", 1701232998, timeNow + 10000, "description");
        // console.log(contract_id.data);
        // // console.log(await contractPoap.connect(owner).createPoap("evento", 1701232998, timeNow + 10000, "description"));
        // expect(id).to.eq(contract_id);
        var events = await contractPoap.getEvents();
        console.log(events);
        expect(events.length).to.be.greaterThan(0);
    });
    it("lists created poaps", async () => {
        var events = await contractPoap.getEvents();
        
        // Add a new event
        await contractPoap.connect(owner).createPoap("evento", 1701232998, timeNow + 10000, "description");

        // Now, there should be a +1 length to the event array
        var events2 = await contractPoap.getEvents();
        expect(events.length + 1).to.equal(events2.length);
    });
    it("displays the details for a poap", async () => {
        var events = await contractPoap.getEvents();
        var event_id = events[0];
        // console.log("id a enviar: " + event_id);
        var event = await contractPoap.poapsById(event_id);
        console.log(event);

        expect(event.eventName).to.equal("evento");
        expect(event.startingDate).to.equal(1701232998);
        expect(event.expirationDate).to.equal(timeNow + 10000);
        expect(event.description).to.equal("description");
        
    });
});

describe("Minting poaps", function () {
    it("mint is protected by MINTER_ROLE", async () => {
    //     const mint = contractPoap.connect(alice).mint;
    //     await expect(
    //       mint(alice.address, 1, 1, 0)
    //     ).to.revertedWith(
    //       `AccessControl: account ${alice.address.toLowerCase()} is missing role ${MINTER_ROLE}`
    //     );
    });

    it("allows the minter to mint", async () => {
    //     await contract_CuyCollectionNFT.connect(owner).safeMint(alice.address, 13);
    //     var tokenOwner = await contract_CuyCollectionNFT.ownerOf(13);
    //     expect(tokenOwner).to.equal(alice.address, "Minter should have minted the token for the wallet");
    });
    it("lists mints from poaps", async () => {});
});