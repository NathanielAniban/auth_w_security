// hooks/useForgotPasswordAttempts.ts
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {FORGOT_PASSWORD_COOKIES} from '../../utils/auth/Cookies'
export function useForgotPasswordAttempts() {
  const ATTEMPT_LIMIT = 5;
  const {FORGOT_PASSWORD_ATTEMPTS_COUNTER, FORGOT_PASSWORD_LOCKED_UNTIL} = FORGOT_PASSWORD_COOKIES();

  const [attempts, setAttempts] = useState<number>(FORGOT_PASSWORD_ATTEMPTS_COUNTER);
  const [isLocked, setIsLocked] = useState<boolean>(FORGOT_PASSWORD_LOCKED_UNTIL > Date.now());
  const [lockTimeLeft, setLockTimeLeft] = useState<number>(
    FORGOT_PASSWORD_LOCKED_UNTIL > Date.now() ? Math.floor((FORGOT_PASSWORD_LOCKED_UNTIL - Date.now()) / 1000) : 0
  );
  const removeAttempts = () => Cookies.remove('forgotAttempts');

  const TIMEOUT = async () => {
    try {
      const response = await fetch("http://localhost:8080/forgot-password-timeout", {
        method: "GET",
        credentials: "include",
      });
      const result = await response.json();

      if (response.status === 400 && result?.data) {
        const expiresAt = result.data * 1000; // server sends UNIX timestamp
        Cookies.set("forgotLockedUntil", String(expiresAt));
        setIsLocked(true);
        setLockTimeLeft(Math.floor((expiresAt - Date.now()) / 1000));
      } else if (response.status === 200 && result?.data) {
        const expiresAt = result.data * 1000;
        Cookies.set("forgotLockedUntil", String(expiresAt));
        setIsLocked(true);
        setLockTimeLeft(Math.floor((expiresAt - Date.now()) / 1000));
      }
    } catch (error) {
      console.error("Timeout API failed:", error);
    }
  };

  const registerForgotPasswordAttempt = async () => {
    if (isLocked) {
      console.log("Currently locked. Please wait.");
      return;
    }

    const newAttempts = attempts + 1;

    if (newAttempts >= ATTEMPT_LIMIT) {
      await TIMEOUT();
      Cookies.remove("forgotAttempts");
      setAttempts(0);
    } else {
      Cookies.set("forgotAttempts", String(newAttempts));
      setAttempts(newAttempts);
      console.log("Forgot password attempt registered:", newAttempts);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const lockedUntil = Number(Cookies.get("forgotLockedUntil")) || 0;
      const now = Date.now();

      if (lockedUntil > now) {
        const secondsLeft = Math.floor((lockedUntil - now) / 1000);
        setLockTimeLeft(secondsLeft);
      } else {
        setIsLocked(false);
        setLockTimeLeft(0);
        Cookies.remove("forgotLockedUntil");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { registerForgotPasswordAttempt, isLocked, attempts, lockTimeLeft, removeAttempts, setAttempts };
}
