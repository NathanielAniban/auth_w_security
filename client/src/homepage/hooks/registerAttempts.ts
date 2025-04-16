import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { REGISTER_COOKIES } from "../../utils/auth/Cookies";
export function useRegisterAttempts() {
  const ATTEMPT_LIMIT = 5;
  const {REGISTER_ATTEMPTS_COUNTER, REGISTER_LOCKED_UNTIL} = REGISTER_COOKIES();
  
  const [attempts, setAttempts] = useState<number>(REGISTER_ATTEMPTS_COUNTER);
  const [isLocked, setIsLocked] = useState<boolean>(REGISTER_LOCKED_UNTIL > Date.now());
  const [lockTimeLeft, setLockTimeLeft] = useState<number>(
    REGISTER_LOCKED_UNTIL > Date.now() ? Math.floor((REGISTER_LOCKED_UNTIL - Date.now()) / 1000) : 0
  );
  const removeAttempts = () => Cookies.remove("registerAttempts");

  // Helper: call server timeout endpoint
  const TIMEOUT = async () => {
    try {
      const response = await fetch("http://localhost:8080/register-timeout", {
        method: "GET",
        credentials: "include",
      });
      const result = await response.json();

      if (response.status === 400 && result?.data) {
        const expiresAt = result.data * 1000; // server sends UNIX timestamp
        Cookies.set("registerLockedUntil", String(expiresAt));
        setIsLocked(true);
        setLockTimeLeft(Math.floor((expiresAt - Date.now()) / 1000));
      } else if (response.status === 200 && result?.data) {
        const expiresAt = result.data * 1000;
        Cookies.set("registerLockedUntil", String(expiresAt));
        setIsLocked(true);
        setLockTimeLeft(Math.floor((expiresAt - Date.now()) / 1000));
      }
    } catch (error) {
      console.error("Timeout API failed:", error);
    }
  };

  const registerRegisterAttempts = async () => {
    if (isLocked) {
      console.log("Currently locked. Please wait.");
      return;
    }

    const newAttempts = attempts + 1;

    if (newAttempts >= ATTEMPT_LIMIT) {
      await TIMEOUT();
      Cookies.remove("registerAttempts");
      setAttempts(0);
    } else {
      Cookies.set("registerAttempts", String(newAttempts));
      setAttempts(newAttempts);
      console.log("Register Attempt Registered:", newAttempts);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const lockedUntil = Number(Cookies.get("registerLockedUntil")) || 0;
      const now = Date.now();

      if (lockedUntil > now) {
        const secondsLeft = Math.floor((lockedUntil - now) / 1000);
        setLockTimeLeft(secondsLeft);
      } else {
        setIsLocked(false);
        setLockTimeLeft(0);
        Cookies.remove("registerLockedUntil");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { registerRegisterAttempts, isLocked, attempts, lockTimeLeft, removeAttempts };
}
