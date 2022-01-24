# NFT Cloner - Smart Contracts

## Development

### Install dependencies

```sh
yarn
```

### Compile typescript, contracts, and generate typechain wrappers

```sh
yarn build
```

### Run tests

```sh
yarn test
```

### Environment Setup

Copy `.env.example` to `.env` and fill in fields

### Commands

```sh
# compiling
npx hardhat compile

# deploying
npx hardhat deploy

# verifying on etherscan
npx hardhat verify --network goerli {DEPLOYED_ADDRESS}

# replace `goerli` with `mainnet` to productionize
```

### Automated Testnet Deployments

The contracts are deployed to Rinkeby on each push to master and each PR using the account `0x7f686f9B2740e09469a4A5A0F2eDE2d317D4aeE5`. This account's mnemonic is stored in GitHub Actions as a secret and is injected as the environment variable `MNEMONIC`. This mnemonic _shouldn't be considered safe for mainnet use_.