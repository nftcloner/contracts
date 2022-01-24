import { task } from "hardhat/config";

type ContractName = "NFTCloner";

interface VerifyArgs {
  address: string;
  constructorArguments?: (string | number)[];
  libraries?: Record<string, string>;
}

const contracts: Record<ContractName, VerifyArgs> = {
  NFTCloner: {
    address: "0xC1bA956C1F1969d48cc979A38Cc243bAe4b04304",
    constructorArguments: ["NFT Cloner", "NFT", "https://cdn.nftcloner.xyz/"],
  },
};

task(
  "verify-etherscan",
  "Verify the Solidity contracts on Etherscan"
).setAction(async (_, hre) => {
  for (const [name, args] of Object.entries(contracts)) {
    console.log(`verifying ${name}...`);
    try {
      await hre.run("verify:verify", {
        ...args,
      });
    } catch (e) {
      console.error(e);
    }
  }
});
