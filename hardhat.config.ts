import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "hardhat-abi-exporter";
import "solidity-coverage";
import "hardhat-watcher";
import "hardhat-tracer";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "./tasks";
import { ethers } from "ethers";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10_000,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.RPC_ENDPOINT_ID}`,
      accounts: [process.env.WALLET_PRIVATE_KEY!].filter(Boolean),
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.RPC_ENDPOINT_ID}`,
      accounts: process.env.MNEMONIC
        ? {
            mnemonic: process.env.MNEMONIC,
            initialIndex: parseInt(process.env.INITIAL_INDEX || "0"),
          }
        : [process.env.WALLET_PRIVATE_KEY!].filter(Boolean),
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.RPC_ENDPOINT_ID}`,
      accounts: process.env.MNEMONIC
        ? {
            mnemonic: process.env.MNEMONIC,
            initialIndex: parseInt(process.env.INITIAL_INDEX || "0"),
          }
        : [process.env.WALLET_PRIVATE_KEY!].filter(Boolean),
    },
    hardhat: {
      //   forking: {
      //    url: process.env.API_URL || "",
      //   },
      initialBaseFeePerGas: 0,
    },
  },
  watcher: {
    compile: {
      tasks: ["compile"],
    },
    test: {
      tasks: [{ command: "test", params: { testFiles: ["{path}"] } }],
      files: ["./test/**/*"],
      verbose: false,
    },
  },
  mocha: {
    timeout: 60_000,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 90,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  abiExporter: {
    path: "./abi",
    clear: true,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
