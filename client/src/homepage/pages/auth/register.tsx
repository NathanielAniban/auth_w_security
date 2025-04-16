import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterAttempts } from '../../hooks/registerAttempts';

export default function Register() {
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [confirmAgreement, setConfirmAgreement] = useState(false);

  const [toggleError, setToggleError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const {
    registerRegisterAttempts,
    isLocked,
    lockTimeLeft,
    attempts
  } = useRegisterAttempts();

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmAgreement(e.target.checked);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setToggleError(false);
    };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLocked) {
      setToggleError(true);
      setErrorMessage(`Too many attempts. Try again in ${lockTimeLeft} seconds.`);
      return;
    }

    if (!confirmAgreement) {
      setToggleError(true);
      setErrorMessage('Please accept terms and condition. Please try again.');
      await registerRegisterAttempts();
      return;
    }

    if (password !== confirmpassword) {
      setToggleError(true);
      setErrorMessage('Passwords do not match. Please try again.');
      await registerRegisterAttempts();
      return;
    }

    if ([email, firstname, lastname, password, confirmpassword].some(val => val.trim() === '')) {
      setToggleError(true);
      setErrorMessage('Please fill out all fields.');
      await registerRegisterAttempts();
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email, firstname, lastname, password, confirmpassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      await response.json();
      setEmail('');
      setFirstname('');
      setLastname('');
      setPassword('');
      setConfirmPassword('');
      alert('Registered Successfully!');
      navigate('/login');
    } catch (error: any) {
      setToggleError(true);
      setErrorMessage(error.message || 'Registration failed.');
      await registerRegisterAttempts();
    }
  };

  return (
    <section className="relative flex w-full items-center justify-center">
      <form onSubmit={submitForm} className="my-10 flex flex-col w-85 md:w-auto space-y-4 shadow-xl border border-gray-200 p-6 rounded">
        <h1 className="text-xl font-extrabold mb-4">Register Form</h1>

        {toggleError && (
          <p className="text-red-500 text-sm font-medium text-center">{errorMessage}</p>
        )}

        {isLocked && (
          <p className="text-yellow-600 text-sm font-semibold text-center">
            Too many attempts. Please wait {lockTimeLeft} second{lockTimeLeft !== 1 ? 's' : ''}.
          </p>
        )}

        <section className="flex flex-col md:flex-row gap-3">
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="register-firstname" className="text-base font-semibold">First Name</label>
            <input
              type="text"
              id="register-firstname"
              className="border border-gray-400 rounded px-3 py-2 text-base"
              placeholder="Enter your first name..."
              autoComplete="given-name"
              value={firstname}
              onChange={handleInputChange(setFirstname)}
              disabled={isLocked}
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="register-lastname" className="text-base font-semibold">Last Name</label>
            <input
              type="text"
              id="register-lastname"
              className="border border-gray-400 rounded px-3 py-2 text-base"
              placeholder="Enter your last name..."
              autoComplete="family-name"
              value={lastname}
              onChange={handleInputChange(setLastname)}
              disabled={isLocked}
            />
          </div>
        </section>

        <div className="flex flex-col gap-1">
          <label htmlFor="register-email" className="text-base font-semibold">Email</label>
          <input
            type="email"
            id="register-email"
            className="border border-gray-400 rounded px-3 py-2 text-base"
            placeholder="Enter your email..."
            autoComplete="email"
            value={email}
            onChange={handleInputChange(setEmail)}
            disabled={isLocked}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="register-password" className="text-base font-semibold">Password</label>
          <input
            type="password"
            id="register-password"
            className="border border-gray-400 rounded px-3 py-2 text-base"
            placeholder="Enter your password..."
            autoComplete="new-password"
            value={password}
            onChange={handleInputChange(setPassword)}
            disabled={isLocked}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="register-confirm-password" className="text-base font-semibold">Confirm Password</label>
          <input
            type="password"
            id="register-confirm-password"
            className="border border-gray-400 rounded px-3 py-2 text-base"
            placeholder="Confirm your password..."
            autoComplete="new-password"
            value={confirmpassword}
            onChange={handleInputChange(setConfirmPassword)}
            disabled={isLocked}
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="condition"
            checked={confirmAgreement}
            onChange={handleAgreementChange}
            autoComplete="check-condition"
            disabled={isLocked}
          />
          <label htmlFor="condition" className="cursor-pointer text-xs font-medium leading-snug">
            By clicking this you agree to our terms and conditions.
          </label>
        </div>
        {
          toggleError && <p className="text-xs font-medium">Attempts: {attempts}/5</p>
        }
        <p className="text-sm font-medium text-gray-800">
          <Link to="/forgot-password" className="hover:text-blue-600 hover:underline active:text-blue-900 active:underline">
            Forgot Password?
          </Link>
        </p>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition rounded text-base font-medium py-2 text-white"
          disabled={isLocked}
        >
          Submit
        </button>

        <p className="text-sm font-medium text-gray-700 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </section>
  );
}
