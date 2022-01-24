import fs from "fs";
import { task } from "hardhat/config";

task("deploy-ci", "Deploy contracts (automated by CI)", async (_, { run }) => {
  const contracts = await run("deploy-local");

  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
  }
  fs.writeFileSync(
    "logs/deploy.json",
    JSON.stringify({
      contractAddresses: {
        NFTCloner: contracts.NFTCloner.address,
      },
      gitHub: {
        // Get the commit sha when running in CI
        sha: process.env.GITHUB_SHA,
      },
    }),
    { flag: "w" }
  );
});
