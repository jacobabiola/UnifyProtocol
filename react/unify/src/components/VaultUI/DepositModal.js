import React, { useState } from 'react';
import { ethers, BigNumber } from "ethers";
import { Text, Image, VStack, HStack, Button, FormControl, FormLabel, FormHelperText, useDisclosure } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react"
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper  } from "@chakra-ui/react"
import contractAddress from "../../contracts/contract-address.json";
import EthVaultArtifact from "../../contracts/ETHVault.json";
const erc20ABI = require('../../contracts/ERC20ABI.json')

function DepositModal( props ) {

    const [isLoading, setIsLoading] = useState(false) 
    const [isApproved, setIsApproved] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const format = (val) => `$` + val
    const parse = (val) => val.replace(/^\$/, "")
  
    const [depositValue, setDepositValue] = React.useState("0.00")

    async function deposit(value) {
        console.log("Depositing ...")

        setIsLoading(true)
        const normalisedAmount = (parseFloat(value) * props.token.decimals).toString()
        let finalAmount = BigNumber.from(normalisedAmount)
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);

        let TOKEN = new ethers.Contract(
            props.token.address,
            erc20ABI,
            ethersProvider.getSigner()
        );

        let deposit = await TOKEN.transfer(contractAddress.ETHVault, finalAmount)
        const receipt = await deposit.wait();
        console.log(receipt)
        setIsLoading(false)
        setIsApproved(false)
        console.log("Done")

        let ethVault = new ethers.Contract(
            contractAddress.ETHVault,
            EthVaultArtifact.abi,
            ethersProvider.getSigner()
          );

        // Load data from contract
        let balance = await ethVault.checkBalance()
        console.log("ETH Vault balance is now: ", balance.toString())
    
      }
    
      async function approve(value) {
        console.log("Approving ...")

        setIsLoading(true)
        const normalisedAmount = (parseFloat(value) * props.token.decimals).toString()
        let finalAmount = BigNumber.from(normalisedAmount)
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);

        let TOKEN = new ethers.Contract(
            props.token.address,
            erc20ABI,
            ethersProvider.getSigner()
        );
        // Load data from contract
        let approve = await TOKEN.approve(contractAddress.ETHVault, finalAmount)
        const receipt = await approve.wait();
        console.log(receipt)
        setIsLoading(false)
        setIsApproved(true)
        console.log("Approved")
      }
    
      async function withdraw(address, value) {
        // const myAddresses = await web3.eth.getAccounts()
        const finalAmount = parseFloat(value) * props.token.decimals
        // lendingPoolInstance.methods.withdraw(address, finalAmount, myAddresses[0]).send({from: myAddresses[0]})
        // .once('transactionHash', (hash) => {
        //   // transaction hash
        //   console.log("Transaction hash: " + hash)
        //   setIsConfirmingWithdraw(true)
        // })
        // .on('confirmation', (number, receipt) => {
        //     // number of confirmations
        //     console.log("no of confirmations: " + number)
        //     setIsConfirmingWithdraw(false)
        // })
        // .on('error', (error) => {
        //     console.log(error);
        // });
      }

    return (
      <>
        <Button onClick={onOpen}
            minH="3.5rem"
            rounded="lg"
            fontWeight="bold"
            colorScheme={!props.disabled ? 'blue' : 'gray'}
            mt="8"
            w="100%"
            isDisabled={props.disabled}
        > Deposit </Button>
  
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Actions</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
            <VStack pb="4">
                <Image
                    borderRadius="full"
                    boxSize="60px"
                    src={ props.token.image }
                    alt={ props.token.symbol }
                />
                <Text color="blue.700" fontWeight="semibold" fontSize="lg"> {props.token.symbol} </Text>
            </VStack>

            <Tabs align="center" variant="soft-rounded" colorScheme="blue">
                <TabList>
                    <Tab>Deposit</Tab>
                    <Tab>Withdraw</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <FormControl id="Deposit">
                            <FormLabel>Amount</FormLabel>
                            <NumberInput
                                onChange={(valueString) => setDepositValue(parse(valueString))}
                                value={format(depositValue)}
                                precision={3} step={0.001}
                                min={0}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <FormHelperText align="left">The amount of {props.token.symbol} you want to deposit</FormHelperText>
                            <HStack spacing="24px" justify="center" pt="6">
                                <Button isDisabled={isApproved} isLoading={isLoading} onClick = {() => approve(depositValue) }> Approve </Button>
                                <Button isDisabled={!isApproved} isLoading={isLoading} onClick = {() => deposit(depositValue) }> Deposit </Button>
                            </HStack>
                        </FormControl>

                    </TabPanel>
                    <TabPanel>
                    <FormControl id="Withdraw">
                        <FormLabel>Amount</FormLabel>
                        <NumberInput
                            onChange={(valueString) => setDepositValue(parse(valueString))}
                            value={format(depositValue)}
                            precision={3} step={0.001}
                            min={0}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        <FormHelperText align="left">The amount of {props.token.symbol} you want to withdraw</FormHelperText>
                        <HStack spacing="24px" justify="center" pt="6">
                            <Button isLoading={isLoading} onClick = {() => withdraw(props.token.address, depositValue)} > Withdraw </Button>
                        </HStack>
                    </FormControl>
                    </TabPanel>
                </TabPanels>
            </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    )
  }

  export default DepositModal