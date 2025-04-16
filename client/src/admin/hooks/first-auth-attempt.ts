// hooks/useAdminLoginAttempts.ts
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const ATTEMPT_LIMIT = 5;
const COOKIE_KEYS = {
  ADMIN_LOGIN_ATTEMPTS: "adminLoginAttempts",
  ADMIN_LOCKED_UNTIL: "adminLockedUntil",
};

export function useAdminLoginAttempts() {
  const [attempts, setAttempts] = useState<number>(parseInt(Cookies.get(COOKIE_KEYS.ADMIN_LOGIN_ATTEMPTS) || "0"));
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockTimeLeft, setLockTimeLeft] = useState<number>(0);

  useEffect(() => {
    const lockedUntil = Number(Cookies.get(COOKIE_KEYS.ADMIN_LOCKED_UNTIL)) || 0;
    const now = Date.now();

    if (lockedUntil > now) {
      setIsLocked(true);
      setLockTimeLeft(Math.floor((lockedUntil - now) / 1000));
    } else {
      setIsLocked(false);
      Cookies.remove(COOKIE_KEYS.ADMIN_LOCKED_UNTIL);
    }

    const interval = setInterval(() => {
      const updatedLockedUntil = Number(Cookies.get(COOKIE_KEYS.ADMIN_LOCKED_UNTIL)) || 0;
      const current = Date.now();

      if (updatedLockedUntil > current) {
        setLockTimeLeft(Math.floor((updatedLockedUntil - current) / 1000));
      } else {
        setIsLocked(false);
        setLockTimeLeft(0);
        Cookies.remove(COOKIE_KEYS.ADMIN_LOCKED_UNTIL);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const registerAdminLoginAttempt = async () => {
    if (isLocked) return;

    const newAttempts = attempts + 1;

    if (newAttempts >= ATTEMPT_LIMIT) {
      const lockDuration = 60 * 2 * 1000; // 2 minutes lock
      const lockUntil = Date.now() + lockDuration;

      Cookies.set(COOKIE_KEYS.ADMIN_LOCKED_UNTIL, String(lockUntil));
      Cookies.remove(COOKIE_KEYS.ADMIN_LOGIN_ATTEMPTS);
      setAttempts(0);
      setIsLocked(true);
      setLockTimeLeft(Math.floor(lockDuration / 1000));
    } else {
      Cookies.set(COOKIE_KEYS.ADMIN_LOGIN_ATTEMPTS, String(newAttempts));
      setAttempts(newAttempts);
    }
  };

  const resetAttempts = () => {
    Cookies.remove(COOKIE_KEYS.ADMIN_LOGIN_ATTEMPTS);
    setAttempts(0);
  };

  return { registerAdminLoginAttempt, isLocked, attempts, lockTimeLeft, resetAttempts };
}
