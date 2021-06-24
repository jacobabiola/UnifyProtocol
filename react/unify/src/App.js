import './App.css';
import { Button, Flex, Spacer } from '@chakra-ui/react'
import { Container, Heading, Text } from '@chakra-ui/layout';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react"
import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import GreeterArtifact from "./contracts/Greeter.json";
import contractAddress from "./contracts/contract-address.json";

const HARDHAT_NETWORK_ID = '31337';
// const ETHEREUM_NETWORK_ID = '1';
// const POLYGON_NETWORK_ID = '137';

function App() {

  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [greeterContract, setGreeterContract] = useState(undefined)
  const [greeterGreeting, setGreeterGreeting] = useState("Loading...")
  const [networkError, setNetworkError] = useState(false)
  if (selectedAddress === undefined) {
    return (
      <Container maxW="container.xl">
      {
        networkError && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle mr={2}>Wrong Network</AlertTitle>
            <AlertDescription>Please change to Localhost 8545</AlertDescription>
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
        <Flex justify="center" align="center" pt="2">
          <Heading> Unify Vault </Heading>
          <Spacer/>
          <Button onClick = {() => connectWallet() }> Logout </Button>
        </Flex>
        <Flex>
          <Text>
            { greeterGreeting }
          </Text>
        </Flex>
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
      initialiseContracts()
    });
    // When user changes their network.
    window.ethereum.on("chainChanged", ([newChainId]) => {
      checkNetwork()
    });
      
  }

  function checkNetwork() {
    // check the network
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
      console.log( "Wrong Network" )
      setNetworkError(true)
      return false;
    } else {
      setNetworkError(false)
      return true
    }
  }

  async function initialiseContracts() {
      // Initialise EthersJS
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider)
  
      // Initialise Contracts
      let greetContract = new ethers.Contract(
        contractAddress.Greeter,
        GreeterArtifact.abi,
        ethersProvider.getSigner()
      );
      setGreeterContract(greetContract)
      // Load data from contract
      let greeting = await greetContract.greet()
      setGreeterGreeting(greeting)
  }
}

export default App;
