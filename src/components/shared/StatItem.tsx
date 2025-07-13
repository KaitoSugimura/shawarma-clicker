import { Box, HStack, Text, Badge } from "@chakra-ui/react";

interface StatItemProps {
  label: string;
  value: string;
  tooltip?: string;
  color?: string;
  icon?: string;
}

export function StatItem({
  label,
  value,
  tooltip,
  color = "blue.300",
  icon,
}: StatItemProps) {
  return (
    <Box
      p={4}
      bg="rgba(45, 55, 72, 0.4)"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.600"
      transition="all 0.2s"
      _hover={{ borderColor: "blue.400", bg: "rgba(45, 55, 72, 0.6)" }}
    >
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" color="gray.300" fontWeight="medium">
          {icon && (
            <Text as="span" mr={2}>
              {icon}
            </Text>
          )}
          {label}
        </Text>
        {tooltip && (
          <Badge
            variant="outline"
            colorScheme="blue"
            fontSize="xs"
            cursor="help"
            title={tooltip}
          >
            ?
          </Badge>
        )}
      </HStack>
      <Text fontSize="3xl" fontWeight="bold" color={color} mt={2}>
        {value}
      </Text>
    </Box>
  );
}
