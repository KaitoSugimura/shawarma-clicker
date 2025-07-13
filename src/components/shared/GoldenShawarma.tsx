import { Box, Text } from "@chakra-ui/react";

interface GoldenShawarmaState {
  visible: boolean;
  x: number;
  y: number;
  timeLeft: number;
}

interface GoldenShawarmaProps {
  goldenShawarma: GoldenShawarmaState | null;
  onGoldenShawarmaClick: () => void;
}

export function GoldenShawarma({
  goldenShawarma,
  onGoldenShawarmaClick,
}: GoldenShawarmaProps) {
  if (!goldenShawarma?.visible) {
    return null;
  }

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <Box
      position="absolute"
      left={`${goldenShawarma.x}%`}
      top={`${goldenShawarma.y}%`}
      cursor="pointer"
      onClick={onGoldenShawarmaClick}
      zIndex={1000}
      transform="translate(-50%, -50%)"
      animation="goldenPulse 1.5s ease-in-out infinite, goldenFloat 3s ease-in-out infinite"
      _hover={{
        animation:
          "goldenPulse 0.8s ease-in-out infinite, goldenFloat 3s ease-in-out infinite, goldenSpin 2s linear infinite",
      }}
    >
      {/* Main Golden Shawarma */}
      <Box
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="80px"
        h="80px"
        borderRadius="full"
        bg="radial-gradient(circle at 30% 30%, #FFD700, #FFA500, #FF8C00)"
        boxShadow="0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.3)"
        border="3px solid"
        borderColor="yellow.200"
        transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
        _hover={{
          transform: "scale(1.1)",
          boxShadow:
            "0 0 40px rgba(255, 215, 0, 1), 0 0 80px rgba(255, 215, 0, 0.6), inset 0 0 25px rgba(255, 255, 255, 0.4)",
        }}
        _active={{
          transform: "scale(0.9)",
        }}
      >
        {/* Sparkle Effects */}
        <Box
          position="absolute"
          top="-5px"
          right="10px"
          fontSize="12px"
          animation="sparkle 2s ease-in-out infinite"
          color="white"
          textShadow="0 0 10px rgba(255, 255, 255, 0.8)"
        >
          ✨
        </Box>
        <Box
          position="absolute"
          bottom="5px"
          left="5px"
          fontSize="10px"
          animation="sparkle 2s ease-in-out infinite 0.5s"
          color="white"
          textShadow="0 0 10px rgba(255, 255, 255, 0.8)"
        >
          ⭐
        </Box>
        <Box
          position="absolute"
          top="10px"
          left="-5px"
          fontSize="8px"
          animation="sparkle 2s ease-in-out infinite 1s"
          color="yellow.100"
          textShadow="0 0 8px rgba(255, 255, 255, 0.6)"
        >
          ✦
        </Box>

        {/* Main Shawarma Emoji */}
        <Text
          fontSize="40px"
          filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))"
          animation="goldenGlow 2s ease-in-out infinite"
        >
          🥙
        </Text>
      </Box>

      {/* Timer Display */}
      <Box
        position="absolute"
        bottom="-20px"
        left="50%"
        transform="translateX(-50%)"
        bg="rgba(0, 0, 0, 0.8)"
        color="gold"
        px={2}
        py={1}
        borderRadius="full"
        fontSize="xs"
        fontWeight="bold"
        textShadow="0 0 5px rgba(255, 215, 0, 0.8)"
        boxShadow="0 0 10px rgba(255, 215, 0, 0.4)"
        border="1px solid"
        borderColor="yellow.400"
      >
        {formatTime(goldenShawarma.timeLeft)}
      </Box>

      {/* CSS Animations */}
      <style>{`
        @keyframes goldenPulse {
          0%, 100% { 
            filter: brightness(1) drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
          }
          50% { 
            filter: brightness(1.2) drop-shadow(0 0 35px rgba(255, 215, 0, 0.9));
          }
        }

        @keyframes goldenFloat {
          0%, 100% { 
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% { 
            transform: translate(-50%, -50%) translateY(-8px);
          }
        }

        @keyframes goldenSpin {
          from { 
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to { 
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes goldenGlow {
          0%, 100% { 
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4);
          }
          50% { 
            text-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.6);
          }
        }

        @keyframes sparkle {
          0%, 100% { 
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          25% { 
            opacity: 0.5;
            transform: scale(1.2) rotate(90deg);
          }
          50% { 
            opacity: 1;
            transform: scale(0.8) rotate(180deg);
          }
          75% { 
            opacity: 0.7;
            transform: scale(1.1) rotate(270deg);
          }
        }
      `}</style>
    </Box>
  );
}
