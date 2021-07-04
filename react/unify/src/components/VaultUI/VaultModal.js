import React, { useState, useEffect } from 'react';
import { ethers, BigNumber } from "ethers";
import { SimpleGrid, Text, Image, VStack, HStack, Button, FormControl, FormLabel, FormHelperText, useDisclosure, cookieStorageManager } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react"
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper  } from "@chakra-ui/react"
import { StatCard } from "../Stat"
import { signDaiPermit } from 'eth-permit';
import { GOERLI_NETWORK_ID } from '../../App';
import { MaticPOSClient } from '@maticnetwork/maticjs'
import EthVaultArtifact from "../../contracts/ETHVault.json";
import PolygonVaultArtifact from "../../contracts/PolygonVault.json";
import contractAddress from "../../contracts/contract-address.json";
// import { Stat, StatLabel, StatNumber } from '../Stat/Stat'
import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    StatGroup,
  } from "@chakra-ui/react"
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers');
const ethCredentials = {apiKey: "44Up9G8XrPJTbq68K77xif16pNXbk2A3", apiSecret: "55n3dmrb28o5ZrKvmDrojVNKfei2gvAMvjS5TFKybzZdL2J482esHkMXtegD9VjM"}
const ethRelayProvider = new DefenderRelayProvider(ethCredentials);
const ethRelaySigner = new DefenderRelaySigner(ethCredentials, ethRelayProvider, { speed: 'fast' });

const polyCredentials = {apiKey: "2CHTi6r4c1qiKxmUBz7CNT9da9jiRxnf", apiSecret: "63wJ5TDZHLYUotHZkwg9T5KjgDE8cLxsZ5SEDQgkR5Nqqg4MHx9Qbs1NySqGdXkT"}
const polyRelayProvider = new DefenderRelayProvider(polyCredentials);
const polyRelaySigner = new DefenderRelaySigner(polyCredentials, polyRelayProvider, { speed: 'fast' });

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
            if (window.ethereum.networkVersion === GOERLI_NETWORK_ID) {
                checkShares()
                checkBalance()
            }

        }
    
     }, [isLoading, isOpen, props.ethvault, props.token.decimals]);

    // async function moveTokenToPolygon() {
    //     setIsLoading(true)
    //     console.log("Transfering token to Polygon")
    //     let addressOnPolygonSide = props.address // For now its just the person who activates the transfer
    //     let txn = await props.ethvault.moveFundsToPolygon(addressOnPolygonSide, {gasLimit: 2000000})
    //     const receipt = await txn.wait();
    //     console.log("Success! Here is your reciept: ", receipt)
    //     setIsLoading(false)

    // }

    async function moveTokensPolygon() {
        setIsLoading(true)
        console.log("Transfering tokens to Polygon")
        // Initialise Contract
        let ethVault = new ethers.Contract(
            contractAddress.ETHVault,
            EthVaultArtifact.abi,
            ethRelaySigner
        );
        let txn = await ethVault.moveAllBalancesToPolygon({gasLimit: 2000000})
        const receipt = await txn.wait();
        console.log("Success! Here is your reciept: ", receipt)
        setIsLoading(false)
    }

    async function relayPermitAndMoveFunds(value) {
        setIsLoading(true)

        console.log("Permitting relay....")

        const normalisedAmount = ethers.utils.parseUnits(value, props.token.decimals)
        let finalAmount = BigNumber.from(normalisedAmount)

        // Ask you to permit us to transfer funds
        const result = await signDaiPermit(window.ethereum, permitDetails.tokenAddress, permitDetails.senderAddress, permitDetails.spender);
        console.log("Signature is: ")
        console.log(result)

        // Initialise Contract
        let ethVault = new ethers.Contract(
            contractAddress.ETHVault,
            EthVaultArtifact.abi,
            ethRelaySigner
        );

        let txn = await ethVault.depositWithPermit(finalAmount, permitDetails.senderAddress, permitDetails.spender, result.nonce, result.expiry, true, result.v, result.r, result.s, {gasLimit: 2000000})


        const receipt = await txn.wait();
        console.log("Success! Here is your reciept: ", receipt)

        setIsLoading(false)

    }

    async function permit() {
        setIsLoading(true)
        // GENERATE SIGNATURE
        console.log("Getting signature....")
        console.log(window.ethereum, permitDetails.tokenAddress, permitDetails.senderAddress, permitDetails.spender);

        const result = await signDaiPermit(window.ethereum, permitDetails.tokenAddress, permitDetails.senderAddress, permitDetails.spender);
        console.log(result)

        let abi = [
            "function permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)"
        ];

        let DAI = new ethers.Contract(
            props.token.address,
            abi,
            // props.provider.getSigner()
            ethRelaySigner
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

    async function burn(value) {

        console.log("Burning ...", value)

        setIsLoading(true)
        const normalisedAmount = ethers.utils.parseUnits(value, props.token.decimals)
        let finalAmount = BigNumber.from(normalisedAmount)

        const maticPOSClient = new MaticPOSClient({
            network: "testnet",
            version: "mumbai",
            parentProvider: window.ethereum,
            maticProvider: window.ethereum
        });

        let from = props.address // THE USER HAS TO BURN THEIR TOKEN TO RECIEVE IT ON THE OTHER SIDE
        console.log(props.token.polygonAddress, finalAmount, from )

        let reciept = await maticPOSClient.burnERC20(props.token.polygonAddress, finalAmount.toString(), { from });
        
        console.log("Success! Here is your reciept: ", reciept)
        let burnTxnHash = reciept.transactionHash

        // NOW WE ARE GOING TO ADD THE BURN TRANSACTION TO THE POLGON CONTRACT USING POLYGON RELAY
        let polygonVault = new ethers.Contract(
            contractAddress.PolygonVault,
            PolygonVaultArtifact.abi,
            polyRelaySigner
        );

        let txn = await polygonVault.addHash( burnTxnHash ,{gasLimit: 2000000})
        const receipt = await txn.wait();
        console.log("Success! Here is your reciept: ", receipt)

        setIsLoading(false)
    }

    // async function exit() {
    //     console.log("Retrieving DAI....... ")
    //     setIsLoading(true)
    //     let from = props.address 

    //     const maticPOSClient = new MaticPOSClient({
    //         network: "testnet",
    //         version: "mumbai",
    //         parentProvider: window.ethereum,
    //         maticProvider: "https://rpc-mumbai.maticvigil.com",
    //     });

    //     let burnTxHash = "0x52dad223da5789a045f6121af503119c7170f688ba55ad4116f9ce71005e0526"


    //     let reciept = await maticPOSClient.exitERC20(burnTxHash, { from });
        
        
    //     console.log("Success! Here is your reciept: ", reciept)
    //     setIsLoading(false)

    // }

    async function exit() {
        console.log("Retrieving All users DAI....... ")
        setIsLoading(true)

        const ERC20_TRANSFER_EVENT_SIG = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
        const maticPOSClient = new MaticPOSClient({
            network: "testnet",
            version: "mumbai",
            parentProvider: window.ethereum,
            maticProvider: "https://rpc-mumbai.maticvigil.com",
        });
        var customHttpProvider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");

        let polygonVaultRead = new ethers.Contract(
            contractAddress.PolygonVault,
            PolygonVaultArtifact.abi,
            customHttpProvider
        );

        // let polygonVaultWrite = new ethers.Contract(
        //     contractAddress.PolygonVault,
        //     PolygonVaultArtifact.abi,
        //     polyRelaySigner
        // );

        let burnTxnHashes = await polygonVaultRead.getHashes({gasLimit: 2000000})
        console.log("We got the hashes: ", burnTxnHashes)
        
        let proofs = []

        for (const txnHash of burnTxnHashes) {
          try {
            // let proof = await maticPOSClient.exitERC20(txnHash, { from, encodeAbi: true });
            let proof =
              await maticPOSClient.posRootChainManager.exitManager.buildPayloadForExitHermoine(
                txnHash,
                ERC20_TRANSFER_EVENT_SIG
              );
            proofs.push(proof);
          } catch (err) {
            console.log("Error but keep going: ", err);
          }
        } 
        // Initialise Contract
        let ethVault = new ethers.Contract(
            contractAddress.ETHVault,
            EthVaultArtifact.abi,
            ethRelaySigner
        );

        let txn = await ethVault.bringAllBalancesBackToEth(proofs, {gasLimit: 29999900})
        const receipt = await txn.wait();
        console.log("Success! Here is your receipt: ", receipt);
        
        // console.log("Success! Here is your reciept: ", reciept)
        setIsLoading(false)

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
        > Buy Ticket </Button>
  
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{props.name} To {props.opposite}</ModalHeader>
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
                    <Tab>Actions</Tab>
                    <Tab>Admin Panel</Tab>
                </TabList>

                <TabPanels>
                    
                    <TabPanel>
                        <FormControl id="Actions">
                            <FormLabel>Amount </FormLabel>
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
                            <FormHelperText align="left">The amount of {props.token.symbol} you want to trasnfer to {props.opposite}</FormHelperText>
                            <SimpleGrid
                                columns={{
                                base: 1,
                                md: 3,
                                }}
                                spacing="6"
                                pt={5}
                            >
                                <Stat>
                                    <StatLabel>Tokens You Recieve</StatLabel>
                                    <StatNumber>{depositValue} DAI</StatNumber>
                                    <StatHelpText>ETA: Monday 5th July</StatHelpText>
                                </Stat>
                                <Stat>
                                    <StatLabel>Collected Fees</StatLabel>
                                    <StatNumber>3 DAI</StatNumber>
                                    <StatHelpText>We charge a fixed rate </StatHelpText>
                                </Stat>
                                <Stat>
                                    <StatLabel>Transaction Fees</StatLabel>
                                    <StatNumber>$0</StatNumber>
                                    <StatHelpText>You dont pay gas fees</StatHelpText>
                                </Stat>
                            </SimpleGrid>
                            <Stat pt={5}>
                                    <StatLabel>Total</StatLabel>
                                    <StatNumber>{parseFloat(depositValue) + 3} DAI</StatNumber>
                                    {/* <StatHelpText>Total DAI withdrawn from account</StatHelpText> */}
                                </Stat>
                            {
                                window.ethereum.networkVersion === GOERLI_NETWORK_ID ?
                                    (<HStack spacing="24px" justify="center" pt="6">
                                    
                                        <Button isDisabled={isApproved} isLoading={isLoading} onClick = {() => relayPermitAndMoveFunds(depositValue) }> Buy Ticket </Button>
                                        {/* <Button isLoading={isLoading} onClick = {() => deposit(depositValue) }> Deposit </Button>  */}
                                    </HStack>
                                    )
                                    :
                                    (<HStack spacing="24px" justify="center" pt="6">
                                        (<Button isLoading={isLoading} onClick = {() => burn(depositValue) }> Burn </Button>)
                                    </HStack>)
                            }
                        </FormControl>

                    </TabPanel>
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
                        <HStack spacing="24px" justify="center" pt="6">
                            <Button isLoading={isLoading} onClick={() => moveTokensPolygon()}>
                                Move to Polygon
                            </Button>
                            <Button isLoading={isLoading} onClick = {() => exit() }> Move to Eth </Button> 

                        </HStack>

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