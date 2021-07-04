import React, { useState, useEffect } from 'react';
import { ethers, BigNumber } from "ethers";
import { SimpleGrid, Text, Image, VStack, HStack, Button, FormControl, FormLabel, FormHelperText, useDisclosure, cookieStorageManager } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react"
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper  } from "@chakra-ui/react"
import contractAddress from "../../contracts/contract-address.json";
import { StatCard } from "../Stat"
import { signDaiPermit } from 'eth-permit';
import { Hyphen } from "@biconomy/hyphen";
import { RESPONSE_CODES } from "@biconomy/hyphen";
import { GOERLI_NETWORK_ID } from '../../App';
import { MaticPOSClient } from '@maticnetwork/maticjs'

const erc20ABI = require('../../contracts/ERC20ABI.json')


function VaultModal( props ) {

    const HARDHAT_NETWORK_ID = '31337';
    // const KOVAN_NETWORK_ID = '42';
    const GOERLI_NETWORK_ID = '5';
    const MUMBAI_NETWORK_ID = '80001'

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
    
      async function withdraw(address, pValue) {
        console.log(`⚠️ Make sure your provider is on the Polygon side`);
        var withdrawDetails = {
          // tokenAddress: props.token.address, same as param
          tokenAddress: address,
          senderAddress: props.address,
          spender: contractAddress.ETHVault,
          value: BigNumber.from(
            ethers.utils.parseUnits(pValue, props.token.decimals)
          ),
        };
        const hyphenDepositDetails = {
          sender: props.address,
          receiver: props.address,
          tokenAddress: address,
        //   depositContractAddress: "0xdC3DB0281E78A9C565D326ACE0A430478C7193b5", // MUMBAI - LiquidityPoolManager - https://docs.biconomy.io/products/hyphen-instant-cross-chain-transfers/contract-addresses
          depositContractAddress: "0xf458fBA2c37e2bA50e7c853E18390769E9bE49Ef", // MUMBAI - LiquidityPoolManager - SDK
          amount: withdrawDetails.value,
          fromChainId: MUMBAI_NETWORK_ID,
          toChainId: GOERLI_NETWORK_ID,
        };
        setIsLoading(true);
        try {
          let hyphen = new Hyphen(props.provider, {
            debug: true, // If 'true', it prints debug logs on console window
            environment: "test", // It can be "test" or "prod"
            onFundsTransfered: (data) => {
              setIsLoading(false);
              console.log("Transferred!");
            },
          });

          await hyphen.init();

          await biconomyPreChecks(hyphen, withdrawDetails, hyphenDepositDetails.depositContractAddress);

          let depositTx = await hyphen.deposit(hyphenDepositDetails);

          // Wait for 1 block confirmation
          await depositTx.wait(1);
        } catch (error) {
          setIsLoading(false);
          console.error(error);
        }
      }

      async function biconomyPreChecks(hyphen, withdrawDetails, liquidityPoolManagerAddy) {
        let preTransferStatus = await hyphen.preDepositStatus({
          tokenAddress: withdrawDetails.tokenAddress, // Token address on fromChain which needs to be transferred
          amount: withdrawDetails.value, // Amount of tokens to be transferred in smallest unit eg wei
          fromChainId: MUMBAI_NETWORK_ID, // Chain id from where tokens needs to be transferred
          toChainId: GOERLI_NETWORK_ID, // Chain id where tokens are supposed to be sent
          userAddress: withdrawDetails.senderAddress, // User wallet address who want's to do the transfer
        });
        let hyphenError = `UNKNOWN`;

        if (preTransferStatus.code === RESPONSE_CODES.OK) {
          // ✅ ALL CHECKS PASSED. Proceed to do deposit transaction
          //double verify if allowance is enough
          const currAllow = await hyphen.getERC20Allowance(withdrawDetails.tokenAddress,props.address,liquidityPoolManagerAddy);
          if(BigNumber.from(currAllow).lt(BigNumber.from(withdrawDetails.value))) {
            console.log(withdrawDetails.value.toString())
            let approveTx = await hyphen.approveERC20(
                withdrawDetails.tokenAddress,
                preTransferStatus.depositContract,
                withdrawDetails.value.toString()
              );
    
              // ⏱Wait for transaction to confirm, pass number of blocks to wait as param
              return approveTx.wait(2);
          }
          else return;
        } else if (
          preTransferStatus.code === RESPONSE_CODES.ALLOWANCE_NOT_GIVEN
        ) {
          // ❌ Not enough apporval from user address on LiquidityPoolManager contract on fromChain
          let approveTx = await hyphen.approveERC20(
            withdrawDetails.tokenAddress,
            preTransferStatus.depositContract,
            withdrawDetails.value.toString()
          );

          // ⏱Wait for transaction to confirm, pass number of blocks to wait as param
          await approveTx.wait(2);

          // NOTE: Whenever there is a transaction done via SDK, all responses
          // will be ethers.js compatible with an async wait() function that
          // can be called with 'await' to wait for transaction confirmation.
          return;
        } else {
          if (preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_NETWORK) {
            hyphenError = `❌ Target chain id is not supported yet`;
          } else if (preTransferStatus.code === RESPONSE_CODES.NO_LIQUIDITY) {
            hyphenError = `❌ No liquidity available on target chain for given token`;
          } else if (
            preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_TOKEN
          ) {
            hyphenError = `❌ Requested token is not supported on fromChain yet`;
          } else {
            hyphenError = `❌ Any other unexpected error`;
          }
          console.error(hyphenError);
          throw hyphenError;
        }
      }
    

    // async function burn(value) {

    //     console.log("Burning ...", value)

    //     setIsLoading(true)
    //     const normalisedAmount = ethers.utils.parseUnits(value, props.token.decimals)
    //     let finalAmount = BigNumber.from(normalisedAmount)

    //     const maticPOSClient = new MaticPOSClient({
    //         network: "testnet",
    //         version: "mumbai",
    //         parentProvider: window.ethereum,
    //         maticProvider: window.ethereum
    //     });

    //     let from = props.address // THE USER HAS TO BURN THEIR TOKEN TO RECIEVE IT ON THE OTHER SIDE
    //     console.log(props.token.polygonAddress, finalAmount, from )

    //     let reciept = await maticPOSClient.burnERC20(props.token.polygonAddress, finalAmount.toString(), { from });

    //     console.log("Success! Here is your reciept: ", reciept)
    //     setIsLoading(false)
    // }

    async function exit() {
        console.log("Retrieving DAI....... ")
        setIsLoading(true)
        const posERC20Predicate = '0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34'
        const POSRootChainManager = '0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74'
        let from = props.address 

        const maticPOSClient = new MaticPOSClient({
            network: "testnet",
            version: "mumbai",
            parentProvider: window.ethereum,
            maticProvider: "https://rpc-mumbai.maticvigil.com",
            // posERC20Predicate: posERC20Predicate,
            // posRootChainManager: POSRootChainManager,
            // parentDefaultOptions: { from: from },
            // maticDefaultOptions: { from: from }
        });

        let burnTxHash = "0x52dad223da5789a045f6121af503119c7170f688ba55ad4116f9ce71005e0526"


        let reciept = await maticPOSClient.exitERC20(burnTxHash, { from });
        
        
        console.log("Success! Here is your reciept: ", reciept)
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
                    <Tab>Actions</Tab>
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
                        <FormControl id="Actions">
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
                            {
                                window.ethereum.networkVersion === GOERLI_NETWORK_ID ?
                                    (<HStack spacing="24px" justify="center" pt="6">
                                    
                                        (<Button isDisabled={isApproved} isLoading={isLoading} onClick = {() => permit() }> Permit </Button>
                                        <Button isLoading={isLoading} onClick = {() => deposit(depositValue) }> Deposit </Button> 
                                        <Button isLoading={isLoading} onClick = {() => exit() }> Exit </Button> )
                                    </HStack>)
                                    :
                                    (<HStack spacing="24px" justify="center" pt="6">
                                        {/* (<Button isLoading={isLoading} onClick = {() => burn(depositValue) }> Burn </Button>) */}
                                    </HStack>)
                            }
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
                            <Button isLoading={isLoading} onClick = {() => 
                                withdraw(props.networktokens[props.tokenname].address.toString().toLowerCase(), depositValue)} 
                            > Withdraw </Button>
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