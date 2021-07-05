import { Box, Heading, SimpleGrid, Text, useColorModeValue as mode } from '@chakra-ui/react'
import * as React from 'react'
import { GOERLI_NETWORK_ID } from '../../App'
import { PricingCard } from './PricingCard'

export const VaultHome = (props) => {

  // var token = {
  //   address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  //   polygonAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  //   symbol: "DAI",
  //   image: "https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png",
  //   decimals: 18
  // }0x2686eca13186766760a0347ee8eeb5a88710e11b

  var goerliToken = {
    address: "0x2686eca13186766760a0347ee8eeb5a88710e11b",
    polygonAddress: "0x27a44456bEDb94DbD59D0f0A14fE977c777fC5C3",
    symbol: "DAI",
    image: "https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png",
    decimals: 18
  }

  let oppositeNetwork = window.ethereum.networkVersion === GOERLI_NETWORK_ID ? "Polygon" : "Ethereum"

  return (
    <Box as="section" bg={mode('gray.50', 'gray.800')} py="20">
      <Box
        maxW={{
          base: 'xl',
          md: '7xl',
        }}
        mx="auto"
        px={{
          base: '6',
          md: '8',
        }}
      >
        <Heading
          as="h1"
          size="2xl"
          fontWeight="extrabold"
          textAlign={{
            sm: 'center',
          }}
        >
          Unify Bridge on {props.networkname}
        </Heading>
        <Text
          mt="4"
          maxW="xl"
          mx="auto"
          fontSize="xl"
          color={mode('gray.600', 'gray.400')}
          textAlign={{
            sm: 'center',
          }}
        >
          The cheapest way to move tokens between Ethereum and Polygon.  
        </Text>

        <SimpleGrid
          alignItems="flex-start"
          mt={{
            base: '10',
            lg: '24',
          }}
          columns={{
            base: 1,
            lg: 3,
          }}
          spacing={{
            base: '12',
            lg: '8',
          }}
        >
          <PricingCard
            name="Jet"
            description="Put your tokens on the private jet and arrive instantly at your destination"
            price={"0.3%"}
            features={[
              'Premium Service',
              `Arrive On ${oppositeNetwork} Network Instantly`,
              'Powered By Biconomy',
            ]}
            token={goerliToken}
            networktokens={props.networktokens}
            ethvault={props.ethvault}
            address={props.address}
            provider={props.provider}
            opposite={oppositeNetwork}
          />
          <PricingCard
            popular
            name="Bus"
            description="Put your tokens on the bus and share fees with your fellow passengers"
            price={"$3"}
            features={[
              'Pooling Service',
              `Cheapest Way To Move Your Tokens`,
              'No Transaction Fees',
              `Arrive On ${oppositeNetwork} In 24hrs`,
            ]}
            token={goerliToken}
            ethvault={props.ethvault}
            address={props.address}
            provider={props.provider}
            opposite={oppositeNetwork}

          />

          <PricingCard
            name="Taxi"
            description="Put your tokens in a taxi and get to your destination sooner by riding solo"
            price={"$10"}
            features={[
              'Private Service',
              `Arrive On ${oppositeNetwork} In 10 Minutes`,
              'Powered By Polygon Bridge'
              
            ]}
            token={goerliToken}
            ethvault={props.ethvault}
            address={props.address}
            provider={props.provider}
            opposite={oppositeNetwork}

          />
        </SimpleGrid>
      </Box>
    </Box>
  )
}
