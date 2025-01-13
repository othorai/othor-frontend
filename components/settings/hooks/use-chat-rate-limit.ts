import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

const HOUR_IN_MS = 3600000; // 1 hour in milliseconds
const STORAGE_KEY = 'chatRateLimit';

interface RateLimitData {
  count: number;
  lastReset: number;
}

export const useChatRateLimit = () => {
  const { toast } = useToast();
  const [messageCount, setMessageCount] = useState(0);
  const [lastReset, setLastReset] = useState(Date.now());
  
  const maxMessagesPerHour = process.env.NEXT_PUBLIC_CHATBOT_LIMIT_PER_HOUR 
    ? Number(process.env.NEXT_PUBLIC_CHATBOT_LIMIT_PER_HOUR) 
    : null;

  // Load initial state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: RateLimitData = JSON.parse(stored);
      const now = Date.now();
      
      if (now - data.lastReset >= HOUR_IN_MS) {
        // Reset if an hour has passed
        setMessageCount(0);
        setLastReset(now);
        updateStorage(0, now);
      } else {
        // Restore previous state
        setMessageCount(data.count);
        setLastReset(data.lastReset);
      }
    }
  }, []);

  // Reset counter every hour
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageCount(0);
      const now = Date.now();
      setLastReset(now);
      updateStorage(0, now);
    }, HOUR_IN_MS);

    return () => clearInterval(interval);
  }, []);

  const updateStorage = (count: number, resetTime: number) => {
    const data: RateLimitData = { count, lastReset: resetTime };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const canSendMessage = () => {
    if (maxMessagesPerHour === null) return true;
    
    const now = Date.now();
    if (now - lastReset >= HOUR_IN_MS) {
      setMessageCount(0);
      setLastReset(now);
      updateStorage(0, now);
      return true;
    }
    
    return messageCount < maxMessagesPerHour;
  };

  const incrementMessageCount = () => {
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    updateStorage(newCount, lastReset);
  };

  const getRemainingMessages = () => {
    if (maxMessagesPerHour === null) return null;
    return Math.max(0, maxMessagesPerHour - messageCount);
  };

  const getTimeUntilReset = () => {
    const now = Date.now();
    return Math.max(0, HOUR_IN_MS - (now - lastReset));
  };

  return {
    canSendMessage,
    incrementMessageCount,
    getRemainingMessages,
    getTimeUntilReset,
    messageCount,
    maxMessagesPerHour
  };
};