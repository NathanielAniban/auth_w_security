import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { LOGIN_COOKIES } from "../../utils/auth/Cookies";
export function useLoginAttempts() {
  const ATTEMPT_LIMIT = 5;
  const {LOGIN_ATTEMPTS_COUNTER, LOGIN_LOCKED_UNTIL} = LOGIN_COOKIES();

  const [attempts, setAttempts] = useState<number>(LOGIN_ATTEMPTS_COUNTER);
  const [isLocked, setIsLocked] = useState<boolean>(LOGIN_LOCKED_UNTIL > Date.now());
  const [lockTimeLeft, setLockTimeLeft] = useState<number>(
    LOGIN_LOCKED_UNTIL > Date.now() ? Math.floor((LOGIN_LOCKED_UNTIL - Date.now()) / 1000) : 0
  );
  const removeAttempts = Cookies.remove('attempts');

  // Helper: call server timeout endpoint
  const TIMEOUT = async () => {
    try {
      const response = await fetch("http://localhost:8080/login-timeout", {
        method: "GET",
        credentials: "include",
      });
      const result = await response.json();

      if (response.status === 400 && result?.data) {
        const expiresAt = result.data * 1000; // server sends UNIX timestamp
        Cookies.set("lockedUntil", String(expiresAt));
        setIsLocked(true);
        setLockTimeLeft(Math.floor((expiresAt - Date.now()) / 1000));
      } else if (response.status === 200 && result?.data) {
        const expiresAt = result.data * 1000;
        Cookies.set("lockedUntil", String(expiresAt));
        setIsLocked(true);
        setLockTimeLeft(Math.floor((expiresAt - Date.now()) / 1000));
      }
    } catch (error) {
      console.error("Timeout API failed:", error);
    }
  };

  const registerLoginAttempts = async () => {
    if (isLocked) {
      console.log("Currently locked. Please wait.");
      return;
    }

    const newAttempts = attempts + 1;

    if (newAttempts >= ATTEMPT_LIMIT) {
      // Hit the timeout API to lock
      await TIMEOUT();
      Cookies.remove("attempts");
      setAttempts(0);
    } else {
      Cookies.set("attempts", String(newAttempts));
      setAttempts(newAttempts);
      console.log("Attempt Registered:", newAttempts);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const lockedUntil = Number(Cookies.get("lockedUntil")) || 0;
      const now = Date.now();

      if (lockedUntil > now) {
        const secondsLeft = Math.floor((lockedUntil - now) / 1000);
        setLockTimeLeft(secondsLeft);
      } else {
        setIsLocked(false);
        setLockTimeLeft(0);
        Cookies.remove("lockedUntil");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { registerLoginAttempts, isLocked, attempts, lockTimeLeft, removeAttempts };
}
