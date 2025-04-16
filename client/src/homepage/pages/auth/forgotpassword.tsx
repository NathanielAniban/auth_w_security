import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForgotPasswordAttempts } from "../../hooks/forgotPasswordsAttempts"; // (fix typo, it was "forgotPasswordsAttempts")
import Cookies from "js-cookie";
import { formatTime } from "../../../utils/Time";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [oneTimePassword, setOneTimePassword] = useState<string>('');
  const [toggleError, setToggleError] = useState<boolean>(false);
  const [changePasswordErrorMessage, setChangePasswordErrorMessage] = useState <string>('');
  const [changePasswordToggleError, setChangePasswordToggleError] = useState <boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [togglePin, setTogglePin] = useState<boolean>(false);
  const [toggleChangePasswordForm, setToggleChangePasswordForm] = useState<boolean>(false);
  const { isLocked, lockTimeLeft, registerForgotPasswordAttempt, removeAttempts, setAttempts } = useForgotPasswordAttempts();
  const [otpCountdown, setOTPCountdown] = useState<number>(0);
  const navigate = useNavigate();
  useEffect(() => {
    const interval = setInterval(() => {
      const lockedUntilSeconds = Number(Cookies.get("copy-of-otp-timeout")) || 0;
      const lockedUntil = lockedUntilSeconds * 1000; // convert to ms
      const now = Date.now();

      if (lockedUntil > now) {
        const secondsLeft = Math.floor((lockedUntil - now) / 1000);
        setOTPCountdown(secondsLeft);
      } else {
        setTogglePin(false);
        setToggleError(false);
        removeAttempts();
        setAttempts(0);
        setOTPCountdown(0); // reset to 0 when expired
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

 
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (email.trim() === '') return null;

    if (isLocked) {
      console.log('You are currently locked out.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/create-otp', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        await registerForgotPasswordAttempt(); // Register a failed attempt
        throw new Error(data.error || 'An error occurred');
      }

      console.log(data);
      setTogglePin(true); // Switch to OTP form
    } catch (error: any) {
      await registerForgotPasswordAttempt(); // Also count attempt when catch error
      setToggleError(true);
      setErrorMessage(error.message || 'Something went wrong');
      console.error(error);
    }
  };

  const submitOTPform = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim() === '') { setTogglePin(false); return null; }
    if (oneTimePassword.trim() === '') return null;
    console.log(oneTimePassword);
    try {
      const response = await fetch('http://localhost:8080/verify-otp', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email, otp: oneTimePassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP Verification Failed');
      }
      
      console.log('OTP Verified Successfully:', data);
      Cookies.set('temporary_profile_key', data.profile_key);
      setToggleChangePasswordForm(true);
      alert('OTP Verified Successfully!');
    } catch (error: any) {
      setToggleError(true);
      console.log(error.data);
      setErrorMessage(error.message || 'Something went wrong');
      await registerForgotPasswordAttempt();
      setToggleChangePasswordForm(false);
      console.error(error);
    }
  };

  const submitNewPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (newPassword.trim() === '' || confirmPassword.trim() === '') {
      setChangePasswordToggleError(!changePasswordToggleError);
      setChangePasswordErrorMessage('Fields cannot be empty.');
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setChangePasswordToggleError(!changePasswordToggleError);
      setChangePasswordErrorMessage('Passwords do not match. Please try again.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8080/change-password-via-otp', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          email,
          newPassword,
          confirmPassword,
          profile_key: Cookies.get('temporary_profile_key'),
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong.');
      }
  
      Cookies.remove('temporary_profile_key');
      console.log('Password changed successfully.');
      alert('Password Change Successfully!');
      navigate('/login');
      // Maybe show a success message or redirect user
      setChangePasswordErrorMessage('');
      setToggleError(false);
      // e.g. show toast or redirect
    } catch (error: any) {
      console.error(error.message);
      setToggleError(true);
      setChangePasswordErrorMessage(error.message);
    }
  };

  
  if (!Boolean(Cookies.get('copy-of-otp-timeout'))) {
    Cookies.remove('forgotLockedUntil');
    Cookies.remove('ForgotPaswordTimeout');
  }

  return (
    <section className="relative flex w-full items-center justify-center">

      {
        toggleChangePasswordForm ?
          (
            <form
              onClick={submitNewPassword}
              className="absolute top-[20vh] w-85 md:w-100 flex flex-col space-y-3 shadow-xl border border-gray-200 p-6 rounded"
            >
              <h1 className="text-xl font-extrabold mb-4">Change your password</h1>
              {changePasswordErrorMessage ? <p className="text-red-500 text-sm font-medium">{changePasswordErrorMessage}</p> : ''}
              <section className="flex flex-col gap-1">
                <label htmlFor="new-password" className="text-base font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  className="border border-gray-400 rounded px-2 py-2 text-base"
                  placeholder="Enter your New password..."
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onClick={() => setChangePasswordToggleError(false)}
                />
              </section>
              <section className="flex flex-col gap-1">
                <label htmlFor="confirm-password" className="text-base font-medium">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="border border-gray-400 rounded px-2 py-2 text-base"
                  placeholder="Enter your New password..."
                  autoComplete="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onClick={() => setChangePasswordToggleError(false)}
                />
              </section>
              <button
                type="submit"
                className="bg-blue-600 rounded text-base font-medium py-2 mt-2 text-white"
              >
                Send OTP
              </button>

            </form>
          )
          :
          (
            <form
              onSubmit={togglePin ? submitOTPform : submitForm}
              className="absolute top-[20vh] w-85 md:w-100 flex flex-col space-y-3 shadow-xl border border-gray-200 p-6 rounded"
            >
              {togglePin ? (
                <>
                  <h1 className="text-xl font-extrabold mb-4">Enter OTP</h1>
                  {toggleError && <p className="text-red-500 text-sm font-medium">{errorMessage}</p>}
                  <section className="flex flex-col gap-1">
                    <label htmlFor="otp" className="text-base font-medium">
                      OTP
                    </label>
                    <input
                      type="text"
                      id="otp"
                      className="border border-gray-400 rounded px-2 py-2 text-base"
                      placeholder="Enter your One-Time Password..."
                      autoComplete="otp"
                      value={oneTimePassword}
                      onChange={(e) => setOneTimePassword(e.target.value)}
                      onClick={() => setToggleError(false)}
                      pattern="\d{6}"
                      disabled={isLocked}
                    />
                    <p className="text-xs font-medium text-gray-600 tracking-tight mx-1">
                      This form only accepts numerical numbers. <br />Example: 123456
                    </p>
                  </section>
                  {otpCountdown > 0 && <p className="text-red-500 text-center text-xs font-medium"> One-Time Password valid until: {formatTime(otpCountdown)} seconds</p>}

                  <button
                    type="submit"
                    className="bg-blue-600 rounded text-base font-medium py-2 mb-1 text-white"
                    disabled={isLocked}
                  >
                    Submit
                  </button>
                  {isLocked ? <p className="text-sm font-medium text-red-700">timeout unlocked until: {lockTimeLeft}</p> : ''}
                </>
              ) : (
                <>
                  <h1 className="text-xl font-extrabold mb-4">Forgot Password?</h1>
                  {toggleError && <p className="text-red-500">{errorMessage}</p>}
                  <section className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-base font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="border border-gray-400 rounded px-2 py-2 text-base"
                      placeholder="Enter your email..."
                      autoComplete="current-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onClick={() => setToggleError(false)}
                    />
                  </section>
                  <p className="text-sm font-medium text-gray-800">
                    Not Registered?&nbsp;
                    <Link to="/register" className="hover:text-blue-600 hover:underline active:text-blue-900 active:underline">
                      Sign up
                    </Link>
                  </p>
                  <button
                    type="submit"
                    className="bg-blue-600 rounded text-base font-medium py-2 text-white"
                  >
                    Send OTP
                  </button>
                </>
              )}
              <Link to="/login" className="text-sm text-blue-600 hover:underline mt-3 text-center">
                Back to Login
              </Link>
            </form>
          )
      }


    </section>
  );
}
