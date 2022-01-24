import chai from "chai";
import { ethers } from "hardhat";
import { BigNumber as EthersBN, constants } from "ethers";
import { solidity } from "ethereum-waffle";
import {
  NFTCloner,
  NFTCloner__factory as NFTClonerFactory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(solidity);
const { expect } = chai;

describe("NFTCloner", () => {
  let nftCloner: NFTCloner;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  let snapshotId: number;

  const TOKEN_NAME = "NFTConer";
  const TOKEN_SYMBOL = "NFT";
  const TOKEN_URI = "https://example.com/";

  before(async () => {
    [deployer, user1, user2] = await ethers.getSigners();

    const nftClonerFactory = new NFTClonerFactory(deployer);
    nftCloner = await nftClonerFactory.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_URI
    );
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send("evm_snapshot", []);
  });

  afterEach(async () => {
    await ethers.provider.send("evm_revert", [snapshotId]);
  });

  it("should get token name", async () => {
    expect(await nftCloner.name()).to.equal(TOKEN_NAME);
  });

  it("should get token symbol", async () => {
    expect(await nftCloner.symbol()).to.equal(TOKEN_SYMBOL);
  });

  it("should get contract uri", async () => {
    expect(await nftCloner.contractURI()).to.equal(TOKEN_URI + "metadata.json");
  });

  it("should revert if user try to update contract info", async () => {
    await expect(
      nftCloner
        .connect(user1)
        .updateInfo(
          "Malicious Token Name",
          "Malicious Token Symbol",
          "Malicious Token URI"
        )
    ).to.be.reverted;
  });

  it("should allow owner to update contract info", async () => {
    const newTokenName = "TestName";
    const newTokenSymbol = "TESTSYMBOL";
    const newTokenURI = "https://newURI.com/";
    await nftCloner.updateInfo(newTokenName, newTokenSymbol, newTokenURI);

    expect(await nftCloner.name()).to.equal(newTokenName);
    expect(await nftCloner.symbol()).to.equal(newTokenSymbol);
    expect(await nftCloner.contractURI()).to.equal(
      newTokenURI + "metadata.json"
    );
  });

  it("should allow user to mint a new token and emit Transfer event", async () => {
    await expect(nftCloner.connect(user1).mint())
      .to.emit(nftCloner, "Transfer")
      .withArgs(constants.AddressZero, user1.address, 1);

    await expect(nftCloner.connect(user2).mint())
      .to.emit(nftCloner, "Transfer")
      .withArgs(constants.AddressZero, user2.address, 2);
  });

  it("should rever user to mint a second time", async () => {
    await nftCloner.connect(user1).mint();
    await expect(nftCloner.connect(user1).mint()).to.be.reverted;
  });

  it("should return balance of owner", async () => {
    await nftCloner.connect(user1).mint();
    expect(await nftCloner.balanceOf(user1.address)).to.equal(1);

    await nftCloner.connect(user2).mint();
    expect(await nftCloner.balanceOf(user2.address)).to.equal(1);
  });

  it("should revert when trying to balance of non-existing owner", async () => {
    await expect(nftCloner.balanceOf(user1.address)).to.reverted;
  });

  it("should return owner of token ID", async () => {
    await nftCloner.connect(user1).mint();
    expect(await nftCloner.ownerOf(1)).to.equal(user1.address);

    await nftCloner.connect(user2).mint();
    expect(await nftCloner.ownerOf(2)).to.equal(user2.address);
  });

  it("should revert when trying to get owner of non-existing token ID", async () => {
    await expect(nftCloner.ownerOf(1)).to.reverted;
  });

  it("should return token ID of owner", async () => {
    await nftCloner.connect(user1).mint();
    expect(await nftCloner.tokenByOwner(user1.address)).to.equal(1);

    await nftCloner.connect(user2).mint();
    expect(await nftCloner.tokenByOwner(user2.address)).to.equal(2);
  });

  it("should revert when trying to token ID of non-existing owner", async () => {
    await expect(nftCloner.tokenByOwner(user1.address)).to.reverted;
  });

  it("should allow user to burn its own token and emit Transfer event", async () => {
    await nftCloner.connect(user1).mint();
    expect(await nftCloner.balanceOf(user1.address)).to.equal(1);
    expect(await nftCloner.ownerOf(1)).to.equal(user1.address);
    expect(await nftCloner.tokenByOwner(user1.address)).to.equal(1);

    await nftCloner.connect(user2).mint();
    expect(await nftCloner.balanceOf(user2.address)).to.equal(1);
    expect(await nftCloner.ownerOf(2)).to.equal(user2.address);
    expect(await nftCloner.tokenByOwner(user2.address)).to.equal(2);

    await expect(nftCloner.connect(user1).burn())
      .to.emit(nftCloner, "Transfer")
      .withArgs(user1.address, constants.AddressZero, 1);

    await expect(nftCloner.connect(user2).burn())
      .to.emit(nftCloner, "Transfer")
      .withArgs(user2.address, constants.AddressZero, 2);

    await expect(nftCloner.balanceOf(user1.address)).to.reverted;
    await expect(nftCloner.balanceOf(user2.address)).to.reverted;

    await expect(nftCloner.ownerOf(1)).to.reverted;
    await expect(nftCloner.ownerOf(2)).to.reverted;
  });

  it("should revert if someone try to burn someonelse token", async () => {
    await nftCloner.connect(user1).mint();
    await expect(nftCloner.connect(user2).burn()).to.be.reverted;
  });

  it("should return token uri", async () => {
    await nftCloner.connect(user1).mint();
    await nftCloner.connect(user2).mint();

    expect(await nftCloner.tokenURI(1)).to.equal(TOKEN_URI + "nft/1.json");
    expect(await nftCloner.tokenURI(2)).to.equal(TOKEN_URI + "nft/2.json");
  });
});
