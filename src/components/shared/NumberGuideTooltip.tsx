import { Box, Text } from "@chakra-ui/react";

export function NumberGuideTooltip() {
  return (
    <Box
      w="100%"
      p={4}
      bg="rgba(72, 187, 120, 0.1)"
      borderRadius="md"
      border="1px solid"
      borderColor="green.500"
    >
      <Text
        fontSize="md"
        color="green.400"
        textAlign="center"
        fontWeight="medium"
      >
        💡 Number Guide: K = Thousands (1,000) • M = Millions (1,000,000) • B =
        Billions (1,000,000,000)
      </Text>
    </Box>
  );
}
