import { useState, useEffect, useCallback } from 'react';
import { OnboardingData } from '@/types/onboarding';

const GUEST_SESSION_KEY = 'guestOnboardingData';

interface GuestSession {
  data: OnboardingData | null;
  isGuest: boolean;
}

export const useGuestSession = () => {
  const [guestData, setGuestData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    if (stored) {
      try {
        setGuestData(JSON.parse(stored));
      } catch {
        localStorage.removeItem(GUEST_SESSION_KEY);
      }
    }
  }, []);

  const saveGuestSession = useCallback((data: OnboardingData) => {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(data));
    setGuestData(data);
  }, []);

  const clearGuestSession = useCallback(() => {
    localStorage.removeItem(GUEST_SESSION_KEY);
    setGuestData(null);
  }, []);

  const getGuestSession = useCallback((): GuestSession => {
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    if (stored) {
      try {
        return { data: JSON.parse(stored), isGuest: true };
      } catch {
        return { data: null, isGuest: false };
      }
    }
    return { data: null, isGuest: false };
  }, []);

  return {
    guestData,
    saveGuestSession,
    clearGuestSession,
    getGuestSession,
    hasGuestSession: !!guestData,
  };
};
