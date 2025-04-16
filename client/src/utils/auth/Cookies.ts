import Cookies from "js-cookie";


const FORGOT_PASSWORD_COOKIES = () => {
    const FORGOT_PASSWORD_ATTEMPTS_COUNTER = Number(Cookies.get("forgotAttempts")) || 0;
    const FORGOT_PASSWORD_LOCKED_UNTIL = Number(Cookies.get("forgotLockedUntil")) || 0;

    return {FORGOT_PASSWORD_ATTEMPTS_COUNTER, FORGOT_PASSWORD_LOCKED_UNTIL};
}

const LOGIN_COOKIES = () => {
    const LOGIN_ATTEMPTS_COUNTER = Number(Cookies.get("attempts")) || 0;
    const LOGIN_LOCKED_UNTIL = Number(Cookies.get("lockedUntil")) || 0;
    return {LOGIN_ATTEMPTS_COUNTER, LOGIN_LOCKED_UNTIL};
}

const REGISTER_COOKIES = () => {
    const REGISTER_ATTEMPTS_COUNTER = Number(Cookies.get("registerAttempts")) || 0;
    const REGISTER_LOCKED_UNTIL = Number(Cookies.get("registerLockedUntil")) || 0;
    
    return {REGISTER_ATTEMPTS_COUNTER, REGISTER_LOCKED_UNTIL};
}


export {FORGOT_PASSWORD_COOKIES, LOGIN_COOKIES, REGISTER_COOKIES};