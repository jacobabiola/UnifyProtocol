import { Stat, StatLabel, StatNumber, HStack, Button } from "@chakra-ui/react"
import { GOERLI_NETWORK_ID } from "../App"
import { FeeGrid } from "./FeeGrid"
import { BigNumber } from "ethers";

export const Jet = (props) => {

    return (
      <div>
        {window.ethereum.networkVersion === GOERLI_NETWORK_ID ? (
          <div>
            <FeeGrid
              tokensRecieved={(Number(props.value) - (Number(props.value) * 0.003)).toFixed(2)}
              eta={"ETA: 3 minutes"}
              collectedfees={`0.3 %`}
              collectedtext={"Biconomy fee"}
              txnfees={"~ $4"}
              txntext={"You pay gas fees for approve+deposit"}
            />
            <Stat pt={5}>
              <StatLabel>Total</StatLabel>
              <StatNumber>
              {parseFloat(props.value)}{" "}
                DAI
              </StatNumber>
            </Stat>
            <HStack spacing="24px" justify="center" pt="6">
              <Button
                isLoading={props.loading}
                onClick={() =>
                  props.moveFunds(String(parseFloat(props.value) + props.fee))
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
              tokensRecieved={(Number(props.value) - (Number(props.value) * 0.003)).toFixed(2)}
              eta={"ETA: 3 minutes"}
              collectedfees={`0.3 %`}
              collectedtext={"Biconomy fee"}
              txnfees={"$0.01"}
              txntext={"Not included in total"}
            />
            <Stat pt={5}>
              <StatLabel>Total</StatLabel>
              <StatNumber>{parseFloat(props.value)} DAI</StatNumber>
            </Stat>
            <HStack spacing="24px" justify="center" pt="6">
              <Button
                isLoading={props.loading}
                onClick={() => props.polyapprove(String(props.fee))}
              >
                {" "}
                Approve{" "}
              </Button>
              <Button
                isLoading={props.loading}
                onClick={() => props.burn(props.value)}
              >
                {" "}
                Go{" "}
              </Button>
            </HStack>
          </div>
        )}
      </div>
    );
  }