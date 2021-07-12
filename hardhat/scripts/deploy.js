// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const ERC20Abi = require("./abis/ERC20ABI.json")

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // let DAI = "0x6b175474e89094c44da98b954eedeac495271d0f" // DAI Address MAINNET

  console.log("---------- DEPLOYING ETH CONTRACTS ------------")
  let DAI = "0x2686eca13186766760a0347ee8eeb5a88710e11b" // DAI address Goerli
  const ETHVault = await hre.ethers.getContractFactory("ETHVault");
  const ethVault = await ETHVault.deploy("DAI Vault ETH", DAI);

  await ethVault.deployed();
  console.log("ethVault deployed to:", ethVault.address);
  saveFrontendFiles("ETHVault", ethVault)

  
  // ------- SEND OURSELVES A TOKEN ------------
  // console.log("------------------------- Begin Moving Funds -----------------------------")
  // let accountToStealFrom = "0xacd614c63e7d9aed0e747d72a8723d5ea3b41424"
  // let accountToGiveTo = "0x9b591bf6970D271c4660Df5E08d85773E998B59E"
  // let tokenToSteal = DAI
  // await ethers.provider.send("hardhat_impersonateAccount", [accountToStealFrom])
  // const signer = await ethers.provider.getSigner(accountToStealFrom)
  // let erc20Address = tokenToSteal 
  // let erc20Contract = new ethers.Contract(erc20Address, ERC20Abi, signer); 
  // const name = await erc20Contract.name();
  // console.log("Taking ", name, " from: ", accountToStealFrom, "and giving to: ", accountToGiveTo)
  // var balanceOfMe = await erc20Contract.balanceOf(accountToGiveTo);
  // var balanceToSteal = await erc20Contract.balanceOf(accountToStealFrom);
  // console.log("Your current token balance: ", balanceOfMe.toString())
  // console.log("Future balance: ", balanceToSteal.toString())
  // // Transfer ERC20 to ourselves
  // const approveTransfer = await erc20Contract.transfer(accountToGiveTo, balanceToSteal.toString())
  // await approveTransfer.wait();
  // console.log("Transfer complete ...")
  // balanceOfMe = await erc20Contract.balanceOf(accountToGiveTo);
  // console.log("Your new token balance: ", balanceOfMe.toString())
  // console.log("------------------------- End Moving Funds -----------------------------")
  // --------------------------------------------
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
  
  addresses[name] = token.address
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
