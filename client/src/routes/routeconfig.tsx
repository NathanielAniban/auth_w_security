import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import HomepageLayout from "../homepage";
import HomePage from "../homepage/pages/home";
import AboutPage from "../homepage/pages/about";
import ServicesPage from "../homepage/pages/services";
import ContactPage from "../homepage/pages/contact";
import Login from "../homepage/pages/auth/login";
import Register from "../homepage/pages/auth/register";
import ForgotPassword from "../homepage/pages/auth/forgotpassword";

import DashboardLayout from "../dashboard";
import Dashboard from "../dashboard/pages/home";
import Settings from "../dashboard/pages/settings";

import AdminLoginForm from "../admin/login";

// --- a ProtectedRoute component ---
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        fetch('http://localhost:8080/profile-key', {
            method: 'GET',
            credentials: 'include',
        })
        .then(async (response) => {
            if (!response.ok) {
                const message = await response.json();
                throw new Error(message.error || 'Error');
            }
            return response.json();
        })
        .then(() => {
            setLoggedIn(true);
        })
        .catch((error) => {
            console.error(error);
            setLoggedIn(false);
        });
    }, []);

    if (loggedIn === null) {
        return <div className="w-full text-xl font-extrabold absolute top-[50vh] text-center flex items-center justify-center animate-pulse">Loading...</div>; // Or a spinner
    }

    if (!loggedIn) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

function RedirectToDashboard ({ children }: {children : React.ReactNode}){
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        fetch('http://localhost:8080/profile-key', {
            method: 'GET',
            credentials: 'include',
        })
        .then(async (response) => {
            if (!response.ok) {
                const message = await response.json();
                throw new Error(message.error || 'Error');
            }
            return response.json();
        })
        .then(() => {
            setLoggedIn(true);
        })
        .catch((error) => {
            setLoggedIn(!Boolean(error));
        });
    }, []);

    if (loggedIn === null) {
        return <div className="w-full text-xl font-extrabold absolute top-[50vh] text-center flex items-center justify-center animate-pulse">Loading...</div>; // Or a spinner
    }

    if (loggedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomepageLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'about', element: <AboutPage /> },
            { path: 'services', element: <ServicesPage /> },
            { path: 'contact', element: <ContactPage /> },
            { path: 'login', element: 
            <RedirectToDashboard>
                <Login />
            </RedirectToDashboard>},
             { path: 'forgot-password', element: 
                <RedirectToDashboard>
                    <ForgotPassword />
                </RedirectToDashboard>},
            { path: 'register', element: 
            <RedirectToDashboard>
                <Register/>
            </RedirectToDashboard>},
              { path: 'admin-login', element: 
                <RedirectToDashboard>
                    <AdminLoginForm/>
                </RedirectToDashboard>},
        ],
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'settings', element: <Settings /> },

        ],
    },
]);

export default function RouteConfig() {
    return <RouterProvider router={router} />;
}
