import { Box, VStack, Text, Image } from "@chakra-ui/react";
import type { ShawarmaDisplayProps } from "./interfaces";
import { formatPerSecond } from "../../utils/gameUtils";

export function ShawarmaDisplay({
  onClick,
  shawarmasPerClick,
  clickMultiplier,
  shawarmasPerSecond,
  clickAnimations,
  productionAnimations,
}: ShawarmaDisplayProps) {
  return (
    <VStack gap={{ base: 3, md: 6 }} align="center" zIndex="2">
      {/* Instructions text - only show on medium+ screens */}
      <Text
        fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
        textAlign="center"
        color="orange.300"
        fontWeight="semibold"
        px={4}
        display={{ base: "none", md: "block" }}
      >
        Click the Shawarma to earn more!
      </Text>

      {/* Main Shawarma */}
      <Box position="relative" zIndex="10">
        <Box
          onClick={onClick}
          cursor="pointer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          w={{
            base: "180px",
            sm: "220px",
            md: "300px",
            lg: "400px",
          }}
          h={{
            base: "180px",
            sm: "220px",
            md: "300px",
            lg: "400px",
          }}
          fontSize={{
            base: "120px",
            sm: "150px",
            md: "200px",
            lg: "280px",
          }}
          borderRadius="full"
          bg="radial-gradient(circle at 30% 30%, rgba(255, 165, 0, 0.15), rgba(255, 140, 0, 0.05))"
          boxShadow={`
            0 0 0 1px rgba(255, 165, 0, 0.2),
            0 0 20px rgba(255, 165, 0, 0.25),
            0 0 40px rgba(255, 140, 0, 0.15),
            0 0 60px rgba(255, 165, 0, 0.08),
            inset 0 0 20px rgba(255, 255, 255, 0.08)
          `}
          position="relative"
          transform="scale(1)"
          transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          _hover={{
            transform: "scale(1.05)",
            boxShadow: `
              0 0 0 1px rgba(255, 165, 0, 0.3),
              0 0 25px rgba(255, 165, 0, 0.35),
              0 0 50px rgba(255, 140, 0, 0.25),
              0 0 75px rgba(255, 165, 0, 0.12),
              0 0 100px rgba(255, 140, 0, 0.06),
              inset 0 0 25px rgba(255, 255, 255, 0.12)
            `,
          }}
          _active={{
            transform: "scale(0.95)",
            boxShadow: `
              0 0 0 1px rgba(255, 165, 0, 0.4),
              0 0 15px rgba(255, 165, 0, 0.4),
              0 0 30px rgba(255, 140, 0, 0.3),
              inset 0 0 30px rgba(255, 255, 255, 0.15)
            `,
          }}
          _before={{
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "100%",
            borderRadius: "full",
            background:
              "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
            animation:
              shawarmasPerSecond > 0
                ? "luxuryShimmer 3s ease-in-out infinite"
                : "none",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <Image
            src="/Shawarma.svg"
            alt="Shawarma"
            w="70%"
            h="70%"
            objectFit="contain"
            filter="brightness(0.9) saturate(0.8) drop-shadow(0 0 6px rgba(255, 165, 0, 0.3))"
            animation={
              shawarmasPerSecond > 0
                ? "premiumPulse 4s ease-in-out infinite"
                : "none"
            }
            position="relative"
            zIndex={2}
            transition="all 0.2s ease-in-out"
            userSelect="none"
            draggable={false}
            _hover={{
              filter:
                "brightness(1.0) saturate(0.9) drop-shadow(0 0 8px rgba(255, 165, 0, 0.5))",
            }}
          />

          {/* Click Animation Overlay */}
          {clickAnimations.map((animation) => (
            <Box
              key={animation.id}
              position="absolute"
              left={`${animation.x}%`}
              top={`${animation.y}%`}
              fontSize="3xl"
              fontWeight="bold"
              color="orange.300"
              pointerEvents="none"
              transform="translate(-50%, -50%)"
              animation="clickPop 0.6s ease-out forwards"
              zIndex="20"
              textShadow="0 0 10px rgba(255, 165, 0, 0.8)"
            >
              +{shawarmasPerClick * clickMultiplier}
            </Box>
          ))}

          {/* Production Animation Overlay */}
          {productionAnimations.map((animation) => (
            <Box
              key={animation.id}
              position="absolute"
              left={`${animation.x}%`}
              top={`${animation.y}%`}
              fontSize="2xl"
              fontWeight="bold"
              color="green.300"
              pointerEvents="none"
              transform="translate(-50%, -50%)"
              animation="productionFloat 2s ease-out forwards"
              zIndex="15"
              textShadow="0 0 15px rgba(72, 187, 120, 0.9)"
              _before={{
                content: '"⚡"',
                mr: 1,
                fontSize: "lg",
              }}
            >
              +
              {animation.amount >= 1
                ? animation.amount.toFixed(1)
                : animation.amount.toFixed(2)}
            </Box>
          ))}
        </Box>

        {/* Click multiplier indicator */}
        {clickMultiplier > 1 && (
          <Box
            position="absolute"
            top="-10px"
            right="-10px"
            bg="purple.500"
            color="white"
            fontSize="sm"
            fontWeight="bold"
            px={2}
            py={1}
            borderRadius="full"
            boxShadow="0 0 10px rgba(128, 90, 213, 0.6)"
            animation="pulse 1s ease-in-out infinite"
          >
            🔥{clickMultiplier}x
          </Box>
        )}
      </Box>

      {/* Per-click and Per-second display for desktop */}
      <VStack gap={2} display={{ base: "none", md: "flex" }}>
        <Text
          fontSize="xl"
          fontWeight="semibold"
          color="orange.300"
          textAlign="center"
        >
          +{shawarmasPerClick * clickMultiplier} per click
          {clickMultiplier > 1 && (
            <Text as="span" color="purple.400" fontWeight="bold">
              {" "}
              (🔥 Frenzy!)
            </Text>
          )}
        </Text>

        {shawarmasPerSecond > 0 && (
          <Box
            px={4}
            py={2}
            bg="rgba(26, 32, 44, 0.7)"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="cyan.600"
          >
            <Text
              fontSize="md"
              color="cyan.300"
              textAlign="center"
              fontWeight="medium"
            >
              🏭 Auto-production: +{formatPerSecond(shawarmasPerSecond)}/sec
            </Text>
          </Box>
        )}

        {shawarmasPerSecond > 0 && (
          <Box
            w="200px"
            h="3"
            bg="rgba(74, 85, 104, 0.6)"
            borderRadius="full"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.600"
          >
            <Box
              h="full"
              bg="linear-gradient(90deg, cyan.400, cyan.300, cyan.400)"
              borderRadius="full"
              animation="progressBar 1s ease-in-out infinite"
              boxShadow="0 0 10px rgba(56, 178, 172, 0.4)"
            />
          </Box>
        )}
      </VStack>
    </VStack>
  );
}
