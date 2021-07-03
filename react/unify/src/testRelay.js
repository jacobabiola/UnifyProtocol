const { ethers } = require("ethers");
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers');

// Inline ABI of the contract we'll be interacting with (check out the rollup example for a better way to handle this!)
const ERC20_ABI = [{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"owner",type:"address"},{indexed:true,internalType:"address",name:"spender",type:"address"},{indexed:false,internalType:"uint256",name:"value",type:"uint256"}],name:"Approval",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"from",type:"address"},{indexed:true,internalType:"address",name:"to",type:"address"},{indexed:false,internalType:"uint256",name:"value",type:"uint256"}],name:"Transfer",type:"event"},{inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"address",name:"spender",type:"address"}],name:"allowance",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"approve",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"recipient",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transfer",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"sender",type:"address"},{internalType:"address",name:"recipient",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transferFrom",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"}];

// Main function, exported separately for testing
exports.main = async function(signer, recipient, contractAddress) {
  // Create contract instance from the relayer signer
  const dai = new ethers.Contract(contractAddress, ERC20_ABI, signer);

  // Check relayer balance via the Defender network provider
  const relayer = await signer.getAddress();
  const balance = await dai.balanceOf("0x3369b322cabC2edBbA1B910CD4eca1915c456715");
  console.log("Here is your balance: ",balance)

}

// Entrypoint for the Autotask
exports.handler = async function(credentials) {
  // Initialize defender relayer provider and signer
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
  const contractAddress = '0x76a245568c71C221a2Ce4a300359333ddd2ECa2c'; // Goerli DAI contract
  return exports.main(signer, await signer.getAddress(), contractAddress); // Send funds to self
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  require('dotenv').config();
  const credentials = {apiKey: "44Up9G8XrPJTbq68K77xif16pNXbk2A3", apiSecret: "55n3dmrb28o5ZrKvmDrojVNKfei2gvAMvjS5TFKybzZdL2J482esHkMXtegD9VjM"}
  exports.handler(credentials)
    .then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
}