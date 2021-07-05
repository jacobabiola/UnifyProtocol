import './App.css';
import { Button, Flex } from '@chakra-ui/react'
import { Container } from '@chakra-ui/layout';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react"
import React, { useState } from 'react';
import { ethers } from "ethers";
// import GreeterArtifact from "./contracts/Greeter.json";
import EthVaultArtifact from "./contracts/ETHVault.json";
import contractAddress from "./contracts/contract-address.json";
import { VaultHome } from './components/VaultUI/VaultHome'

export const HARDHAT_NETWORK_ID = '31337';
// const KOVAN_NETWORK_ID = '42';
export const GOERLI_NETWORK_ID = '5';
export const MUMBAI_NETWORK_ID = '80001'
// const ETHEREUM_NETWORK_ID = '1';
// const POLYGON_NETWORK_ID = '137';

function App() {

  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [ethVaultContract, setEthVaultContract] = useState(undefined)
  const [networkError, setNetworkError] = useState(false)
  const [networkName, setNetworkName] = useState(undefined)
  const [networkTokens, setNetworkTokens] = useState(undefined)

  if (selectedAddress === undefined) {
    return (
      <Container maxW="container.xl">
      {
        networkError && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle mr={2}>Wrong Network</AlertTitle>
            <AlertDescription>Please change to Goerli, Mumbai or Localhost</AlertDescription>
          </Alert>
        )
      }


        <Flex pt={10} justify="center">
          <Button onClick = {() => connectWallet() }> Connect Wallet </Button>
        </Flex>
      </Container>
    );
  
  } else {
    return (
      <Container maxW="container.xl">

        <VaultHome 
          ethvault={ethVaultContract}
          address={selectedAddress}
          provider={provider}
          networkname={networkName}
          networktokens={networkTokens}
        />
      </Container>
    );
  }
  
  async function connectWallet() {

    const [address] = await window.ethereum.enable();

    // check the network
    if (!checkNetwork()) {
      return false;
    }
    // Update user address
    setSelectedAddress(address)

    // Initialise EthersJS and all contracts
    initialiseContracts()


    console.log("Your address is: ", address)
    // When user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      setSelectedAddress(newAddress);
      console.log("Account changed to: ", newAddress)
      initialiseContracts()
    });
    // When user changes their network.
    window.ethereum.on("chainChanged", ([newChainId]) => {
      // console.log("Network changed ...")
      // checkNetwork()
      window.location.reload();
    });
      
  }

  function checkNetwork() {
    // check the network
    if (window.ethereum.networkVersion === GOERLI_NETWORK_ID) {   
      console.log( "Connected to Goerli ", window.ethereum.networkVersion )
      setNetworkName("Ethereum")
      setNetworkTokens({
        DAI: {
          address: "0x2686eca13186766760a0347ee8eeb5a88710e11b",
          symbol: "DAI",
          image: "https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png",
          decimals: 18,
        },
      });
      setNetworkError(false)
      return true;
    } else if (window.ethereum.networkVersion === MUMBAI_NETWORK_ID) {
      console.log( "Connected to Mumbai ", window.ethereum.networkVersion )
      setNetworkName("Polygon")
      setNetworkTokens({
        DAI: {
          address: "0x27a44456bEDb94DbD59D0f0A14fE977c777fC5C3",
          symbol: "DAI",
          image: "https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png",
          decimals: 18,
        },
      });
      setNetworkError(false)
      return true;
    } 
    else if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      console.log( "Connected to Localhost ", window.ethereum.networkVersion )
      setNetworkName("Localhost")
      setNetworkError(false)
      return true;
    }
    else if (window.ethereum.networkVersion === "1") {
      console.log( "Connected to Ethereum ", window.ethereum.networkVersion )
      setNetworkName("Ethereum")
      setNetworkError(false)
      return true;
    }
    else {
      console.log("Wrong Network: ", window.ethereum.networkVersion)
      setNetworkError(true)
      return false
    }
  }

  async function initialiseContracts() {
      // Initialise EthersJS
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider)

      // Initialise Contract
      let ethVault = new ethers.Contract(
        contractAddress.ETHVault,
        EthVaultArtifact.abi,
        ethersProvider.getSigner()
      );
      setEthVaultContract(ethVault)

  }
}

export default App;
