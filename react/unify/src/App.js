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

const HARDHAT_NETWORK_ID = '31337';
// const KOVAN_NETWORK_ID = '42';
const GOERLI_NETWORK_ID = '5';
const MUMBAI_NETWORK_ID = '80001'
// const ETHEREUM_NETWORK_ID = '1';
// const POLYGON_NETWORK_ID = '137';

function App() {

  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [ethVaultContract, setEthVaultContract] = useState(undefined)
  const [networkError, setNetworkError] = useState(false)
  const [networkName, setNetworkName] = useState(undefined)

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
      setNetworkName("Goerli")
      setNetworkError(false)
      return true;
    } else if (window.ethereum.networkVersion === MUMBAI_NETWORK_ID) {
      console.log( "Connected to Mumbai ", window.ethereum.networkVersion )
      setNetworkName("Mumbai")
      setNetworkError(false)
      return true;
    } 
    else if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      console.log( "Connected to Localhost ", window.ethereum.networkVersion )
      setNetworkName("Localhost")
      setNetworkError(false)
      return true;
    }
    else {
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
