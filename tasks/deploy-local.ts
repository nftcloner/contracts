import { task } from "hardhat/config";
import promptjs from "prompt";

type ContractName = "NFTCloner";

interface Contract {
  args?: (string | number | (() => string | undefined))[];
  address?: string;
  libraries?: () => Record<string, string>;
  waitForConfirmation?: boolean;
}

task("deploy-local", "Deploys smart contracts", async (_, { ethers }) => {
  const [deployer] = await ethers.getSigners();

  const contracts: Record<ContractName, Contract> = {
    NFTCloner: {
      args: ["NFT Cloner", "NFT", "https://cdn.nftcloner.xyz/"],
    },
  };

  let gasPrice = await ethers.provider.getGasPrice();

  for (const [name, contract] of Object.entries(contracts)) {
    const factory = await ethers.getContractFactory(name, {
      libraries: contract?.libraries?.(),
    });

    const deploymentGas = await factory.signer.estimateGas(
      factory.getDeployTransaction(
        ...(contract.args?.map((a) => (typeof a === "function" ? a() : a)) ??
          []),
        {
          gasPrice,
        }
      )
    );
    const deploymentCost = deploymentGas.mul(gasPrice);

    console.log(
      `Estimated cost to deploy ${name}: ${ethers.utils.formatUnits(
        deploymentCost,
        "ether"
      )} ETH`
    );

    console.log("Deploying...");

    const deployedContract = await factory.deploy(
      ...(contract.args?.map((a) => (typeof a === "function" ? a() : a)) ?? []),
      {
        gasPrice,
      }
    );

    if (contract.waitForConfirmation) {
      await deployedContract.deployed();
    }

    contracts[name as ContractName].address = deployedContract.address;

    console.log(`${name} contract deployed to ${deployedContract.address}`);
  }

  return contracts;
});
