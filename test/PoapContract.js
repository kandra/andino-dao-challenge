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
    [owner, alice, bob] = await ethers.getSigners();
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
        await expect(contractPoap.connect(alice).createPoap("evento", 1701232998, timeNow + 10000, "description", 100, "https://ipfs.io/ipfs/QmVFTyfbzo2v4L3R4uSgF46nmiRCwNFHniVZAZLotKy8Me?filename=5.png")).to.be.reverted;
    });
    it("eventName, and dates from poap cannot be empty", async () => {
        await expect(contractPoap.connect(owner).createPoap("", 1701232998, timeNow + 10000, "description", 100, "")).to.revertedWith("El Poap debe tener un nombre");
        await expect(contractPoap.connect(owner).createPoap("Nombre del evento", 0, 0, "", 100, "")).to.revertedWith("La fecha de expiracion debe ser en el futuro");
        await expect(contractPoap.connect(owner).createPoap("Nombre del evento", timeNow + 1000, timeNow + 100, "", 100, "")).to.revertedWith("La fecha de expiracion debe ser despues de la fecha de inicio");
    });
    it("creates a poap", async () => {
        await expect(contractPoap.connect(owner).createPoap("evento", 1701232998, timeNow + 10000, "description", 100, "https://ipfs.io/ipfs/QmVFTyfbzo2v4L3R4uSgF46nmiRCwNFHniVZAZLotKy8Me?filename=5.png")).to.emit(contractPoap,"PoapCreated");
        var events = await contractPoap.getEvents();
        console.log(events);
        expect(events.length).to.be.greaterThan(0);
    });
    it("max supply of poaps need to be greater than 0", async () => {
        await expect(contractPoap.connect(owner).createPoap("evento", 1701232998, timeNow + 10000, "description", 0, "https://ipfs.io/ipfs/QmVFTyfbzo2v4L3R4uSgF46nmiRCwNFHniVZAZLotKy8Me?filename=5.png")).to.revertedWith("El maximo numero de minteos debe ser mayor a 0");
    });
    it("lists created poaps", async () => {
        var events = await contractPoap.getEvents();
        
        // Add a new event
        await contractPoap.connect(owner).createPoap("evento", 1701232998, timeNow + 10000, "description", 100, "https://ipfs.io/ipfs/QmVFTyfbzo2v4L3R4uSgF46nmiRCwNFHniVZAZLotKy8Me?filename=5.png");

        // Now, there should be a +1 length to the event array
        var events2 = await contractPoap.getEvents();
        expect(events.length + 1).to.equal(events2.length);
    });
    it("displays the details for a poap", async () => {
        var events = await contractPoap.getEvents();
        var event_id = events[0];
        // console.log("id a enviar: " + event_id);
        var event = await contractPoap.poaps(event_id);

        expect(event.eventName).to.equal("evento");
        expect(event.startingDate).to.equal(1701232998);
        expect(event.expirationDate).to.equal(timeNow + 10000);
        expect(event.description).to.equal("description");
        expect(event.maxSupply).to.equal(100);
    });
});

describe("Minting poaps", function () {
    it("mint is protected by MINTER_ROLE", async () => {
        await expect(contractPoap.connect(alice).mint(alice.address, 1)).to.be.reverted;
    });
    it("cannot mint a non-existing event", async () => {
        const nonExistingId = 34938429;
        await expect(contractPoap.connect(owner).mint(alice.address, nonExistingId)).to.be.reverted;
    });
    it("allows the minter to mint", async () => {
        var events = await contractPoap.getEvents();
        console.log("eventos: " +events);
        const eventId = events[0];
        await expect(contractPoap.connect(owner).mint(alice.address, eventId)).to.emit(contractPoap,"PoapMinted");
    });
    it("cannot mint more than the max supply defined for the poap", async () => {
        await contractPoap.createPoap(
            "evento", 1701232998, timeNow + 10000, "description", 1, "https://ipfs.io/ipfs/QmVFTyfbzo2v4L3R4uSgF46nmiRCwNFHniVZAZLotKy8Me?filename=5.png"
        );
        // console.log(eventId.data);
        var eventId = await contractPoap.getEvents();
        await contractPoap.connect(owner).mint(alice.address, eventId[eventId.length-1]);
        await expect(contractPoap.connect(owner).mint(bob.address, eventId[eventId.length-1])).to.revertedWith("Maximo numero de poaps emitidos para este evento");
    });
    it("lists poaps minted from an account", async () => {
        await contractPoap.connect(owner).createPoap("evento3", 1701232998, timeNow + 10000, "description", 100, "https://ipfs.io/ipfs/QmVFTyfbzo2v4L3R4uSgF46nmiRCwNFHniVZAZLotKy8Me?filename=5.png")
        var events = await contractPoap.getEvents();
        var eventId = events[events.length-1];
        await contractPoap.connect(owner).mint(bob.address, eventId);
        await contractPoap.connect(owner).mint(alice.address, eventId);
        var alicePoaps = await contractPoap.connect(alice).getPoapsByAccount(alice.address);
        expect(alicePoaps.length).to.equal(3);
        expect(alicePoaps[0].tokenId).to.equal(events[0]);
        expect(alicePoaps[0].seat).to.equal(1);
        expect(alicePoaps[2].seat).to.equal(2);
    });
    it("lists mints from poaps", async () => {
        var events = await contractPoap.getEvents();
        var poaps = await contractPoap.connect(alice).getEventAddresses(events[events.length-1]);
        expect(poaps.length).to.equal(2);
    });
    it("managing uris", async() => {
        var events = await contractPoap.getEvents();
        var eventId = events[0];
        var newURI = "http://test.com";
        await contractPoap.connect(owner).setEventURI(eventId, newURI);
        expect(await contractPoap.uri(eventId)).to.equal(newURI);
    });
});
