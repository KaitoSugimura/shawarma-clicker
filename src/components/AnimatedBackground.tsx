import React, { useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";

const AnimatedBackground: React.FC = () => {
  // Generate static data that won't change on re-renders
  const rainingData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 16 + Math.random() * 16,
      opacity: 0.2 + Math.random() * 0.3,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 8,
      rotation: Math.random() * 360,
    }));
  }, []);

  const spiceParticles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      hue: 25 + Math.random() * 30,
      lightness: 60 + Math.random() * 20,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
    }));
  }, []);

  const geometricShapes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 800,
      y: Math.random() * 600,
      x2: Math.random() * 800,
      y2: Math.random() * 600,
      x3: Math.random() * 800,
      y3: Math.random() * 600,
      scale: 0.3 + Math.random() * 0.7,
      duration: 8 + Math.random() * 12,
      shape: Math.random() > 0.5 ? "diamond" : "square",
      opacityDuration: 3 + Math.random() * 4,
    }));
  }, []);

  const svgClouds = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      path: `M${Math.random() * 800},${Math.random() * 600} Q${
        Math.random() * 400
      },${Math.random() * 300} ${Math.random() * 800},${Math.random() * 600}`,
      duration: 15 + Math.random() * 20,
    }));
  }, []);

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      pointerEvents="none"
      zIndex="1"
      overflow="hidden"
    >
      {/* Raining Shawarmas Effect */}
      <Box
        position="absolute"
        top="-100px"
        left="0"
        right="0"
        height="calc(100vh + 200px)"
        overflow="hidden"
      >
        {rainingData.map((item) => (
          <Text
            key={`rain-${item.id}`}
            position="absolute"
            fontSize={`${item.size}px`}
            left={`${item.x}%`}
            color={`rgba(251, 211, 141, ${item.opacity})`}
            animation={`rainDrop ${item.duration}s linear infinite`}
            animationDelay={`${item.delay}s`}
            transform={`rotate(${item.rotation}deg)`}
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          >
            🥙
          </Text>
        ))}
      </Box>

      {/* Floating Spice Particles */}
      <Box position="absolute" top="0" left="0" right="0" bottom="0">
        {spiceParticles.map((particle) => (
          <Box
            key={`spice-${particle.id}`}
            position="absolute"
            left={`${particle.x}%`}
            top={`${particle.y}%`}
            w="4px"
            h="4px"
            borderRadius="50%"
            bg={`hsl(${particle.hue}, 80%, ${particle.lightness}%)`}
            boxShadow="0 0 6px currentColor"
            animation={`particleFloat ${particle.duration}s ease-in-out infinite`}
            animationDelay={`${particle.delay}s`}
          />
        ))}
      </Box>

      {/* SVG Geometric Patterns */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.15,
        }}
      >
        <defs>
          <filter id="soften">
            <feGaussianBlur stdDeviation="1" result="softened" />
            <feMerge>
              <feMergeNode in="softened" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="spiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#F7931E" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFD23F" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Swirling spice clouds */}
        {svgClouds.map((cloud) => (
          <g key={`cloud-${cloud.id}`}>
            <path
              d={cloud.path}
              stroke="url(#spiceGrad)"
              strokeWidth="2"
              fill="none"
              filter="url(#soften)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 400 300; 360 400 300"
                dur={`${cloud.duration}s`}
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}

        {/* Floating geometric shapes */}
        {geometricShapes.map((shape) => (
          <polygon
            key={`shape-${shape.id}`}
            points={
              shape.shape === "diamond"
                ? "50,0 100,50 50,100 0,50"
                : "0,0 100,0 100,100 0,100"
            }
            fill="rgba(255, 165, 0, 0.1)"
            stroke="rgba(255, 165, 0, 0.3)"
            strokeWidth="1"
            transform={`translate(${shape.x}, ${shape.y}) scale(${shape.scale})`}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`${shape.x},${shape.y}; ${shape.x2},${shape.y2}; ${shape.x3},${shape.y3}`}
              dur={`${shape.duration}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.1;0.4;0.1"
              dur={`${shape.opacityDuration}s`}
              repeatCount="indefinite"
            />
          </polygon>
        ))}
      </svg>
    </Box>
  );
};

export default AnimatedBackground;
