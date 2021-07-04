import React, { useState, useEffect } from 'react';
import { ethers, BigNumber } from "ethers";
import { SimpleGrid, Text, Image, VStack, HStack, Button, FormControl, FormLabel, FormHelperText, useDisclosure } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react"
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper  } from "@chakra-ui/react"
import { StatCard } from "../Stat"
import { signDaiPermit } from 'eth-permit';
import { GOERLI_NETWORK_ID, MUMBAI_NETWORK_ID } from '../../App';
import { MaticPOSClient } from '@maticnetwork/maticjs'
import PolygonVaultArtifact from "../../contracts/PolygonVault.json";
import contractAddress from "../../contracts/contract-address.json";

import { Bus } from '../Bus';
const axios = require('axios');


const erc20ABI = require('../../contracts/ERC20ABI.json')

function VaultModal( props ) {

    const FEE_WE_CHARGE_USER = 3
    
    const [isLoading, setIsLoading] = useState(false) 
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const format = (val) => `$` + val
    const parse = (val) => val.replace(/^\$/, "")
  
    const [depositValue, setDepositValue] = React.useState("0.00")
    const [daiContractBalance, setDaiContractBalance] = useState(0)
    const [yourShares, setYourShares] = useState(0)

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

        async function checkBalancePoly() {
            var customHttpProvider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");

            let polygonVaultRead = new ethers.Contract(
                contractAddress.PolygonVault,
                PolygonVaultArtifact.abi,
                customHttpProvider
            );
            let balance = await polygonVaultRead.vaultBalance()
            let normalisedBalance = ethers.utils.formatUnits(balance.toString(), props.token.decimals)
            setDaiContractBalance(normalisedBalance)
            console.log("Balance updated to: ", normalisedBalance)
            setYourShares("NA")

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
            } else if (window.ethereum.networkVersion === MUMBAI_NETWORK_ID) {
                checkBalancePoly()
            }

        }
    
     }, [isLoading, isOpen, props.ethvault, props.token.decimals]);

    async function testFunc() {
        // let txn = await ethVault.depositWithPermit(body.finalAmount, body.finalFee, body.senderAddress, body.spender, body.signature.nonce, body.signature.expiry, true, body.signature.v, body.signature.r, body.signature.s, {gasLimit: 2000000})

        axios.post('https://api.defender.openzeppelin.com/autotasks/a78e3d07-04e9-47f7-8750-e0b3b32bdaee/runs/webhook/c06b9428-d8e4-4cb7-bbda-a258fae7addd/M4uK2vFS8L3DRPH37FuABF', {
            contractAddress: contractAddress.ETHVault,
          })
          .then(function (response) {
            console.log(response.data.result);
          })
          .catch(function (error) {
            console.log(error);
          });
    }

    async function moveTokensPolygon() {
        setIsLoading(true)
        axios.post('https://api.defender.openzeppelin.com/autotasks/a78e3d07-04e9-47f7-8750-e0b3b32bdaee/runs/webhook/c06b9428-d8e4-4cb7-bbda-a258fae7addd/M4uK2vFS8L3DRPH37FuABF', {
            contractAddress: contractAddress.ETHVault,
          })
          .then(function (response) {
            console.log(response.data.result);
            setIsLoading(false)
          })
          .catch(function (error) {
            console.log(error);
          });
    }

    async function relayPermitAndMoveFunds(value) {
        setIsLoading(true)

        console.log("Permitting relay....")

        const normalisedAmount = ethers.utils.parseUnits(value, props.token.decimals)
        let finalAmount = BigNumber.from(normalisedAmount)
        let finalFee = ethers.utils.parseUnits(String(FEE_WE_CHARGE_USER), props.token.decimals)
        // Ask you to permit us to transfer funds
        const signature = await signDaiPermit(window.ethereum, permitDetails.tokenAddress, permitDetails.senderAddress, permitDetails.spender);
        console.log("Signature is: ")
        console.log(signature)

        axios.post('https://api.defender.openzeppelin.com/autotasks/77946913-64f0-4493-b7bb-6a3e6ee51bca/runs/webhook/c06b9428-d8e4-4cb7-bbda-a258fae7addd/6sKddT4fa6ipoNZiCygzQh', {
            contractAddress: contractAddress.ETHVault,
            finalAmount: finalAmount.toString(),
            finalFee: finalFee.toString(),
            senderAddress: permitDetails.senderAddress,
            spender: permitDetails.spender,
            signature: signature
          })
          .then(function (response) {
            let hash = response.data.result
            console.log("Sucess! Here is the txnHash: ", hash);
            if (hash) {
                setIsLoading(false)
            }
          })
          .catch(function (error) {
            console.log(error);
          });


    }
    
      async function polyApprove(value) {
        console.log("Approving ...")

        setIsLoading(true)
        const normalisedAmount = ethers.utils.parseUnits(value, props.token.decimals)
        let finalAmount = BigNumber.from(normalisedAmount)
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);

        let TOKEN = new ethers.Contract(
            props.token.polygonAddress,
            erc20ABI,
            ethersProvider.getSigner()
        );
        // Load data from contract
        let approve = await TOKEN.approve(contractAddress.PolygonVault, finalAmount)
        const receipt = await approve.wait();
        console.log(receipt)
        setIsLoading(false)
        console.log("Approved")
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
        
        console.log("Successfully burnt tokens! Here is your reciept: ", reciept)
        let burnTxnHash = reciept.transactionHash

        let finalFee = ethers.utils.parseUnits(String(FEE_WE_CHARGE_USER), props.token.decimals)

        axios.post('https://api.defender.openzeppelin.com/autotasks/fd6c0a6b-06eb-45ec-9508-269b9ece91f9/runs/webhook/c06b9428-d8e4-4cb7-bbda-a258fae7addd/Tb12zBH6eeq6kvyTTWKuWQ', {
            contractAddress: contractAddress.PolygonVault,
            finalFee: finalFee.toString(),
            senderAddress: permitDetails.senderAddress,
            burnTxnHash: burnTxnHash
          })
          .then(function (response) {
            let hash = response.data.result
            console.log("Sucess! Here is the txnHash: ", hash);
            if (hash) {
                setIsLoading(false)
            }
          })
          .catch(function (error) {
            console.log(error);
          });

    }

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

        let burnTxnHashes = await polygonVaultRead.getHashes({gasLimit: 2000000})
        console.log("We got the hashes: ", burnTxnHashes)
        
        let proofs = []

        for (const txnHash of burnTxnHashes) {
          try {

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

        axios.post('https://api.defender.openzeppelin.com/autotasks/30308712-cf9e-48e7-b3a3-e9d6d54fa610/runs/webhook/c06b9428-d8e4-4cb7-bbda-a258fae7addd/DtqSi5yiKXCpFqoJjFM9Zh', {
            contractAddress: contractAddress.ETHVault,
            proofs: proofs
          })
          .then(function (response) {
            let hash = response.data.result
            console.log("Sucess! Here is the txnHash: ", hash);
            if (hash) {
                setIsLoading(false)
            }
          })
          .catch(function (error) {
            console.log(error);
          });

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
                            {
                                props.name === "Bus" ?
                                    (<Bus
                                        value={depositValue}
                                        loading={isLoading}
                                        burn={burn}
                                        moveFunds={relayPermitAndMoveFunds}
                                        fee={FEE_WE_CHARGE_USER}
                                        polyapprove={polyApprove}
                                    />)
                                :
                                (
                                    props.name === "Jet" ?

                                        (<div>Danilo Put stuff here</div>)
                                        :
                                        (<div> Taxi stuff goes here </div>)
                                    
                                )
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
                            <Button onClick = {() => testFunc()}> Test</Button>

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

