import React from "react";
import { Box, Button, Text, VStack, HStack } from "@chakra-ui/react";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase/config";

interface AuthProps {
  user: User | null;
  loading: boolean;
}

export const AuthComponent: React.FC<AuthProps> = ({ user, loading }) => {
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in:", error);
      if (error.code === "auth/popup-closed-by-user") {
        console.log("User closed the popup");
      } else if (error.code === "auth/unauthorized-domain") {
        console.error("Domain not authorized in Firebase console");
        alert("This domain is not authorized. Please contact the developer.");
      } else {
        console.error("Sign-in error code:", error.code);
        console.error("Sign-in error message:", error.message);
      }
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
    return <Text>Loading...</Text>;
  }

  return (
    <Box p={4} bg="gray.100" borderRadius="md" mb={4}>
      {user ? (
        <HStack justify="space-between">
          <VStack align="start" gap={1}>
            <Text fontWeight="bold">
              Welcome, {user.displayName || user.email}!
            </Text>
            <Text fontSize="sm" color="gray.600">
              Your game saves automatically to the cloud
            </Text>
          </VStack>
          <Button colorScheme="red" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </HStack>
      ) : (
        <VStack gap={3}>
          <Text>Sign in to save your progress to the cloud!</Text>
          <Button colorScheme="blue" onClick={signInWithGoogle}>
            Sign In with Google
          </Button>
          <Text fontSize="sm" color="gray.600">
            Without signing in, your progress will only be saved locally
          </Text>
        </VStack>
      )}
    </Box>
  );
};
