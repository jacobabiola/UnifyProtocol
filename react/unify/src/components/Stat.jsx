import { Box, Badge, Heading, VStack, Text, useColorModeValue as mode } from '@chakra-ui/react'
import * as React from 'react'
import { BsCaretDownFill, BsCaretUpFill } from 'react-icons/bs'

export function StatCard(props) {
  const { label, value, change, description } = props.data
  const isNegative = change < 0
  const changeText = (!change) ? "0.00%" : `${change * 100}%`
  return (
    <Box
      px="6"
      py="4"
      bg={mode('white', 'gray.700')}
      borderRadius="8px"
      boxShadow="md"
      color={mode('gray.800', 'white')}
    >
      <Text fontWeight="medium" fontSize="sm">
        {label}
      </Text>
      <VStack spacing="4" mt="2">
        <Heading as="h4" size="xl" lineHeight="1" letterSpacing="tight">
          {value}
        </Heading>
        {
            changeText && (<Indicator type={isNegative ? 'down' : 'up'} value={changeText} />)
        }
      </VStack>
      {description && (
        <Text fontSize="sm" mt="4" color={mode('gray.500', 'gray.400')}>
          {description}
        </Text>
      )}
    </Box>
  )
}


const types = {
  up: {
    icon: BsCaretUpFill,
    colorScheme: 'green',
  },
  down: {
    icon: BsCaretDownFill,
    colorScheme: 'red',
  },
}

export const Indicator = (props) => {
  const { type, value } = props
  return (
    <Badge
      display="flex"
      alignItems="center"
      variant="solid"
      colorScheme={types[type].colorScheme}
      rounded="base"
      px="1"
      spacing="0"
    >
      <Box
        aria-hidden
        color="currentcolor"
        as={types[type].icon}
        pos="relative"
        top={type === 'down' ? 'px' : undefined}
      />
      <Box srOnly>
        Value is {type} by {value}
      </Box>
      <Text fontSize="sm" color="white" marginStart="1">
        {value}
      </Text>
    </Badge>
  )
}