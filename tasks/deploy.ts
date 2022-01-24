import { task } from "hardhat/config";
import { LedgerSigner } from "@anders-t/ethers-ledger";
import promptjs from "prompt";

promptjs.colors = false;
promptjs.message = "> ";
promptjs.delimiter = "";

type ContractName = "NFTCloner";

interface Contract {
  args?: (string | number | (() => string | undefined))[];
  address?: string;
  libraries?: () => Record<string, string>;
  waitForConfirmation?: boolean;
}

task("deploy", "Deploys smart contracts", async (_, { ethers }) => {
  const [deployer] = await ethers.getSigners();
  const ledger = new LedgerSigner(ethers.provider);

  const contracts: Record<ContractName, Contract> = {
    NFTCloner: {
      args: ["NFT Cloner", "NFT", "https://cdn.nftcloner.xyz/"],
    },
  };

  let gasPrice = await ethers.provider.getGasPrice();
  const gasInGwei = Math.round(
    Number(ethers.utils.formatUnits(gasPrice, "gwei"))
  );

  promptjs.start();

  let result = await promptjs.get([
    {
      properties: {
        gasPrice: {
          type: "integer",
          required: true,
          description: "Enter a gas price (gwei)",
          default: gasInGwei,
        },
      },
    },
  ]);

  gasPrice = ethers.utils.parseUnits(result.gasPrice.toString(), "gwei");

  for (const [name, contract] of Object.entries(contracts)) {
    const factory = await ethers.getContractFactory(name, {
      libraries: contract?.libraries?.(),
    });

    const deploymentGas = await ethers.provider.estimateGas(
      factory.getDeployTransaction(
        ...(contract.args?.map((a) => (typeof a === "function" ? a() : a)) ??
          []),
        {
          // gasPrice,
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

    result = await promptjs.get([
      {
        properties: {
          confirm: {
            type: "string",
            description: 'Type "DEPLOY" to confirm:',
          },
        },
      },
    ]);

    if (result.confirm != "DEPLOY") {
      console.log("Exiting");
      return;
    }

    console.log("Deploying...");

    const deployedContract = await factory
      .connect(ledger)
      .deploy(
        ...(contract.args?.map((a) => (typeof a === "function" ? a() : a)) ??
          []),
        {
          maxFeePerGas: gasPrice,
          maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
        }
      );

    console.log(
      `${name} contract deployment tx ${deployedContract.deployTransaction.hash}`
    );

    if (contract.waitForConfirmation) {
      await deployedContract.deployed();
    }

    contracts[name as ContractName].address = deployedContract.address;

    console.log(`${name} contract deployed to ${deployedContract.address}`);
  }

  return contracts;
});
