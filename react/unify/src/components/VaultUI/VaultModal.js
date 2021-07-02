import React, { useState, useEffect } from 'react';
import { ethers, BigNumber } from "ethers";
import { SimpleGrid, Text, Image, VStack, HStack, Button, FormControl, FormLabel, FormHelperText, useDisclosure, cookieStorageManager } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react"
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper  } from "@chakra-ui/react"
import contractAddress from "../../contracts/contract-address.json";
import { StatCard } from "../Stat"
import { signDaiPermit } from 'eth-permit';

const erc20ABI = require('../../contracts/ERC20ABI.json')

function VaultModal( props ) {

    const [isLoading, setIsLoading] = useState(false) 
    const [isApproved, setIsApproved] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const format = (val) => `$` + val
    const parse = (val) => val.replace(/^\$/, "")
  
    const [depositValue, setDepositValue] = React.useState("0.00")
    const [daiContractBalance, setDaiContractBalance] = useState(0)
    const [yourShares, setYourShares] = useState(0)
    const [permission, setPermission] = useState(undefined)

    var permitDetails = {
        tokenAddress: props.token.address,
        senderAddress: props.address,
        spender: contractAddress.ETHVault
      }

    useEffect(() => {
        async function checkBalance() {
            let balance = await props.ethvault.vaultBalance()
            let normalisedBalance = ethers.utils.formatUnits(balance.toString(), props.token.decimals)
            setDaiContractBalance(normalisedBalance)
            console.log("Balance updated to: ", normalisedBalance)
        }

        async function checkShares() {
            let shares = await props.ethvault.userBalance()
            let normalisedShares = ethers.utils.formatUnits(shares.toString(), props.token.decimals)
            setYourShares(normalisedShares)
            console.log("Shares updated to: ", normalisedShares)
        }

        if ((isLoading === false) && (isOpen)) {
            checkShares()
            checkBalance()
        }
    
     }, [isLoading, isOpen, props.ethvault, props.token.decimals]);

    async function moveTokenToPolygon() {
        setIsLoading(true)
        console.log("Transfering token to Polygon")
        let addressOnPolygonSide = props.address // For now its just the person who activates the transfer
        let txn = await props.ethvault.moveFundsToPolygon(addressOnPolygonSide, {gasLimit: 2000000})
        const receipt = await txn.wait();
        console.log("Success! Here is your reciept: ", receipt)
        setIsLoading(false)
    }

    async function permit() {
        setIsLoading(true)
        // GENERATE SIGNATURE
        console.log("Getting signature....")
        console.log(window.ethereum, permitDetails.tokenAddress, permitDetails.senderAddress, permitDetails.spender);

        // // These are optional but signDaiPermit isnt working on Goerli without it
        // let expiry = undefined
        // let nonce = undefined
        // const result = await signDaiPermit(window.ethereum, permitDetails.tokenAddress, permitDetails.senderAddress, permitDetails.spender, expiry, nonce);
        const result = await signDaiPermit(window.ethereum, permitDetails.tokenAddress, permitDetails.senderAddress, permitDetails.spender);
        console.log(result)

        let abi = [
            "function permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)"
        ];

        let DAI = new ethers.Contract(
            props.token.address,
            abi,
            props.provider.getSigner()
        );

        console.log(permitDetails.senderAddress, permitDetails.spender, result.nonce, result.expiry, true, result.v, result.r, result.s)
        
        // PERMIT ON CHAIN
        let txn = await DAI.permit(permitDetails.senderAddress, permitDetails.spender, result.nonce, result.expiry, true, result.v, result.r, result.s, {gasLimit: 2000000})


        const receipt = await txn.wait();
        console.log("Success! Here is your reciept: ", receipt)
        setIsLoading(false)
        setIsApproved(true)
        setPermission(result)
    }

    // async function depositWithPermit(value) {
    //     console.log("Depositing ...")

    //     setIsLoading(true)
    //     const normalisedAmount = ethers.utils.parseUnits(value, props.token.decimals)
    //     let finalAmount = BigNumber.from(normalisedAmount)
    //     console.log(finalAmount, props.address, contractAddress.ETHVault, permission.nonce, permission.expiry, true, permission.v, permission.r, permission.s)
    //     let txn = await 
    //     props.ethvault.depositWithPermit(finalAmount, permitDetails.senderAddress, permitDetails.spender, permission.nonce, permission.expiry, true, permission.v, permission.r, permission.s)
    //     const receipt = await txn.wait();
    //     console.log("Success! Here is your reciept: ", receipt)
    //     setIsLoading(false)
    //     setIsApproved(false)
    //     console.log("Done")
    // }

    async function deposit(value) {
        console.log("Depositing ...")

        setIsLoading(true)
        const normalisedAmount = ethers.utils.parseUnits(value, props.token.decimals)
        let finalAmount = BigNumber.from(normalisedAmount)

        let txn = await props.ethvault.deposit(finalAmount)
        const receipt = await txn.wait();
        console.log("Success! Here is your reciept: ", receipt)
        setIsLoading(false)
        setIsApproved(false)
        console.log("Done")

    
      }
    
    //   async function approve(value) {
    //     console.log("Approving ...")

    //     setIsLoading(true)
    //     const normalisedAmount = ethers.utils.parseUnits(value, props.token.decimals)
    //     let finalAmount = BigNumber.from(normalisedAmount)
    //     const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);

    //     let TOKEN = new ethers.Contract(
    //         props.token.address,
    //         erc20ABI,
    //         ethersProvider.getSigner()
    //     );
    //     // Load data from contract
    //     let approve = await TOKEN.approve(contractAddress.ETHVault, finalAmount)
    //     const receipt = await approve.wait();
    //     console.log(receipt)
    //     setIsLoading(false)
    //     setIsApproved(true)
    //     console.log("Approved")
    //   }
    
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
                                        value: `${yourShares}`,
                                        change: 0.0012,
                                        description: 'Value of your shares',
                                    } 
                            } />
                        </SimpleGrid>
                        <Button isLoading={isLoading} onClick={() => moveTokenToPolygon()} mt={10}>
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
                                <Button isDisabled={isApproved} isLoading={isLoading} onClick = {() => permit() }> Permit </Button>
                                {/* <Button isDisabled={isApproved} isLoading={isLoading} onClick = {() => approve(depositValue) }> Approve </Button> */}
                                <Button isLoading={isLoading} onClick = {() => deposit(depositValue) }> Deposit </Button> 
                                {/* <Button isDisabled={!isApproved} isLoading={isLoading} onClick = {() => depositWithPermit(depositValue) }> Deposit </Button> */}
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