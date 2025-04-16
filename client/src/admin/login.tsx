import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminLoginAttempts } from "./hooks/first-auth-attempt";
import { formatTime } from "../utils/Time";

export default function AdminLoginForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [oneTimePassword, setOneTimePassword] = useState<string>('');

  const [toggleEmailError, setToggleEmailError] = useState<boolean>(false);
  const [toggleOneTimePassword, setToggleOneTimePassword] = useState<boolean>(false);
  const [togglePassword, setTogglePassword] = useState<boolean>(false);

  const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
  const [oneTimePasswordErrorMessage, setOneTimePasswordErrorMessage] = useState<string>('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');

  const navigate = useNavigate();

  const {
    registerAdminLoginAttempt,
    isLocked,
    lockTimeLeft,
    resetAttempts,
  } = useAdminLoginAttempts();


  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLocked) {
      setEmailErrorMessage(`Too many failed attempts. Try again in ${lockTimeLeft} seconds.`);
      setToggleEmailError(true);
      return;
    }

    if (!email.trim()) {
      setEmailErrorMessage("Email is required.");
      setToggleEmailError(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      
      setEmailErrorMessage("Invalid email format.");
      setToggleEmailError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/admin-first-auth',
        {
          method:"POST",
          credentials:'include',
          body:JSON.stringify({email})
        }
      );

      if(!response.ok){
          await registerAdminLoginAttempt(); // Register failure
          const errorMessage = await response.json();
          throw new Error(errorMessage.error || 'Error');
      }

      console.log(await response.json());
      resetAttempts(); // Reset on success
      setStep("otp");
    } catch (error) {
      setEmailErrorMessage(String(error).replace('Error: ',''));
      setToggleEmailError(true);
    }
  };

  const handleOTPSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLocked) {
      setOneTimePasswordErrorMessage(`Too many failed attempts. Try again in ${lockTimeLeft} seconds.`);
      setToggleOneTimePassword(true);
      return;
    }


    if (!/^\d{6}$/.test(oneTimePassword)) {
      setOneTimePasswordErrorMessage("OTP must be a 6-digit number.");
      setToggleOneTimePassword(true);
      return;
    }

    try {
      
      const response = await fetch("http://localhost:8080/admin-second-auth", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email, oneTimePassword }),
      });
  
      if (!response.ok) {
        await registerAdminLoginAttempt(); // Register failure
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      resetAttempts(); // Reset on success
      setStep("password");
    } catch (error) {
      setOneTimePasswordErrorMessage("Failed OTP validation.");
      setToggleOneTimePassword(true);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLocked) {
      setPasswordErrorMessage(`Too many failed attempts. Try again in ${lockTimeLeft} seconds.`);
      setTogglePassword(true);
      return;
    }

    if (!password.trim()) {
      setPasswordErrorMessage("Password is required.");
      setTogglePassword(true);
      return;
    }

    try {

      const response = await fetch('http://localhost:8080/admin-last-auth',
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ email, oneTimePassword, password }),
        }
      );
      
      if(!response.ok){
        await registerAdminLoginAttempt(); // Register failure
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      console.log(await response.json());

      resetAttempts(); // Reset on success
      setEmail('');
      setPassword('');
      setOneTimePassword('');
      navigate('/dashboard');
    } catch (error) {
      setPasswordErrorMessage("Incorrect password.");
      setTogglePassword(true);
    }
  };

  return (
    <section className="relative flex w-full items-center justify-center">
      <form
        onSubmit={
          step === "email"
            ? handleEmailSubmit
            : step === "otp"
              ? handleOTPSubmit
              : handlePasswordSubmit
        }
        className="absolute top-[20vh] w-85 md:w-100 flex flex-col space-y-3 shadow-xl border border-gray-200 p-6 rounded"
      >
        {step === "email" && (
          <>
            <h1 className="text-xl font-extrabold mb-4">Admin Login Form</h1>
            {isLocked && (
              <p className="text-red-500 text-sm">
                Too many failed attempts. Please wait {formatTime(lockTimeLeft)} seconds.
              </p>
            )}
            {toggleEmailError && <p className="text-red-500 text-sm">{emailErrorMessage}</p>}
            <section className="flex flex-col gap-1">
              <label htmlFor="login-email" className="text-base font-medium">Email</label>
              <input
                type="email"
                id="login-email"
                className="border border-gray-400 rounded px-2 py-2 text-base"
                placeholder="Enter your email..."
                autoComplete="current-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onClick={() => setToggleEmailError(false)}
                disabled={isLocked}
              />
            </section>
            <button type="submit" className={`${ isLocked ? 'bg-blue-800 text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'} rounded text-base font-medium py-2`}
            disabled={isLocked}>
            Next</button>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-xl font-extrabold mb-4">Enter OTP</h1>
            {isLocked && (
              <p className="text-red-500 text-sm">
                Too many failed attempts. Please wait {formatTime(lockTimeLeft)} seconds.
              </p>
            )}
            {toggleOneTimePassword && <p className="text-red-500 text-sm">{oneTimePasswordErrorMessage}</p>}
            <section className="flex flex-col gap-1">
              <label htmlFor="otp" className="text-base font-medium">OTP</label>
              <input
                type="text"
                id="otp"
                className="border border-gray-400 rounded px-2 py-2 text-base"
                placeholder="Enter your One-Time Password..."
                autoComplete="otp"
                value={oneTimePassword}
                onChange={(e) => setOneTimePassword(e.target.value)}
                onClick={() => setToggleOneTimePassword(false)}
                pattern="\d{6}"
                disabled={isLocked}
              />
              <p className="text-xs font-medium text-gray-600 tracking-tight mx-1">
                This form only accepts numerical numbers. <br />Example: 123456
              </p>
            </section>
            <button type="submit" className={`${ isLocked ? 'bg-blue-800 text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'} rounded text-base font-medium py-2`}
            disabled={isLocked}>
            Next</button>
          </>
        )}

        {step === "password" && (
          <>
            <h1 className="text-xl font-extrabold mb-4">Enter Password</h1>
            {isLocked && (
              <p className="text-red-500 text-sm">
                Too many failed attempts. Please wait {formatTime(lockTimeLeft)} seconds.
              </p>
            )}
            {togglePassword && <p className="text-red-500 text-sm">{passwordErrorMessage}</p>}
            <section className="flex flex-col gap-1">
              <label htmlFor="login-password" className="text-base font-medium">Password</label>
              <input
                type="password"
                id="login-password"
                className="border border-gray-400 rounded px-2 py-2 text-base"
                placeholder="Enter your password..."
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onClick={() => setTogglePassword(false)}
                disabled={isLocked}
              />
            </section>
            <p className="text-sm font-medium text-gray-800">
              <Link to="/forgot-password" className="hover:text-blue-600 hover:underline active:text-blue-900 active:underline">
                Forgot Password?
              </Link>
            </p>
            <button type="submit" className={`${ isLocked ? 'bg-blue-800 text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'} rounded text-base font-medium py-2`}
            disabled={isLocked}
            >Submit</button>
          </>
        )}
      </form>
    </section>
  );
}
