import { useState } from "react";
import { NavLink, useLocation} from "react-router-dom";
import { Menu } from "lucide-react";
export default function NavigationBar(){

    const [toggle, setToggle] = useState <boolean> (false);
    const router : any[] = [
        {path:'/dashboard/settings', name: 'Settings'},
    ];

    function isActiveParent(target:string) {
        const location = useLocation();
        const pathSegments = location.pathname.split('/');
        return pathSegments[1] === target && pathSegments.length === 2;
      }

    async function Logout(){
       
        const checkAuth = async () => {
            try {
            const response = await fetch('http://localhost:8080/logout', {
                method: 'GET',
                credentials: 'include',
            });
    
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Something went wrong');
            }
            const data = await response.json();
            console.log('Authenticated:', data);
            } catch (error) {
            console.error('Not authenticated:', error);
            }
        };
            
        await checkAuth(); // 🔥 only run once
    }

    return(
        <header className="bg-gray-50 w-full flex py-5 justify-between">
            <hgroup className="flex flex-col mx-5" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <h1 className="text-base font-medium">Logo</h1>
            </hgroup>
            <nav className="flex flex-col mx-5">
                <Menu
                onClick={() => {setToggle(!toggle)}}
                className="block md:hidden"
                />
                <ol className={`${toggle ? 'translate-y-10' : '-translate-y-100 invisible'} absolute left-0 md:translate-y-0 md:visible  md:static text-base font-medium flex flex-col 
                px-5 py-3 md:py-0 md:px-0 md:flex-row bg-gray-50 w-full space-y-5 md:space-y-0 md:gap-5
                transition-all ease-in-out duration-300
                `}>
                
                <NavLink to={'/dashboard'} className={ isActiveParent('dashboard') ? 'underline' : ''}>
                    <li>Dashboard</li>
                </NavLink>
                   {router.map((route, index) => 
                        <NavLink key={index} to={route.path} className={({ isActive }) => isActive ? "underline text-gray-900" : "text-gray-600 hover:text-gray-900 hover:underline"}>
                            <li>{route.name}</li>
                        </NavLink>
                )}
                     <NavLink to={'/login'} 
                    className={({isActive}) => `${isActive ? 'underline' : ''}`}
                    onClick={() => {Logout()}}>
                        <li>Logout</li>
                    </NavLink>
                </ol>
            </nav>
        </header>
    )
}