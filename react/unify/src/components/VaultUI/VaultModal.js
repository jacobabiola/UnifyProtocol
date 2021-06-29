import React, { useState, useEffect } from 'react';
import { ethers, BigNumber } from "ethers";
import { SimpleGrid, Text, Image, VStack, HStack, Button, FormControl, FormLabel, FormHelperText, useDisclosure } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react"
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper  } from "@chakra-ui/react"
import contractAddress from "../../contracts/contract-address.json";
import { StatCard } from "../Stat"
const erc20ABI = require('../../contracts/ERC20ABI.json')

function VaultModal( props ) {

    const [isLoading, setIsLoading] = useState(false) 
    const [isApproved, setIsApproved] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const format = (val) => `$` + val
    const parse = (val) => val.replace(/^\$/, "")
  
    const [depositValue, setDepositValue] = React.useState("0.00")
    const [daiContractBalance, setDaiContractBalance] = useState(0)

    useEffect(() => {
        async function checkBalance() {
            let balance = await props.ethvault.checkBalance()
            let normalisedBalance = ethers.utils.formatUnits(balance.toString(), props.token.decimals)
            setDaiContractBalance(normalisedBalance)
            console.log("Balance updated to: ", normalisedBalance)
        }
        if ((isLoading === false) && (isOpen)) {
            checkBalance()
        }
    
     }, [isLoading, isOpen, props.ethvault, props.token.decimals]);

    async function moveTokenToPolygon() {
        setIsLoading(true)
        console.log("Transfering token to Polygon")
        let txn = await props.ethvault.depositERC20()
        const receipt = await txn.wait();
        console.log("Success! Here is your reciept: ", receipt)
        setIsLoading(false)
    }
    async function deposit(value) {
        console.log("Depositing ...")

        setIsLoading(true)
        const normalisedAmount = ethers.utils.parseUnits(value, props.token.decimals)
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

    
      }
    
      async function approve(value) {
        console.log("Approving ...")

        setIsLoading(true)
        const normalisedAmount = ethers.utils.parseUnits(value, props.token.decimals)
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
        > Open Vault </Button>
  
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Vault</ModalHeader>
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
                    <Tab>Overview</Tab>
                    <Tab>Deposit</Tab>
                    <Tab>Withdraw</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <SimpleGrid
                        columns={{
                            base: 1,
                            md: 2,
                        }}
                        spacing="6"
                        pt={5}
                        >
                            <StatCard data={
                                    {
                                        label: 'Current APY',
                                        value: '13%',
                                        change: 0.0125,
                                        description: 'Current interest earned on tokens',
                                    }
                            } />
                            <StatCard data={
                                    {
                                        label: 'Current Strategy',
                                        value: 'AAVE',
                                        description: 'Interest is currently earned via AAVE protocol',
                                    }
                            }/>
                            <StatCard data={
                                    {
                                        label: 'Total Value',
                                        value: `${daiContractBalance} DAI`,
                                        change: 0.10,
                                        description: 'Amount of DAI deposited in this vault',
                                    }  
                            } />
                            <StatCard data={
                                    {
                                        label: 'Your Shares',
                                        value: '100',
                                        change: 0.0012,
                                        description: 'Value of your shares',
                                    } 
                            } />
                        </SimpleGrid>
                        <Button onClick={() => moveTokenToPolygon()} mt={10}>
                            Move to Polygon
                        </Button>
                    </TabPanel>
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

  export default VaultModal