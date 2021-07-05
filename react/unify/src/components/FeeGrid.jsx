import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
  } from "@chakra-ui/react"

export const FeeGrid = (props) => {
    return (
        <SimpleGrid columns={{ base: 1, md: 3, }} spacing="6" pt={5} >
            <Stat>
                <StatLabel>Tokens You Receive</StatLabel>
                <StatNumber>{props.tokensReceived}</StatNumber>
                <StatHelpText>{props.eta}</StatHelpText>
            </Stat>
            <Stat>
                <StatLabel>Collected Fees</StatLabel>
                <StatNumber>{props.collectedfees}</StatNumber>
                <StatHelpText>{props.collectedtext} </StatHelpText>
            </Stat>
            <Stat>
                <StatLabel>Transaction Fees</StatLabel>
                <StatNumber>{props.txnfees}</StatNumber>
                <StatHelpText>{props.txntext}</StatHelpText>
            </Stat>
        </SimpleGrid>
    )
  }

