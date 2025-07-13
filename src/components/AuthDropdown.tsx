import React, { useRef, useState, useEffect } from "react";
import {
  Button,
  Text,
  VStack,
  HStack,
  Icon,
  Box,
  Portal,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import {
  FaUser,
  FaSignInAlt,
  FaSignOutAlt,
  FaCloud,
  FaChevronDown,
} from "react-icons/fa";
import { auth } from "../firebase/config";

interface AuthDropdownProps {
  user: User | null;
  loading: boolean;
}

export const AuthDropdown: React.FC<AuthDropdownProps> = ({
  user,
  loading,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4, // 4px gap below button
        right: window.innerWidth - rect.right, // Align right edges
      });
    }
  }, [isOpen]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <Button size="sm" variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  return (
    <PopoverRoot open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          size="sm"
          variant="outline"
          colorScheme={user ? "green" : "gray"}
        >
          {user ? (
            <HStack gap={2}>
              <Avatar.Root size="sm">
                <Avatar.Image
                  src={user.photoURL || undefined}
                  alt={user.displayName || user.email || "User"}
                />
                <Avatar.Fallback>
                  {(user.displayName || user.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <Text fontSize="sm" maxW="100px" truncate>
                {user.displayName || user.email}
              </Text>
              <Icon as={FaChevronDown} />
            </HStack>
          ) : (
            <HStack gap={2}>
              <Icon as={FaUser} />
              <Text fontSize="sm">Sign In</Text>
              <Icon as={FaChevronDown} />
            </HStack>
          )}
        </Button>
      </PopoverTrigger>

      <Portal>
        <PopoverContent
          minW="240px"
          zIndex={9999}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="2xl"
          borderRadius="md"
          _focus={{ outline: "none" }}
          position="fixed"
          top={`${position.top}px`}
          right={`${position.right}px`}
        >
          <PopoverBody p={0}>
            {user ? (
              <VStack gap={0} align="stretch">
                {/* User Info Header */}
                <Box p={3} bg="gray.50" borderTopRadius="md">
                  <HStack align="center" gap={3} w="full">
                    <Avatar.Root size="md">
                      <Avatar.Image
                        src={user.photoURL || undefined}
                        alt={user.displayName || user.email || "User"}
                      />
                      <Avatar.Fallback>
                        {(user.displayName || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="sm" color="gray.800">
                        {user.displayName || "User"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {user.email}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <Box h="1px" bg="gray.200" />

                {/* Cloud Status */}
                <Box p={3}>
                  <HStack gap={2}>
                    <Icon as={FaCloud} color="green.500" />
                    <Text fontSize="sm" color="green.500">
                      Cloud saves active
                    </Text>
                  </HStack>
                </Box>

                <Box h="1px" bg="gray.200" />

                {/* Sign Out */}
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  justifyContent="flex-start"
                  color="red.500"
                  _hover={{ bg: "red.50" }}
                  borderRadius={0}
                  borderBottomRadius="md"
                  h="auto"
                  p={3}
                >
                  <Icon as={FaSignOutAlt} mr={2} />
                  Sign Out
                </Button>
              </VStack>
            ) : (
              <VStack gap={0} align="stretch">
                {/* Sign In */}
                <Button
                  variant="ghost"
                  onClick={signInWithGoogle}
                  justifyContent="flex-start"
                  color="blue.500"
                  _hover={{ bg: "blue.50" }}
                  borderRadius={0}
                  borderTopRadius="md"
                  h="auto"
                  p={3}
                >
                  <Icon as={FaSignInAlt} mr={2} />
                  Sign In with Google
                </Button>

                <Box h="1px" bg="gray.200" />

                {/* Info */}
                <Box p={3}>
                  <Text fontSize="xs" color="gray.500">
                    Sign in to save progress to the cloud
                  </Text>
                </Box>
              </VStack>
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </PopoverRoot>
  );
};
