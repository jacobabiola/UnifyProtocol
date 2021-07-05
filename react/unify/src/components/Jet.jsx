import { Stat, StatLabel, StatNumber, HStack, Button } from "@chakra-ui/react";
import { GOERLI_NETWORK_ID, MUMBAI_NETWORK_ID } from "../App";
import { FeeGrid } from "./FeeGrid";
import { ethers, BigNumber } from "ethers";
import { Hyphen } from "@biconomy/hyphen";
import { RESPONSE_CODES } from "@biconomy/hyphen";

export const Jet = (props) => {
  let liquidityPoolManagerAddys = {};
  liquidityPoolManagerAddys[MUMBAI_NETWORK_ID] =
    "0xf458fBA2c37e2bA50e7c853E18390769E9bE49Ef";
  liquidityPoolManagerAddys[GOERLI_NETWORK_ID] =
    "0x2e47ae3477645f44cf0cf3616032b0b29da96fc5";

  async function takeJet(
    pProvider,
    userAddress,
    ptokenAddress,
    tokenDecimals,
    pValue,
    sourceNetworkId,
    targetNetworkId
  ) {
    var withdrawDetails = {
      tokenAddress: ptokenAddress,
      senderAddress: userAddress,
      value: BigNumber.from(ethers.utils.parseUnits(pValue, tokenDecimals)),
    };
    const hyphenDepositDetails = {
      sender: userAddress,
      receiver: userAddress,
      tokenAddress: ptokenAddress,
      //   depositContractAddress: "0xdC3DB0281E78A9C565D326ACE0A430478C7193b5", // MUMBAI - LiquidityPoolManager - https://docs.biconomy.io/products/hyphen-instant-cross-chain-transfers/contract-addresses
      depositContractAddress:
        liquidityPoolManagerAddys[window.ethereum.networkVersion], // MUMBAI - LiquidityPoolManager - SDK
      amount: withdrawDetails.value,
      fromChainId: sourceNetworkId,
      toChainId: targetNetworkId,
    };
    props.setIsLoading(true);
    try {
      let hyphen = new Hyphen(pProvider, {
        debug: true, // If 'true', it prints debug logs on console window
        environment: "test", // It can be "test" or "prod"
        onFundsTransfered: (data) => {
          props.setIsLoading(false);
          console.log("Transferred!");
        },
      });

      await hyphen.init();

      await biconomyPreChecks(
        hyphen,
        userAddress,
        withdrawDetails,
        hyphenDepositDetails.depositContractAddress,
        sourceNetworkId,
        targetNetworkId
      );

      let depositTx = await hyphen.deposit(hyphenDepositDetails);

      // Wait for 1 block confirmation
      await depositTx.wait(1);
    } catch (error) {
      props.setIsLoading(false);
      console.error(error);
    }
  }

  async function goPolygonToEthereum(
    pProvider,
    userAddress,
    ptokenAddress,
    tokenDecimals,
    pValue
  ) {
    console.log(`⚠️ Make sure your provider is on the Polygon side`);
    takeJet(
      pProvider,
      userAddress,
      ptokenAddress,
      tokenDecimals,
      pValue,
      MUMBAI_NETWORK_ID,
      GOERLI_NETWORK_ID
    );
  }

  async function goEthereumToPolygon(
    pProvider,
    userAddress,
    ptokenAddress,
    tokenDecimals,
    pValue
  ) {
    console.log(`⚠️ Make sure your provider is on the Polygon side`);
    takeJet(
      pProvider,
      userAddress,
      ptokenAddress,
      tokenDecimals,
      pValue,
      GOERLI_NETWORK_ID,
      MUMBAI_NETWORK_ID
    );
  }

  async function biconomyPreChecks(
    hyphen,
    userAddress,
    withdrawDetails,
    liquidityPoolManagerAddy,
    sourceNetworkId,
    targetNetworkId
  ) {
    let preTransferStatus = await hyphen.preDepositStatus({
      tokenAddress: withdrawDetails.tokenAddress, // Token address on fromChain which needs to be transferred
      amount: withdrawDetails.value, // Amount of tokens to be transferred in smallest unit eg wei
      fromChainId: sourceNetworkId, // Chain id from where tokens needs to be transferred
      toChainId: targetNetworkId, // Chain id where tokens are supposed to be sent
      userAddress: withdrawDetails.senderAddress, // User wallet address who want's to do the transfer
    });
    let hyphenError = `UNKNOWN`;

    if (preTransferStatus.code === RESPONSE_CODES.OK) {
      // ✅ ALL CHECKS PASSED. Proceed to do deposit transaction
      //double verify if allowance is enough
      console.log(`LPM Addy:`, liquidityPoolManagerAddy);
      const currAllow = await hyphen.getERC20Allowance(
        withdrawDetails.tokenAddress,
        userAddress,
        liquidityPoolManagerAddy
      );
      if (BigNumber.from(currAllow).lt(BigNumber.from(withdrawDetails.value))) {
        console.log(`withdrawDetails.value`, withdrawDetails.value.toString());
        console.log(`currAllow`, BigNumber.from(currAllow).toString());
        let approveTx = await hyphen.approveERC20(
          withdrawDetails.tokenAddress,
          preTransferStatus.depositContract,
          withdrawDetails.value.toString()
        );

        // ⏱Wait for transaction to confirm, pass number of blocks to wait as param
        return approveTx.wait(2);
      } else return;
    } else if (preTransferStatus.code === RESPONSE_CODES.ALLOWANCE_NOT_GIVEN) {
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
      } else if (preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_TOKEN) {
        hyphenError = `❌ Requested token is not supported on fromChain yet`;
      } else {
        hyphenError = `❌ Any other unexpected error`;
      }
      console.error(hyphenError);
      throw hyphenError;
    }
  }

  return (
    <div>
      {window.ethereum.networkVersion === GOERLI_NETWORK_ID ? (
        <div>
          <FeeGrid
            tokensReceived={(
              Number(props.value) -
              Number(props.value) * 0.003
            ).toFixed(2)}
            eta={"ETA: 1 minute"}
            collectedfees={`0.3 %`}
            collectedtext={"Biconomy fee"}
            txnfees={"Ξ 0.005"}
            txntext={"You pay gas fees for approve+deposit"}
          />
          <Stat pt={5}>
            <StatLabel>Total</StatLabel>
            <StatNumber>{parseFloat(props.value)} DAI</StatNumber>
          </Stat>
          <HStack spacing="24px" justify="center" pt="6">
            <Button
              isLoading={props.loading}
              onClick={() =>
                goEthereumToPolygon(
                  props.provider,
                  props.useraddress,
                  props.networktoken.address,
                  props.networktoken.decimals,
                  props.value
                )
              }
            >
              {" "}
              Go{" "}
            </Button>
            {/* <Button isLoading={isLoading} onClick = {() => deposit(depositValue) }> Deposit </Button>  */}
          </HStack>
        </div>
      ) : (
        <div>
          <FeeGrid
            tokensReceived={(
              Number(props.value) -
              Number(props.value) * 0.003
            ).toFixed(2)}
            eta={"ETA: 3 minutes"}
            collectedfees={`0.3 %`}
            collectedtext={"Biconomy fee"}
            txnfees={"0.005"}
            txntext={"MATIC for approve+deposit"}
          />
          <Stat pt={5}>
            <StatLabel>Total</StatLabel>
            <StatNumber>{parseFloat(props.value)} DAI</StatNumber>
          </Stat>
          <HStack spacing="24px" justify="center" pt="6">
            {/* <Button
                isLoading={props.loading}
                onClick={() => props.polyapprove(String(props.fee))}
              >
                {" "}
                Approve{" "}
              </Button> */}
            <Button
              isLoading={props.loading}
              onClick={() =>
                goPolygonToEthereum(
                  props.provider,
                  props.useraddress,
                  props.networktoken.address,
                  props.networktoken.decimals,
                  props.value
                )
              }
            >
              {" "}
              Go{" "}
            </Button>
          </HStack>
        </div>
      )}
    </div>
  );
};
