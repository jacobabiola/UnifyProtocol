import { Box, createIcon, Flex, List, ListItem, Text, useColorModeValue as mode } from '@chakra-ui/react'
import * as React from 'react'
import VaultModal from './VaultModal'
const CheckIcon = createIcon({
  viewBox: '0 0 17 12',
  d: 'M0 5.82857L1.64571 4.11429L5.48571 7.2L14.8114 0L16.4571 1.71429L5.48571 12L0 5.82857Z',
})

const PricingDetail = (props) => {
  const { children, ...rest } = props
  return (
    <ListItem display="flex" alignItems="flex-start" fontWeight="medium" maxW="260px" {...rest}>
      <CheckIcon mr="4" mt="1" color={mode('blue.500', 'blue.300')} />
      <Text as="span" display="inline-block">
        {children}
      </Text>
    </ListItem>
  )
}

const PopularBadge = (props) => (
  <Box
    whiteSpace="nowrap"
    top="-4"
    left="50%"
    transform="translateX(-50%)"
    pos="absolute"
    rounded="md"
    fontWeight="bold"
    fontSize="sm"
    px="4"
    py="1"
    textTransform="uppercase"
    bg="blue.500"
    color="white"
    {...props}
  />
)

const ApyDisplay = (props) => {
  const { price } = props
  return (
    <Flex w="100%" align="center" justify="center" my="5" fontWeight="extrabold">

      <Text fontSize="72px" lineHeight="1" letterSpacing="tight">
        {price}
      </Text>
    </Flex>
  )
}

const PricingWrapper = (props) => {
  const { highlight, ...rest } = props
  const popularStyles = {
    borderWidth: '2px',
    borderColor: 'blue.500',
    zIndex: 1,
    px: '8',
    pt: '12',
    pb: '10',
    top: {
      lg: '-8',
    },
  }
  const styles = highlight ? popularStyles : null
  return (
    <Box
      w="full"
      maxW="md"
      mx="auto"
      bg={mode('white', 'gray.700')}
      px="10"
      pt="8"
      pb="8"
      rounded="lg"
      shadow="base"
      position="relative"
      {...styles}
      {...rest}
    />
  )
}

export const PricingCard = (props) => {
  const { onClick, features, name, description, price, popular, ...rest } = props
  return (
    <PricingWrapper highlight={popular} {...rest}>
      {popular && <PopularBadge>Cheapest</PopularBadge>}

      <Flex direction="column" justify="center">
        <Text align="center" fontSize="2xl" fontWeight="bold">
          {name}
        </Text>
        <Text align="center" mt="2" color={mode('gray.600', 'gray.400')} maxW="16rem" mx="auto">
          {description}
        </Text>
        {/* <PriceDisplay currency="$" price={price} /> */}
        <ApyDisplay price={price} />
        <Box
          as="button"
          display="inline-flex"
          mx="auto"
          color={mode('blue.500', 'blue.300')}
          fontWeight="semibold"
        >
          Ticket Price
        </Box>
      </Flex>

      <List stylePosition="outside" mt="8" spacing={4}>
        {features.map((feature, idx) => (
          <PricingDetail key={idx}>{feature}</PricingDetail>
        ))}
      </List>

      <VaultModal
        name={props.name}
        disabled={!popular}
        token={props.token}
        tokenname={props.token.symbol}
        networktokens={props.networktokens}
        ethvault={props.ethvault}
        address={props.address}
        provider={props.provider}
        opposite={props.opposite}
      />
    </PricingWrapper>
  );
}
