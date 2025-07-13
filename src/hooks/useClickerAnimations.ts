import { useState, useCallback, useEffect } from "react";
import type {
  ClickAnimation,
  ProductionAnimation,
  Notification,
} from "../components/shared/interfaces";
import {
  MAX_CLICK_ANIMATIONS,
  MAX_PRODUCTION_ANIMATIONS,
  ANIMATION_CLEANUP_DELAY,
} from "../constants/gameConstants";

interface UseClickerAnimationsResult {
  clickAnimations: ClickAnimation[];
  productionAnimations: ProductionAnimation[];
  notifications: Notification[];
  clickMultiplier: number;
  addClickAnimation: (x: number, y: number, amount: number) => void;
  addProductionAnimation: (amount: number) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setClickMultiplier: (multiplier: number) => void;
}

export function useClickerAnimations(): UseClickerAnimationsResult {
  const [clickAnimations, setClickAnimations] = useState<ClickAnimation[]>([]);
  const [productionAnimations, setProductionAnimations] = useState<
    ProductionAnimation[]
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [clickMultiplier, setClickMultiplier] = useState(1);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      const newNotifications = [notification, ...prev.slice(0, 3)];
      return newNotifications;
    });

    setTimeout(() => {
      removeNotification(notification.id);
    }, notification.duration || 3000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addClickAnimation = useCallback(
    (x: number, y: number, amount: number) => {
      const now = Date.now();
      const newAnimation: ClickAnimation = {
        id: now + Math.random(),
        x,
        y,
        timestamp: now,
        amount,
      };

      setClickAnimations((prev) => {
        const recentAnimations = prev.filter(
          (anim) => now - anim.timestamp < 1000
        );
        const updated = [...recentAnimations, newAnimation];
        return updated.length > MAX_CLICK_ANIMATIONS
          ? updated.slice(-MAX_CLICK_ANIMATIONS)
          : updated;
      });

      setTimeout(() => {
        setClickAnimations((prev) =>
          prev.filter((anim) => anim.id !== newAnimation.id)
        );
      }, 600);
    },
    []
  );

  const addProductionAnimation = useCallback((amount: number) => {
    const animationCount = Math.min(
      Math.max(1, Math.floor(amount / 100)),
      MAX_PRODUCTION_ANIMATIONS
    );

    for (let i = 0; i < animationCount; i++) {
      const newAnimation: ProductionAnimation = {
        id: Date.now() + Math.random(),
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        amount: amount / animationCount,
        timestamp: Date.now(),
      };

      setProductionAnimations((prev) => {
        const updated = [...prev, newAnimation];
        return updated.length > MAX_PRODUCTION_ANIMATIONS
          ? updated.slice(-MAX_PRODUCTION_ANIMATIONS)
          : updated;
      });

      setTimeout(() => {
        setProductionAnimations((prev) =>
          prev.filter((anim) => anim.id !== newAnimation.id)
        );
      }, ANIMATION_CLEANUP_DELAY);
    }
  }, []);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setClickAnimations((prev) =>
        prev.filter((anim) => now - anim.timestamp < 1500)
      );
      setProductionAnimations((prev) =>
        prev.filter((anim) => now - anim.timestamp < 2500)
      );
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    clickAnimations,
    productionAnimations,
    notifications,
    clickMultiplier,
    addClickAnimation,
    addProductionAnimation,
    addNotification,
    removeNotification,
    setClickMultiplier,
  };
}
