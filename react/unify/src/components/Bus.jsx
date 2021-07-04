import { Stat, StatLabel, StatNumber, HStack, Button } from "@chakra-ui/react"
import { GOERLI_NETWORK_ID } from "../App"
import { FeeGrid } from "./FeeGrid"

export const Bus = (props) => {

    return (
        <div>

            {
                window.ethereum.networkVersion === GOERLI_NETWORK_ID ?
                    (                        
                    <div>
                        <FeeGrid
                            tokensRecieved={parseFloat(props.value)}
                            eta={"ETA: Monday 5th July"}
                            collectedfees={`${props.fee} DAI`}
                            collectedtext={"We charge a fixed rate"}
                            txnfees={"$0"}
                            txntext={"You dont pay gas fees"}
                        />
                        <Stat pt={5}>
                                <StatLabel>Total</StatLabel>
                                <StatNumber>{parseFloat(props.value) + props.fee} DAI</StatNumber>
                        </Stat>
                        <HStack spacing="24px" justify="center" pt="6">
                            <Button isLoading={props.loading} onClick = {() => props.moveFunds(String(parseFloat(props.value) + props.fee)) }> Buy Ticket </Button>
                            {/* <Button isLoading={isLoading} onClick = {() => deposit(depositValue) }> Deposit </Button>  */}
                        </HStack>

                    </div>
                    )
                    :
                    (
                    <div>

                    <FeeGrid
                            tokensRecieved={parseFloat(props.value)}
                            eta={"ETA: Monday 5th July"}
                            collectedfees={`${props.fee} DAI`}
                            collectedtext={"We charge a fixed rate"}
                            txnfees={"$0.01"}
                            txntext={"Not included in total"}
                        />
                    <Stat pt={5}>
                            <StatLabel>Total</StatLabel>
                            <StatNumber>{parseFloat(props.value) + props.fee} DAI</StatNumber>
                    </Stat>
                    <HStack spacing="24px" justify="center" pt="6">
                        <Button isLoading={props.loading} onClick = {() => props.polyapprove(String(props.fee)) }> Approve </Button>
                        <Button isLoading={props.loading} onClick = {() => props.burn(props.value) }> Buy Ticket </Button>
                    </HStack>
                    </div>
                    )
            }
    </div>
    )
  }