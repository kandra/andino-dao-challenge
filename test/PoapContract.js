var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");

const DEFAULT_ADMIN_ROLE = getRole("DEFAULT_ADMIN_ROLE");
const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");
const URI_SETTER_ROLE = getRole("URI_SETTER_ROLE");

var owner, alice;

before(async () => {
    [owner, alice] = await ethers.getSigners();
    provider = ethers.provider;
});

describe("Set up", function () {
    it("Publish contract", async () => {
        // Publicar PoapContract 
        PoapToken = await hre.ethers.getContractFactory("PoapContract");
        contract_PoapToken = await PoapToken.deploySCNoUp();
    });
});

describe("Access Control", function () {
    it("mint is protected by MINTER_ROLE", async () => {
        const mint = contract_PoapToken.connect(alice).mint;
        await expect(
          mint(alice.address, 1, 1, 0)
        ).to.revertedWith(
          `AccessControl: account ${alice.address.toLowerCase()} is missing role ${MINTER_ROLE}`
        );
    });

    // it("allows the minter to mint", async () => {
    //     await contract_CuyCollectionNFT.connect(owner).safeMint(alice.address, 13);
    //     var tokenOwner = await contract_CuyCollectionNFT.ownerOf(13);
    //     expect(tokenOwner).to.equal(alice.address, "Minter should have minted the token for the wallet");
    // });
});