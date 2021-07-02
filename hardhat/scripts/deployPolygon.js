// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');
  console.log("---------- DEPLOYING POLYGON CONTRACTS ------------")

  // We get the contract to deploy
  const Greeter = await hre.ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, this is data from a smart contract!");

  await greeter.deployed();

  console.log("Greeter deployed to:", greeter.address);
  // saveFrontendFiles("Greeter", greeter)
}

function saveFrontendFiles(name, token) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../react/unify/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  let addresses = {}
  if (fs.existsSync(contractsDir + "/contract-address.json")) {
    let addressesJSON = fs.readFileSync(contractsDir + "/contract-address.json");
    addresses = JSON.parse(addressesJSON);
  }
  
  addresses[name] = token.address.toLowerCase() // LOWER CASE IS IMPORTANT FOR CONTRACT SIGNING FOUND THIS OUT THE HARD WAY
  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify( addresses , undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + "/"+name+".json",
    JSON.stringify(TokenArtifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
