import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useLoginAttempts} from "../../hooks/loginAttempts";
import { formatTime } from "../../../utils/Time";

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [toggleError, setToggleError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string> ('');
  const navigate = useNavigate();

  const { registerLoginAttempts, isLocked, attempts, lockTimeLeft, removeAttempts} = useLoginAttempts();

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (email.trim() === '' || password.trim() === '') {
      setToggleError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        credentials: 'include', // important
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await response.json();
      console.log('Success:', data);
      removeAttempts;
      navigate('/dashboard');
    } catch (error) {
      setToggleError(true);
      setErrorMessage(String(error).replace('Error:', ''));
      registerLoginAttempts();
      
    }
  };

  return (
    <section className="relative flex w-full items-center justify-center">
      <form onSubmit={submitForm} className="absolute top-[20vh] w-85 md:w-100 flex flex-col space-y-3 shadow-xl border border-gray-200 p-6 rounded">
        <h1 className="text-xl font-extrabold mb-4">Login Form</h1>

        {toggleError && (
          <p className="text-red-500 text-xs font-medium">
            {errorMessage}
          </p>
        )}

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
            onClick={() => setToggleError(false)}
            disabled={isLocked}
          />
        </section>

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
            onClick={() => setToggleError(false)}
            disabled={isLocked}
          />
        </section>

        <p className="text-sm font-medium text-gray-800">
          <Link to="/forgot-password" className="hover:text-blue-600 hover:underline active:text-blue-900 active:underline">
            Forgot Password?
          </Link>
        </p>

        <button type="submit" 
        className="bg-blue-600 rounded text-base font-medium py-2 mb-1 text-white"
        disabled={isLocked}>
          Submit
        </button>
        {
          isLocked ? <p className="text-red-500 text-xs font-medium">Locked: {formatTime(lockTimeLeft)}</p> : ''
        }
         {toggleError && attempts <= 5 && attempts > 0 && (
          <p className="text-red-500 text-xs font-medium">Attempts: {attempts}/5</p>
        )}

        <p className="text-sm font-medium text-gray-800">
          Not Registered?&nbsp;
          <Link to="/register" className="hover:text-blue-600 hover:underline active:text-blue-900 active:underline">
            Sign up
          </Link>
        </p>
      </form>
    </section>
  );
}
