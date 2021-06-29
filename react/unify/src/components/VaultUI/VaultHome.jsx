import { Box, Heading, SimpleGrid, Text, useColorModeValue as mode } from '@chakra-ui/react'
import * as React from 'react'
import { PricingCard } from './PricingCard'

export const VaultHome = () => {

  var token = {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    symbol: "DAI",
    image: "https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png",
    decimals: 1e18
  }

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
          Unify Vaults
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
          Unify is a cross chain protocol offering you the best interest across Ethereum, Polygon and Binance Smart Chain.  
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
            name="WETH"
            description="Earn interest on your Wrapped Ethereum token and save money on transaction fees"
            price={4}
            features={[
              'Single transaction deposit',
              'Always have the best rate for your crypto',
              'Deposit on Ethereum earn cross chain',
            ]}
            token={token}

          />
          <PricingCard
            popular
            name="DAI"
            description="Earn interest on your DAI tokens and save money on transaction fees"
            price={12}
            features={[
              'Single transaction deposit',
              'Always have the best rate for your crypto',
              'Deposit on Ethereum earn cross chain',
              'Withdraw anytime',

            ]}
            token={token}
          />
          <PricingCard
            name="WBTC"
            description="Earn interest on your Wrapped Bitcoin tokens and save money on transaction fees"
            price={3}
            features={[
              'Single transaction deposit',
              'Always have the best rate for your crypto',
              'Deposit on Ethereum earn cross chain',
            ]}
            token={token}

          />
        </SimpleGrid>
      </Box>
    </Box>
  )
}
