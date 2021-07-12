import React, { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import {
  SimpleGrid,
  Text,
  Image,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  useDisclosure,
} from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { StatCard } from "../Stat";
import { signDaiPermit } from "eth-permit";
import { GOERLI_NETWORK_ID, MUMBAI_NETWORK_ID } from "../../App";
import { MaticPOSClient } from "@maticnetwork/maticjs";
import PolygonVaultArtifact from "../../contracts/PolygonVault.json";
import SimpleBridgeArtifact from "../../contracts/SimpleBridge.json";
import contractAddress from "../../contracts/contract-address.json";

import { Bus } from "../Bus";
import { Jet } from "../Jet";
const axios = require("axios");

const erc20ABI = require("../../contracts/ERC20ABI.json");

function VaultModal(props) {
  const FEE_WE_CHARGE_USER = 3;

  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const format = (val) => `$` + val;
  const parse = (val) => val.replace(/^\$/, "");

  const [depositValue, setDepositValue] = React.useState("0.00");
  const [daiContractBalance, setDaiContractBalance] = useState(0);
  const [yourShares, setYourShares] = useState(0);

  var permitDetails = {
    tokenAddress: props.token.address,
    senderAddress: props.address,
    spender: contractAddress.ETHVault,
  };

  useEffect(() => {
    async function checkBalance() {
      let balance = await props.ethvault.vaultBalance();
      let normalisedBalance = ethers.utils.formatUnits(
        balance.toString(),
        props.token.decimals
      );
      setDaiContractBalance(normalisedBalance);
      console.log("Balance updated to: ", normalisedBalance);
    }

    async function checkBalancePoly() {
      var customHttpProvider = new ethers.providers.JsonRpcProvider(
        "https://rpc-mumbai.maticvigil.com"
      );

      let polygonVaultRead = new ethers.Contract(
        contractAddress.PolygonVault,
        PolygonVaultArtifact.abi,
        customHttpProvider
      );
      let balance = await polygonVaultRead.vaultBalance();
      let normalisedBalance = ethers.utils.formatUnits(
        balance.toString(),
        props.token.decimals
      );
      setDaiContractBalance(normalisedBalance);
      console.log("Balance updated to: ", normalisedBalance);
      setYourShares("NA");
    }

    async function checkShares() {
      let shares = await props.ethvault.userBalance();
      let normalisedShares = ethers.utils.formatUnits(
        shares.toString(),
        props.token.decimals
      );
      setYourShares(normalisedShares);
      console.log("Shares updated to: ", normalisedShares);
    }

    if (isLoading === false && isOpen) {
      if (window.ethereum.networkVersion === GOERLI_NETWORK_ID) {
        checkShares();
        checkBalance();
      } else if (window.ethereum.networkVersion === MUMBAI_NETWORK_ID) {
        checkBalancePoly();
      }
    }
  }, [isLoading, isOpen, props.ethvault, props.token.decimals]);

  async function testFunc() {

    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);

    // let simpleBridge = new ethers.Contract(
    //   contractAddress.SimpleBridge,
    //   SimpleBridgeArtifact.abi,
    //   ethersProvider.getSigner()
    // );

    // let balance1 = await simpleBridge.balanceFor(props.token.polygonAddress);
    // console.log("You have ", ethers.utils.formatEther(balance1), " amount of tokens");

    // let balance2 = await simpleBridge.balanceFor("0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF");
    // console.log("You have ", ethers.utils.formatEther(balance2), " amount of tokens Test Token");

    // const maticPOSClient = new MaticPOSClient({
    //   network: "testnet",
    //   version: "mumbai",
    //   parentProvider: window.ethereum,
    //   maticProvider: "https://rpc-mumbai.maticvigil.com",
    // });

    // let from = props.address
    // let receipt = await maticPOSClient.exitERC20("0x5dcc1c92bcaf9b5631f91371e39671c27467aa31a3ee59c51c56e5dee743a369", { from });
    // console.log("Sucessfully moved funds! Here is your reciept: ", receipt);

    // let iSimpleBridge = new ethers.utils.Interface(SimpleBridgeArtifact.abi);

    // let txn = await simpleBridge.multicall([
    //   iSimpleBridge.encodeFunctionData("withdraw", [ `${props.token.polygonAddress}` ]),
    //   iSimpleBridge.encodeFunctionData("withdraw", [ "0xdA5289fCAAF71d52a80A254da614a192b693e977" ])
    // ], { gasLimit: 2000000 } );

    // const receipt = await txn.wait();
    // console.log("Sucessfully moved funds! Here is your reciept: ", receipt);

    // balance1 = await simpleBridge.balanceFor(props.token.address);
    // console.log("You have ", ethers.utils.formatEther(balance1), " amount of tokens");

    // balance2 = await simpleBridge.balanceFor("0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF");
    // console.log("You have ", ethers.utils.formatEther(balance2), " amount of tokens Test Token");

    // let iSimpleBridge = new ethers.utils.Interface(SimpleBridgeArtifact.abi);

    // let txn = await simpleBridge.multicall([
    //   iSimpleBridge.encodeFunctionData("bridgeToPolygon", [ `${props.token.address}` ]),
    //   iSimpleBridge.encodeFunctionData("bridgeToPolygon", [ "0x655F2166b0709cd575202630952D71E2bB0d61Af" ])
    // ], { gasLimit: 2000000 } );

    // // let txn = await simpleBridge.bridgeToPolygon(props.token.address);
    // const receipt = await txn.wait();
    // console.log("Sucessfully moved funds! Here is your reciept: ", receipt);

    // balance1 = await simpleBridge.balanceFor(props.token.address);
    // console.log("You have ", ethers.utils.formatEther(balance1), " amount of tokens");

    // balance2 = await simpleBridge.balanceFor("0x655F2166b0709cd575202630952D71E2bB0d61Af");
    // console.log("You have ", ethers.utils.formatEther(balance2), " amount of tokens Test Token");
    



    let simpleBridge = new ethers.Contract(
      contractAddress.SimpleBridge,
      SimpleBridgeArtifact.abi,
      ethersProvider.getSigner()
    );

    // Filter for all token transfers from me for DAI
    // let filterFrom = daiContract.filters.Transfer(props.address, null);

    // Filter for all token transfers to me for DAI
    let filterTo = simpleBridge.filters.DepositFor(null, null);

    // List all transfers sent from me a specific block range
    // await daiContract.queryFilter(filterFrom, 9843470, 9843480)

    // List all transfers sent from me a specific block to the latest block
    // await daiContract.queryFilter(filterFrom, 9843470)

    // List all transfers sent in the last 10,000 blocks
    // await daiContract.queryFilter(filterFrom, -10000)
   
    // // Get all DepositFor events
    // let filterTo = simpleBridge.filters.DepositFor(null, null);

    // // Get block from the last week
    // let currentBlock = await ethersProvider.getBlockNumber()
    // let block1WeekAgo = currentBlock - 40320
    // console.log(currentBlock, block1WeekAgo)

    // List all transfers from one week ago
    let results = await simpleBridge.queryFilter(filterTo, -40320)
    console.log("Show All DepositForEvents")
    console.log(results)
    let blocks = results.slice(-2);
    let block1 = blocks[0].blockNumber
    let block2 = blocks[1].blockNumber

    console.log(block1, block2)

    let blockNos = []

    for (const result of results) {
        blockNos.push(result.blockNumber)
    }

    console.log(blockNos)
    console.log([...new Set(blockNos)])



    // var tokenMapping = {
    //   "0x27a44456bEDb94DbD59D0f0A14fE977c777fC5C3" : "0x2686eca13186766760a0347ee8eeb5a88710e11b", // DAI
    //   "0xdA5289fCAAF71d52a80A254da614a192b693e977" : "0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF" // USDC
    // };
    

    // let simpleBridge = new ethers.Contract(
    //   contractAddress.SimpleBridge,
    //   SimpleBridgeArtifact.abi,
    //   ethersProvider.getSigner()
    // );

    // let balance1 = await simpleBridge.balanceFor(props.token.polygonAddress);
    // console.log("You have ", ethers.utils.formatEther(balance1), " amount of tokens");

    // var customHttpProvider = new ethers.providers.JsonRpcProvider(
    //   "https://polygon-mumbai.infura.io/v3/d293abbebf9e48ca9e3fb7957edd38f4"
    // );
    // let daiContract = new ethers.Contract(
    //   props.token.polygonAddress,
    //   erc20ABI,
    //   customHttpProvider
    // );

    // let filter = daiContract.filters.Transfer()
    // let results = await daiContract.queryFilter(filter, -90000)
    // console.log(results)

    // for (const result of results) {
    //     let from = result.args.from
    //     let to = result.args.to
    //     let value = result.args.value

    //     console.log(from, to, ethers.utils.formatEther(value))
    // }


    // console.log(await result[0].getTransaction())

    // daiContract.transfer("0xd297fdcafc10128fb31003e832bc795ad39a1d75", ethers.utils.parseUnits("10", props.token.decimals ))

  }

  async function moveTokensPolygon() {
    setIsLoading(true);
    axios
      .post(
        "https://api.defender.openzeppelin.com/autotasks/a78e3d07-04e9-47f7-8750-e0b3b32bdaee/runs/webhook/c06b9428-d8e4-4cb7-bbda-a258fae7addd/M4uK2vFS8L3DRPH37FuABF",
        {
          contractAddress: contractAddress.ETHVault,
        }
      )
      .then(function (response) {
        console.log(response.data.result);
        setIsLoading(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async function relayPermitAndMoveFunds(value) {
    setIsLoading(true);

    console.log("Permitting relay....");

    const normalisedAmount = ethers.utils.parseUnits(
      value,
      props.token.decimals
    );
    let finalAmount = BigNumber.from(normalisedAmount);
    let finalFee = ethers.utils.parseUnits(
      String(FEE_WE_CHARGE_USER),
      props.token.decimals
    );
    // Ask you to permit us to transfer funds
    const signature = await signDaiPermit(
      window.ethereum,
      permitDetails.tokenAddress,
      permitDetails.senderAddress,
      permitDetails.spender
    );
    console.log("Signature is: ");
    console.log(signature);

    axios
      .post(
        "https://api.defender.openzeppelin.com/autotasks/77946913-64f0-4493-b7bb-6a3e6ee51bca/runs/webhook/c06b9428-d8e4-4cb7-bbda-a258fae7addd/LmqW4LCjP4cGdn1281sJPP",
        {
          contractAddress: contractAddress.ETHVault,
          finalAmount: finalAmount.toString(),
          finalFee: finalFee.toString(),
          senderAddress: permitDetails.senderAddress,
          spender: permitDetails.spender,
          signature: signature,
        },
      )
      .then(function (response) {
        let hash = response.data.result;
        console.log("Sucess! Here is the txnHash: ", hash);
        if (hash) {
          setIsLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async function polyApprove(value) {
    console.log("Approving ...");

    setIsLoading(true);
    const normalisedAmount = ethers.utils.parseUnits(
      value,
      props.token.decimals
    );
    let finalAmount = BigNumber.from(normalisedAmount);
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);

    let TOKEN = new ethers.Contract(
      props.token.polygonAddress,
      erc20ABI,
      ethersProvider.getSigner()
    );
    // Load data from contract
    let approve = await TOKEN.approve(
      contractAddress.PolygonVault,
      finalAmount
    );
    const receipt = await approve.wait();
    console.log(receipt);
    setIsLoading(false);
    console.log("Approved");
  }

  async function burn(value) {
    console.log("Burning ...", value);

    setIsLoading(true);
    const normalisedAmount = ethers.utils.parseUnits(
      value,
      props.token.decimals
    );
    let finalAmount = BigNumber.from(normalisedAmount);

    const maticPOSClient = new MaticPOSClient({
      network: "testnet",
      version: "mumbai",
      parentProvider: window.ethereum,
      maticProvider: window.ethereum,
    });

    let from = props.address; // THE USER HAS TO BURN THEIR TOKEN TO RECEIVE IT ON THE OTHER SIDE
    console.log(props.token.polygonAddress, finalAmount, from);

    let reciept = await maticPOSClient.burnERC20(
      props.token.polygonAddress,
      finalAmount.toString(),
      { from }
    );

    console.log("Successfully burnt tokens! Here is your reciept: ", reciept);
    let burnTxnHash = reciept.transactionHash;

    let finalFee = ethers.utils.parseUnits(
      String(FEE_WE_CHARGE_USER),
      props.token.decimals
    );

    axios
      .post(
        "https://api.defender.openzeppelin.com/autotasks/fd6c0a6b-06eb-45ec-9508-269b9ece91f9/runs/webhook/c06b9428-d8e4-4cb7-bbda-a258fae7addd/Tb12zBH6eeq6kvyTTWKuWQ",
        {
          contractAddress: contractAddress.PolygonVault,
          finalFee: finalFee.toString(),
          senderAddress: permitDetails.senderAddress,
          burnTxnHash: burnTxnHash,
        }
      )
      .then(function (response) {
        let hash = response.data.result;
        console.log("Sucess! Here is the txnHash: ", hash);
        if (hash) {
          setIsLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async function exit() {
    console.log("Retrieving All users DAI....... ");
    setIsLoading(true);

    const ERC20_TRANSFER_EVENT_SIG =
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    const maticPOSClient = new MaticPOSClient({
      network: "testnet",
      version: "mumbai",
      parentProvider: window.ethereum,
      maticProvider: "https://rpc-mumbai.maticvigil.com",
    });
    var customHttpProvider = new ethers.providers.JsonRpcProvider(
      "https://rpc-mumbai.maticvigil.com"
    );

    let polygonVaultRead = new ethers.Contract(
      contractAddress.PolygonVault,
      PolygonVaultArtifact.abi,
      customHttpProvider
    );

    let burnTxnHashes = await polygonVaultRead.getHashes({ gasLimit: 2000000 });
    console.log("We got the hashes: ", burnTxnHashes);

    let proofs = [];

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

    axios
      .post(
        "https://api.defender.openzeppelin.com/autotasks/30308712-cf9e-48e7-b3a3-e9d6d54fa610/runs/webhook/c06b9428-d8e4-4cb7-bbda-a258fae7addd/DtqSi5yiKXCpFqoJjFM9Zh",
        {
          contractAddress: contractAddress.ETHVault,
          proofs: proofs,
        }
      )
      .then(function (response) {
        let hash = response.data.result;
        console.log("Sucess! Here is the txnHash: ", hash);
        if (hash) {
          setIsLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <>
      <Button
        onClick={onOpen}
        minH="3.5rem"
        rounded="lg"
        fontWeight="bold"
        colorScheme={!props.disabled ? "blue" : "gray"}
        mt="8"
        w="100%"
      >
        {" "}
        Buy Ticket{" "}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {props.name} To {props.opposite}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack pb="4">
              <Image
                borderRadius="full"
                boxSize="60px"
                src={props.token.image}
                alt={props.token.symbol}
              />
              <Text color="blue.700" fontWeight="semibold" fontSize="lg">
                {" "}
                {props.token.symbol}{" "}
              </Text>
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
                      onChange={(valueString) =>
                        setDepositValue(parse(valueString))
                      }
                      value={format(depositValue)}
                      precision={3}
                      step={0.001}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText align="left">
                      The amount of {props.token.symbol} you want to trasnfer to{" "}
                      {props.opposite}
                    </FormHelperText>
                    {props.name === "Bus" ? (
                      <Bus
                        value={depositValue}
                        loading={isLoading}
                        burn={burn}
                        moveFunds={relayPermitAndMoveFunds}
                        fee={FEE_WE_CHARGE_USER}
                        polyapprove={polyApprove}
                      />
                    ) : props.name === "Jet" ? (
                      <Jet
                        provider={props.provider}
                        value={depositValue}
                        loading={isLoading}
                        useraddress={props.address}
                        networktoken={props.networktokens[props.tokenname]}
                        setIsLoading={setIsLoading}
                        // polyToEthereum={}
                        // goEthereumToPoly={() => {}}
                        fee={0}
                      />
                    ) : (
                      <div> Taxi stuff goes here </div>
                    )}
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
                    <StatCard
                      data={{
                        label: "Current APY",
                        value: "13%",
                        change: 0.0125,
                        description: "Current interest earned on tokens",
                      }}
                    />
                    <StatCard
                      data={{
                        label: "Current Strategy",
                        value: "AAVE",
                        description:
                          "Interest is currently earned via AAVE protocol",
                      }}
                    />
                    <StatCard
                      data={{
                        label: "Total Value",
                        value: `${daiContractBalance} DAI`,
                        change: 0.1,
                        description: "Amount of DAI deposited in this vault",
                      }}
                    />
                    <StatCard
                      data={{
                        label: "Your Shares",
                        value: `${yourShares}`,
                        change: 0.0012,
                        description: "Value of your shares",
                      }}
                    />
                  </SimpleGrid>
                  <HStack spacing="24px" justify="center" pt="6">
                    <Button
                      isLoading={isLoading}
                      onClick={() => moveTokensPolygon()}
                    >
                      Move to Polygon
                    </Button>
                    <Button isLoading={isLoading} onClick={() => exit()}>
                      {" "}
                      Move to Eth{" "}
                    </Button>
                    <Button onClick={() => testFunc()}> Test</Button>
                  </HStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default VaultModal;
