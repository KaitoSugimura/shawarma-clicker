import React from "react";
import { Box, Text, HStack, VStack } from "@chakra-ui/react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "achievement" | "upgrade" | "milestone";
  timestamp: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemoveNotification: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onRemoveNotification,
}) => {
  return (
    <VStack
      position="fixed"
      top="80px"
      right="20px"
      zIndex={999}
      gap={2}
      align="stretch"
      w="300px"
    >
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onRemove={() => onRemoveNotification(notification.id)}
        />
      ))}
    </VStack>
  );
};

interface NotificationCardProps {
  notification: Notification;
  onRemove: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onRemove,
}) => {
  // Auto-remove after 3 seconds
  React.useEffect(() => {
    const timer = setTimeout(onRemove, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const getNotificationStyle = () => {
    switch (notification.type) {
      case "achievement":
        return {
          bg: "rgba(26, 32, 44, 0.95)",
          borderColor: "green.400",
          icon: "🏆",
          color: "green.300",
        };
      case "upgrade":
        return {
          bg: "rgba(26, 32, 44, 0.95)",
          borderColor: "blue.400",
          icon: "⬆️",
          color: "blue.300",
        };
      case "milestone":
        return {
          bg: "rgba(26, 32, 44, 0.95)",
          borderColor: "orange.400",
          icon: "✨",
          color: "orange.300",
        };
      default:
        return {
          bg: "rgba(26, 32, 44, 0.95)",
          borderColor: "gray.400",
          icon: "ℹ️",
          color: "gray.300",
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <Box
      bg={style.bg}
      borderWidth="1px"
      borderColor={style.borderColor}
      borderRadius="md"
      p={3}
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.4)"
      cursor="pointer"
      onClick={onRemove}
      animation="slideIn 0.3s ease-out"
      backdropFilter="blur(10px)"
      _hover={{
        transform: "translateX(-5px)",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.5)",
      }}
      transition="all 0.2s"
      maxW="280px"
    >
      <HStack gap={3} align="center">
        <Box
          bg={style.borderColor}
          borderRadius="full"
          w="8"
          h="8"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink="0"
        >
          <Text fontSize="md" color="white">
            {style.icon}
          </Text>
        </Box>
        <VStack align="start" gap={0} flex={1}>
          <Text
            fontSize="sm"
            fontWeight="semibold"
            color="white"
            lineHeight="1.2"
          >
            {notification.title}
          </Text>
          <Text fontSize="xs" color="gray.400" lineHeight="1.3">
            {notification.message}
          </Text>
        </VStack>
      </HStack>

      {/* CSS for slide-in animation */}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default NotificationSystem;
export type { Notification };
